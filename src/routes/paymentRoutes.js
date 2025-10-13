/**
 * 🚀 Rotas de Pagamentos
 * Endpoints para processamento de pagamentos via cartão, PIX e boleto
 */

import express from 'express';
import PaymentController from '../controllers/paymentController.js';
import authentication from '../middlewares/authMiddlewares.js';
import { body } from 'express-validator';

const router = express.Router();

// ===========================
// 🔒 MIDDLEWARES DE VALIDAÇÃO
// ===========================

/**
 * Validações para pagamento com cartão
 */
const validateCardPayment = [
  body('planType')
    .notEmpty()
    .withMessage('Tipo de plano é obrigatório')
    .isIn(['free', 'monthly', 'lifetime'])
    .withMessage('Tipo de plano deve ser: free, monthly ou lifetime'),
    
  body('cardData.number')
    .notEmpty()
    .withMessage('Número do cartão é obrigatório')
    .isLength({ min: 13, max: 19 })
    .withMessage('Número do cartão deve ter entre 13 e 19 dígitos')
    .matches(/^\d+$/)
    .withMessage('Número do cartão deve conter apenas dígitos'),
    
  body('cardData.holderName')
    .notEmpty()
    .withMessage('Nome do portador é obrigatório')
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
    
  body('cardData.expiryMonth')
    .notEmpty()
    .withMessage('Mês de expiração é obrigatório')
    .isInt({ min: 1, max: 12 })
    .withMessage('Mês deve ser entre 1 e 12'),
    
  body('cardData.expiryYear')
    .notEmpty()
    .withMessage('Ano de expiração é obrigatório')
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 })
    .withMessage('Ano de expiração inválido'),
    
  body('cardData.cvv')
    .notEmpty()
    .withMessage('CVV é obrigatório')
    .matches(/^\d{3,4}$/)
    .withMessage('CVV deve ter 3 ou 4 dígitos'),
    
  body('cardData.type')
    .notEmpty()
    .withMessage('Tipo do cartão é obrigatório')
    .isIn(['credit', 'debit'])
    .withMessage('Tipo deve ser credit ou debit')
];

/**
 * Validações para pagamento via PIX
 */
const validatePixPayment = [
  body('planType')
    .notEmpty()
    .withMessage('Tipo de plano é obrigatório')
    .isIn(['free', 'monthly', 'lifetime'])
    .withMessage('Tipo de plano deve ser: free, monthly ou lifetime')
];

/**
 * Validações para pagamento via boleto
 */
const validateBoletoPayment = [
  body('planType')
    .notEmpty()
    .withMessage('Tipo de plano é obrigatório')
    .isIn(['free', 'monthly', 'lifetime'])
    .withMessage('Tipo de plano deve ser: free, monthly ou lifetime'),
    
  body('customerData.name')
    .notEmpty()
    .withMessage('Nome do cliente é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    
  body('customerData.document')
    .notEmpty()
    .withMessage('CPF/CNPJ é obrigatório')
    .matches(/^\d{11}$|^\d{14}$/)
    .withMessage('CPF deve ter 11 dígitos ou CNPJ 14 dígitos'),
    
  body('customerData.email')
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ter formato válido'),
    
  body('customerData.phone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve ter formato: (11) 99999-9999')
];

// ===========================
// 🛣️ ROTAS DE PAGAMENTO
// ===========================

/**
 * 💳 Processar pagamento via cartão
 * POST /api/payments/card
 */
router.post('/card', 
  authentication, 
  validateCardPayment, 
  PaymentController.processCardPayment
);

/**
 * 💰 Processar pagamento via PIX
 * POST /api/payments/pix
 */
router.post('/pix', 
  authentication, 
  validatePixPayment, 
  PaymentController.processPixPayment
);

/**
 * 📄 Processar pagamento via boleto
 * POST /api/payments/boleto
 */
router.post('/boleto', 
  authentication, 
  validateBoletoPayment, 
  PaymentController.processBoletoPayment
);

/**
 * 📊 Listar pagamentos do usuário
 * GET /api/payments?status=pending&paymentMethod=pix&limit=10
 */
router.get('/', 
  authentication, 
  PaymentController.getUserPayments
);

/**
 * 🔍 Obter detalhes de um pagamento
 * GET /api/payments/:id
 */
router.get('/:id', 
  authentication, 
  PaymentController.getPaymentDetails
);

/**
 * 🔄 Verificar status de pagamento
 * GET /api/payments/:id/status
 */
router.get('/:id/status', 
  authentication, 
  PaymentController.checkPaymentStatus
);

/**
 * 📋 Obter métodos de pagamento disponíveis
 * GET /api/payments/methods
 */
router.get('/methods/available', 
  PaymentController.getPaymentMethods
);

// ===========================
// 🎯 WEBHOOKS (SEM AUTENTICAÇÃO)
// ===========================

/**
 * Webhook para receber notificações dos gateways
 * POST /api/payments/webhook/:gateway
 */
router.post('/webhook/:gateway', 
  PaymentController.handleWebhook
);



export default router;
