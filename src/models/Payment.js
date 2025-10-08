import mongoose from 'mongoose';

/**
 * 💳 Modelo de Pagamento
 * Suporta múltiplas formas de pagamento: Cartão, PIX, Boleto
 */
const paymentSchema = new mongoose.Schema({
  // Dados básicos
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  planType: { 
    type: String, 
    required: true,
    enum: ['monthly', 'lifetime'],
    index: true
  },
  
  // Informações financeiras
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  currency: { 
    type: String, 
    default: 'BRL',
    enum: ['BRL', 'USD', 'EUR']
  },
  
  // Status e método
  status: { 
    type: String, 
    enum: [
      'pending',      // Pendente
      'processing',   // Processando
      'approved',     // Aprovado
      'rejected',     // Rejeitado
      'cancelled',    // Cancelado
      'refunded',     // Reembolsado
      'expired'       // Expirado
    ], 
    default: 'pending',
    index: true
  },
  
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ['credit_card', 'debit_card', 'pix', 'boleto'],
    index: true
  },
  
  // Identificadores externos
  transactionId: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  externalId: { 
    type: String, // ID do gateway de pagamento
    sparse: true
  },
  
  // Dados específicos por método
  paymentDetails: {
    // Para cartões
    cardLastFour: String,
    cardBrand: String,
    cardHolderName: String,
    
    // Para PIX
    pixKey: String,
    pixQrCode: String,
    pixCopyPaste: String,
    
    // Para boleto
    boletoBarcode: String,
    boletoDigitableLine: String,
    boletoUrl: String,
    bolotoDueDate: Date
  },
  
  // Metadados
  gateway: {
    type: String,
    enum: ['mercadopago', 'pagseguro', 'stripe', 'mock'], // Mock para testes
    default: 'mock'
  },
  
  gatewayResponse: mongoose.Schema.Types.Mixed,
  
  // Controle temporal
  expiresAt: Date,
  processedAt: Date,
  
  // Observações
  notes: String,
  
  // Tentativas
  attempts: {
    type: Number,
    default: 0,
    max: 3
  }
}, {
  timestamps: true
});

// Índices compostos para performance
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ paymentMethod: 1, status: 1 });

// Middleware para definir expiração automática
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    const now = new Date();
    switch (this.paymentMethod) {
      case 'pix':
        // PIX expira em 30 minutos
        this.expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
        break;
      case 'boleto':
        // Boleto expira em 3 dias
        this.expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        this.paymentDetails.bolotoDueDate = this.expiresAt;
        break;
      case 'credit_card':
      case 'debit_card':
        // Cartões são processados imediatamente, mas podem ter timeout
        this.expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
        break;
    }
  }
  next();
});

// Método para verificar se o pagamento expirou
paymentSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Método para obter dados formatados para exibição
paymentSchema.methods.getDisplayData = function() {
  const data = {
    id: this._id,
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    paymentMethod: this.paymentMethod,
    transactionId: this.transactionId,
    createdAt: this.createdAt
  };

  // Adicionar dados específicos do método
  switch (this.paymentMethod) {
    case 'credit_card':
    case 'debit_card':
      if (this.paymentDetails.cardLastFour) {
        data.card = {
          lastFour: this.paymentDetails.cardLastFour,
          brand: this.paymentDetails.cardBrand,
          holderName: this.paymentDetails.cardHolderName
        };
      }
      break;
    case 'pix':
      if (this.paymentDetails.pixQrCode) {
        data.pix = {
          qrCode: this.paymentDetails.pixQrCode,
          copyPaste: this.paymentDetails.pixCopyPaste,
          expiresAt: this.expiresAt
        };
      }
      break;
    case 'boleto':
      if (this.paymentDetails.boletoUrl) {
        data.boleto = {
          url: this.paymentDetails.boletoUrl,
          barcode: this.paymentDetails.boletoBarcode,
          digitableLine: this.paymentDetails.boletoDigitableLine,
          dueDate: this.paymentDetails.bolotoDueDate
        };
      }
      break;
  }

  return data;
};

export default mongoose.model('Payment', paymentSchema);