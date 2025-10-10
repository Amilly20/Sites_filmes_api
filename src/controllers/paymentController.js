/**
 * 💳 Controller de Pagamentos
 * Gerencia todas as formas de pagamento: Cartão, PIX, Boleto
 */

import PaymentService from '../services/paymentService.js';
import { APIError } from '../utils/ApiError.js';
import { PLAN_TYPES } from '../utils/planUtils.js';

class PaymentController {
  /**
   * 💳 Processar pagamento via cartão de crédito/débito
   * POST /api/payments/card
   */
  static async processCardPayment(req, res) {
    try {
      const userId = req.user.userId;
      const { planType, cardData } = req.body;

      // Validar entrada
      if (!planType || !cardData) {
        throw new APIError(400, [{ 
          path: "body", 
          message: "Dados do plano e cartão são obrigatórios" 
        }]);
      }

      // Validar plano
      if (!Object.values(PLAN_TYPES).includes(planType)) {
        throw new APIError(400, [{ 
          path: "planType", 
          message: "Tipo de plano inválido" 
        }]);
      }

      const result = await PaymentService.processCardPayment(
        userId, 
        planType, 
        cardData
      );

      res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message,
        data: {
          payment: result.payment,
          planUpgraded: result.planUpgraded
        }
      });

    } catch (error) {
      if (error instanceof APIError) {
        return res.status(error.statusCode).json({
          success: false,
          message: "Erro no processamento do cartão",
          errors: error.errors
        });
      }

      console.error('Erro no controller de cartão:', error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  /**
   * 💰 Processar pagamento via PIX
   * POST /api/payments/pix
   */
  static async processPixPayment(req, res) {
    try {
      const userId = req.user.userId;
      const { planType } = req.body;

      // Validar entrada
      if (!planType) {
        throw new APIError(400, [{ 
          path: "planType", 
          message: "Tipo de plano é obrigatório" 
        }]);
      }

      // Validar plano
      if (!Object.values(PLAN_TYPES).includes(planType)) {
        throw new APIError(400, [{ 
          path: "planType", 
          message: "Tipo de plano inválido" 
        }]);
      }

      const result = await PaymentService.processPixPayment(userId, planType);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          payment: result.payment,
          instructions: result.instructions
        }
      });

    } catch (error) {
      if (error instanceof APIError) {
        return res.status(error.statusCode).json({
          success: false,
          message: "Erro no processamento do PIX",
          errors: error.errors
        });
      }

      console.error('Erro no controller PIX:', error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  /**
   * 📄 Processar pagamento via Boleto
   * POST /api/payments/boleto
   */
  static async processBoletoPayment(req, res) {
    try {
      const userId = req.user.userId;
      const { planType, customerData } = req.body;

      // Validar entrada
      if (!planType || !customerData) {
        throw new APIError(400, [{ 
          path: "body", 
          message: "Dados do plano e cliente são obrigatórios" 
        }]);
      }

      // Validar plano
      if (!Object.values(PLAN_TYPES).includes(planType)) {
        throw new APIError(400, [{ 
          path: "planType", 
          message: "Tipo de plano inválido" 
        }]);
      }

      const result = await PaymentService.processBoletoPayment(
        userId, 
        planType, 
        customerData
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          payment: result.payment,
          instructions: result.instructions
        }
      });

    } catch (error) {
      if (error instanceof APIError) {
        return res.status(error.statusCode).json({
          success: false,
          message: "Erro no processamento do boleto",
          errors: error.errors
        });
      }

      console.error('Erro no controller boleto:', error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  /**
   * 📊 Listar pagamentos do usuário
   * GET /api/payments
   */
  static async getUserPayments(req, res) {
    try {
      const userId = req.user.userId;
      const { 
        status, 
        paymentMethod, 
        limit = 20 
      } = req.query;

      const filters = {
        status,
        paymentMethod,
        limit: parseInt(limit)
      };

      const result = await PaymentService.getUserPayments(userId, filters);

      res.status(200).json({
        success: true,
        message: "Pagamentos recuperados com sucesso",
        data: result
      });

    } catch (error) {
      if (error instanceof APIError) {
        return res.status(error.statusCode).json({
          success: false,
          message: "Erro ao listar pagamentos",
          errors: error.errors
        });
      }

      console.error('Erro ao listar pagamentos:', error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  /**
   * 🔍 Obter detalhes de um pagamento
   * GET /api/payments/:id
   */
  static async getPaymentDetails(req, res) {
    try {
      const userId = req.user.userId;
      const { id: paymentId } = req.params;

      if (!paymentId) {
        throw new APIError(400, [{ 
          path: "id", 
          message: "ID do pagamento é obrigatório" 
        }]);
      }

      const payment = await PaymentService.getPaymentDetails(paymentId, userId);

      res.status(200).json({
        success: true,
        message: "Detalhes do pagamento recuperados",
        data: { payment }
      });

    } catch (error) {
      if (error instanceof APIError) {
        return res.status(error.statusCode).json({
          success: false,
          message: "Erro ao buscar pagamento",
          errors: error.errors
        });
      }

      console.error('Erro ao buscar pagamento:', error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  /**
   * 🔄 Verificar status de pagamento
   * GET /api/payments/:id/status
   */
  static async checkPaymentStatus(req, res) {
    try {
      const userId = req.user.userId;
      const { id: paymentId } = req.params;

      if (!paymentId) {
        throw new APIError(400, [{ 
          path: "id", 
          message: "ID do pagamento é obrigatório" 
        }]);
      }

      const result = await PaymentService.checkPaymentStatus(paymentId, userId);

      res.status(200).json({
        success: true,
        message: "Status verificado com sucesso",
        data: result
      });

    } catch (error) {
      if (error instanceof APIError) {
        return res.status(error.statusCode).json({
          success: false,
          message: "Erro ao verificar status",
          errors: error.errors
        });
      }

      console.error('Erro ao verificar status:', error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  /**
   * 📋 Obter métodos de pagamento disponíveis
   * GET /api/payments/methods
   */
  static async getPaymentMethods(req, res) {
    try {
      const paymentMethods = {
        card: {
          name: 'Cartão de Crédito/Débito',
          types: ['credit_card', 'debit_card'],
          brands: ['Visa', 'Mastercard', 'American Express', 'Elo', 'Hipercard'],
          processing: 'instant',
          description: 'Aprovação imediata'
        },
        pix: {
          name: 'PIX',
          types: ['pix'],
          processing: 'up_to_minutes',
          expiration: '30 minutos',
          description: 'Pagamento instantâneo via PIX'
        },
        boleto: {
          name: 'Boleto Bancário',
          types: ['boleto'],
          processing: 'up_to_days',
          expiration: '3 dias',
          description: 'Pagamento em bancos, lotéricas ou apps'
        }
      };

      res.status(200).json({
        success: true,
        message: "Métodos de pagamento disponíveis",
        data: { paymentMethods }
      });

    } catch (error) {
      console.error('Erro ao listar métodos:', error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  /**
   * 🎯 Webhook para receber notificações dos gateways
   * POST /api/payments/webhook/:gateway
   */
  static async handleWebhook(req, res) {
    try {
      const { gateway } = req.params;
      const payload = req.body;

      // Log do webhook para debug
      console.log(`Webhook recebido do gateway ${gateway}:`, payload);

      // Em produção, implementar validação de assinatura
      // e processamento específico para cada gateway

      // Simular processamento
      if (payload.status && payload.transactionId) {
        // Buscar pagamento e atualizar status
        // Implementar lógica específica para cada gateway
      }

      res.status(200).json({
        success: true,
        message: "Webhook processado"
      });

    } catch (error) {
      console.error('Erro no webhook:', error);
      res.status(500).json({
        success: false,
        message: "Erro no processamento do webhook"
      });
    }
  }
}

export default PaymentController;
