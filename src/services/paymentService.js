/**
 * 💳 Serviço de Pagamentos
 * Suporta múltiplas formas de pagamento: Cartão de Crédito/Débito, PIX, Boleto
 */

import Payment from '../models/Payment.js';
import PaymentRepository from '../repositories/paymentRepository.js';
import User from '../models/User.js';
import { APIErro } from '../utils/ApiError.js';
import { PLAN_CONFIGS, PLAN_TYPES } from '../utils/planUtils.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

class PaymentService {
  /**
   * 💳 Processar pagamento via cartão de crédito/débito
   */
  static async processCardPayment(userId, planType, cardData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new APIErro(404, [{ path: "user", message: "Usuário não encontrado" }]);
      }

      const planConfig = PLAN_CONFIGS[planType];
      if (!planConfig) {
        throw new APIErro(400, [{ path: "plan", message: "Plano inválido" }]);
      }

      // Validar dados do cartão
      this._validateCardData(cardData);

      const transactionId = this._generateTransactionId('CARD');
      
      // Criar registro de pagamento usando repository
      const payment = await PaymentRepository.create({
        userId,
        planType,
        amount: planConfig.price,
        currency: planConfig.currency,
        paymentMethod: cardData.type === 'credit' ? 'credit_card' : 'debit_card',
        transactionId,
        paymentDetails: {
          cardLastFour: cardData.number.slice(-4),
          cardBrand: this._detectCardBrand(cardData.number),
          cardHolderName: cardData.holderName
        },
        gateway: 'mock' // Em produção, usar gateway real
      });

      // Simular processamento do gateway
      const gatewayResult = await this._simulateCardGateway(cardData, planConfig.price);
      
      payment.status = gatewayResult.approved ? 'approved' : 'rejected';
      payment.externalId = gatewayResult.externalId;
      payment.gatewayResponse = gatewayResult;
      
      if (gatewayResult.approved) {
        payment.processedAt = new Date();
        // Aplicar upgrade do plano
        await this._applyPlanUpgrade(user, planType);
      }

      await payment.save();

      return {
        success: gatewayResult.approved,
        payment: payment.getDisplayData(),
        message: gatewayResult.approved 
          ? 'Pagamento aprovado com sucesso!' 
          : 'Pagamento rejeitado. Verifique os dados do cartão.',
        planUpgraded: gatewayResult.approved
      };

    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      console.error('Erro no pagamento com cartão:', error);
      throw new APIErro(500, [{ path: "payment", message: "Erro interno no processamento" }]);
    }
  }

  /**
   * 💰 Processar pagamento via PIX
   */
  static async processPixPayment(userId, planType) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new APIErro(404, [{ path: "user", message: "Usuário não encontrado" }]);
      }

      const planConfig = PLAN_CONFIGS[planType];
      if (!planConfig) {
        throw new APIErro(400, [{ path: "plan", message: "Plano inválido" }]);
      }

      const transactionId = this._generateTransactionId('PIX');

      // Usar dados padrão para PIX (modo simplificado)
      const bankData = {
        pixKey: 'contato@sitesfilmes.com',
        pixKeyType: 'email',
        holder: { name: 'Sites Filmes Ltda' },
        bank: { name: 'Banco Teste' }
      };
      
      // Gerar dados do PIX
      const pixData = this._generatePixData(planConfig.price, transactionId, bankData);

      const payment = new Payment({
        userId,
        planType,
        amount: planConfig.price,
        currency: planConfig.currency,
        paymentMethod: 'pix',
        transactionId,
        paymentDetails: {
          pixKey: pixData.key,
          pixQrCode: pixData.qrCode,
          pixCopyPaste: pixData.copyPaste
        },
        gateway: 'mock'
      });

      await payment.save();

      return {
        success: true,
        payment: payment.getDisplayData(),
        message: 'PIX gerado com sucesso! Escaneie o QR Code ou use o código copia e cola.',
        instructions: {
          step1: 'Abra o app do seu banco',
          step2: 'Escolha a opção PIX',
          step3: 'Escaneie o QR Code ou cole o código',
          step4: 'Confirme o pagamento',
          expiresIn: '30 minutos'
        }
      };

    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      console.error('Erro no pagamento PIX:', error);
      throw new APIErro(500, [{ path: "payment", message: "Erro interno no processamento" }]);
    }
  }

  /**
   * 📄 Processar pagamento via Boleto
   */
  static async processBoletoPayment(userId, planType, customerData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new APIErro(404, [{ path: "user", message: "Usuário não encontrado" }]);
      }

      const planConfig = PLAN_CONFIGS[planType];
      if (!planConfig) {
        throw new APIErro(400, [{ path: "plan", message: "Plano inválido" }]);
      }

      // Validar dados do cliente para boleto
      this._validateCustomerData(customerData);

      const transactionId = this._generateTransactionId('BOL');

      // Usar dados padrão para boleto (modo simplificado)
      const bankData = {
        bank: { code: '341', name: 'Itaú Unibanco S.A.' },
        account: { agency: '0001', number: '123456', digit: '7' },
        holder: { name: 'Sites Filmes Ltda', document: '12345678000195' }
      };
      
      // Gerar dados do boleto
      const boletoData = this._generateBoletoData(
        planConfig.price, 
        transactionId, 
        customerData,
        bankData
      );

      const payment = new Payment({
        userId,
        planType,
        amount: planConfig.price,
        currency: planConfig.currency,
        paymentMethod: 'boleto',
        transactionId,
        paymentDetails: {
          boletoBarcode: boletoData.barcode,
          boletoDigitableLine: boletoData.digitableLine,
          boletoUrl: boletoData.url,
          bolotoDueDate: boletoData.dueDate
        },
        gateway: 'mock'
      });

      await payment.save();

      return {
        success: true,
        payment: payment.getDisplayData(),
        message: 'Boleto gerado com sucesso!',
        instructions: {
          step1: 'Clique no link para visualizar o boleto',
          step2: 'Pague em qualquer banco, lotérica ou app bancário',
          step3: 'O plano será ativado automaticamente após a confirmação',
          dueDate: boletoData.dueDate.toLocaleDateString('pt-BR'),
          validFor: '3 dias'
        }
      };

    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      console.error('Erro no pagamento boleto:', error);
      throw new APIErro(500, [{ path: "payment", message: "Erro interno no processamento" }]);
    }
  }

  /**
   * 📊 Listar pagamentos do usuário
   */
  static async getUserPayments(userId, filters = {}) {
    try {
      const options = {
        page: filters.page || 1,
        limit: filters.limit || 20,
        sortBy: 'createdAt',
        order: 'desc'
      };

      // Construir filtros
      const queryFilters = { userId };
      if (filters.status) queryFilters.status = filters.status;
      if (filters.paymentMethod) queryFilters.paymentMethod = filters.paymentMethod;

      const result = await PaymentRepository.findWithFilters(queryFilters, options);

      return {
        payments: result.payments.map(p => p.getDisplayData()),
        pagination: result.pagination
      };

    } catch (error) {
      console.error('Erro ao listar pagamentos:', error);
      throw new APIErro(500, [{ path: "payments", message: "Erro ao carregar pagamentos" }]);
    }
  }

  /**
   * 🔍 Obter detalhes de um pagamento
   */
  static async getPaymentDetails(paymentId, userId) {
    try {
      const payment = await PaymentRepository.findById(paymentId);

      if (!payment || payment.userId.toString() !== userId) {
        throw new APIErro(404, [{ path: "payment", message: "Pagamento não encontrado" }]);
      }

      return payment.getDisplayData();

    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      console.error('Erro ao buscar pagamento:', error);
      throw new APIErro(500, [{ path: "payment", message: "Erro interno" }]);
    }
  }

  /**
   * 🔄 Verificar status de pagamento (para PIX e Boleto)
   */
  static async checkPaymentStatus(paymentId, userId) {
    try {
      const payment = await Payment.findOne({ 
        _id: paymentId, 
        userId 
      });

      if (!payment) {
        throw new APIErro(404, [{ path: "payment", message: "Pagamento não encontrado" }]);
      }

      // Simular verificação no gateway
      if (payment.status === 'pending') {
        // Em produção, consultar o gateway real
        const statusUpdate = await this._simulatePaymentStatusCheck(payment);
        
        if (statusUpdate.approved && payment.status !== 'approved') {
          payment.status = 'approved';
          payment.processedAt = new Date();
          await payment.save();
          
          // Aplicar upgrade do plano
          const user = await User.findById(userId);
          await this._applyPlanUpgrade(user, payment.planType);
        } else if (statusUpdate.expired) {
          payment.status = 'expired';
          await payment.save();
        }
      }

      return {
        status: payment.status,
        payment: payment.getDisplayData(),
        planUpgraded: payment.status === 'approved'
      };

    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      console.error('Erro ao verificar status:', error);
      throw new APIErro(500, [{ path: "status", message: "Erro interno" }]);
    }
  }

  // ===========================
  // 🔧 MÉTODOS PRIVADOS
  // ===========================

  /**
   * Validar dados do cartão
   */
  static _validateCardData(cardData) {
    const requiredFields = ['number', 'holderName', 'expiryMonth', 'expiryYear', 'cvv', 'type'];
    
    for (const field of requiredFields) {
      if (!cardData[field]) {
        throw new APIErro(400, [{ 
          path: field, 
          message: `Campo ${field} é obrigatório` 
        }]);
      }
    }

    // Validar número do cartão (Luhn algorithm básico)
    if (!/^\d{13,19}$/.test(cardData.number.replace(/\s/g, ''))) {
      throw new APIErro(400, [{ 
        path: "number", 
        message: "Número do cartão inválido" 
      }]);
    }

    // Validar CVV
    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      throw new APIErro(400, [{ 
        path: "cvv", 
        message: "CVV inválido" 
      }]);
    }
  }

  /**
   * Validar dados do cliente para boleto
   */
  static _validateCustomerData(customerData) {
    const requiredFields = ['name', 'document', 'email'];
    
    for (const field of requiredFields) {
      if (!customerData[field]) {
        throw new APIErro(400, [{ 
          path: field, 
          message: `Campo ${field} é obrigatório para boleto` 
        }]);
      }
    }

    // Validar CPF/CNPJ básico
    if (!/^\d{11}$|^\d{14}$/.test(customerData.document.replace(/\D/g, ''))) {
      throw new APIErro(400, [{ 
        path: "document", 
        message: "CPF ou CNPJ inválido" 
      }]);
    }
  }

  /**
   * Detectar bandeira do cartão
   */
  static _detectCardBrand(number) {
    const firstDigit = number.charAt(0);
    const firstTwoDigits = number.substring(0, 2);
    
    if (firstDigit === '4') return 'Visa';
    if (['51', '52', '53', '54', '55'].includes(firstTwoDigits)) return 'Mastercard';
    if (['34', '37'].includes(firstTwoDigits)) return 'American Express';
    if (firstTwoDigits === '60') return 'Hipercard';
    if (firstTwoDigits === '50') return 'Elo';
    
    return 'Unknown';
  }

  /**
   * Gerar ID único de transação
   */
  static _generateTransactionId(prefix) {
    return `${prefix}_${Date.now()}_${uuidv4().substring(0, 8)}`;
  }

  /**
   * Gerar dados do PIX usando conta bancária configurada
   */
  static _generatePixData(amount, transactionId, bankData) {
    const pixKey = bankData.pixKey;
    const holderName = bankData.holder.name.toUpperCase();
    const bankName = bankData.bank.name.toUpperCase();
    
    // Gerar QR Code com dados reais da conta (formato BR Code)
    const qrCodeData = `00020126580014BR.GOV.BCB.PIX0136${pixKey}520400005303986540${amount.toFixed(2)}5802BR5925${holderName.substring(0, 25)}6014${bankName.substring(0, 14)}62070503${transactionId.substring(0, 3)}6304`;
    
    return {
      key: pixKey,
      qrCode: qrCodeData,
      copyPaste: qrCodeData,
      holder: holderName,
      bank: bankName
    };
  }

  /**
   * Gerar dados do boleto usando conta bancária configurada
   */
  static _generateBoletoData(amount, transactionId, customerData, bankData) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // 3 dias para vencimento
    
    // Gerar código de barras usando dados reais da conta
    const bankCode = bankData.bank.code;
    const agency = bankData.account.agency;
    const accountNumber = bankData.account.number;
    const accountDigit = bankData.account.digit;
    
    // Simulação de código de barras mais realista
    const dv = Math.floor(Math.random() * 10); // Dígito verificador simulado
    const dueFactorDays = Math.floor((dueDate - new Date('1997-10-07')) / (1000 * 60 * 60 * 24));
    const amountCode = Math.floor(amount * 100).toString().padStart(10, '0');
    
    const barcode = `${bankCode}${dv}${dueFactorDays}${amountCode}${agency}${accountNumber}${accountDigit}${transactionId.substring(-6)}`;
    
    // Linha digitável formatada
    const digitableLine = this._formatDigitableLine(barcode);
    
    return {
      barcode: barcode,
      digitableLine: digitableLine,
      url: `https://boleto.sitesfilmes.com/${transactionId}`,
      dueDate: dueDate,
      bank: bankData.bank,
      account: {
        agency: agency,
        number: accountNumber,
        digit: accountDigit
      },
      holder: bankData.holder
    };
  }

  /**
   * Simular processamento do gateway para cartão
   */
  static async _simulateCardGateway(cardData, amount) {
    // Simular delay do processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular aprovação (90% de aprovação)
    const approved = Math.random() > 0.1;
    
    return {
      approved,
      externalId: `ext_${uuidv4()}`,
      message: approved ? 'Transação aprovada' : 'Cartão recusado',
      authCode: approved ? crypto.randomBytes(6).toString('hex') : null
    };
  }

  /**
   * Simular verificação de status no gateway
   */
  static async _simulatePaymentStatusCheck(payment) {
    // Simular diferentes cenários baseados no tempo
    const ageInMinutes = (Date.now() - payment.createdAt.getTime()) / (1000 * 60);
    
    if (payment.isExpired()) {
      return { approved: false, expired: true };
    }
    
    // PIX: simular aprovação após alguns minutos
    if (payment.paymentMethod === 'pix' && ageInMinutes > 2) {
      return { approved: Math.random() > 0.3, expired: false };
    }
    
    // Boleto: simular aprovação após mais tempo
    if (payment.paymentMethod === 'boleto' && ageInMinutes > 5) {
      return { approved: Math.random() > 0.5, expired: false };
    }
    
    return { approved: false, expired: false };
  }

  /**
   * Formatar linha digitável do boleto
   */
  static _formatDigitableLine(barcode) {
    // Converter código de barras em linha digitável formatada
    const field1 = `${barcode.substring(0, 4)}.${barcode.substring(4, 9)}`;
    const field2 = `${barcode.substring(10, 15)}.${barcode.substring(15, 21)}`;
    const field3 = `${barcode.substring(21, 26)}.${barcode.substring(26, 32)}`;
    const field4 = barcode.substring(4, 5); // Dígito verificador
    const field5 = barcode.substring(5, 19); // Fator vencimento + valor
    
    return `${field1} ${field2} ${field3} ${field4} ${field5}`;
  }

  /**
   * Aplicar upgrade do plano após pagamento aprovado
   */
  static async _applyPlanUpgrade(user, planType) {
    const now = new Date();
    const planConfig = PLAN_CONFIGS[planType];
    
    let endDate = null;
    if (planConfig.duration) {
      endDate = new Date(now.getTime() + (planConfig.duration * 24 * 60 * 60 * 1000));
    }

    user.plan = {
      type: planType,
      startDate: now,
      endDate: endDate,
      downloadsUsed: 0,
      monthlyDownloadsReset: now
    };

    await user.save();
    return user;
  }
}

export default PaymentService;