import { body, param, query, validationResult } from 'express-validator';
import { APIError } from '../utils/ApiError.js';

/**
 * 🚫📋 VALIDADORES PARA RESTRIÇÕES DE PLANOS
 * Sistema de validação robusto para endpoints de restrições e limitações
 */

/**
 * 🔍 Middleware para capturar erros de validação
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    throw new APIError(
      400, 
      'Dados de entrada inválidos para restrições de planos',
      formattedErrors
    );
  }
  
  next();
};

/**
 * ✅ Validação de tipo de plano
 */
const validatePlanType = [
  param('planType')
    .notEmpty()
    .withMessage('Tipo de plano é obrigatório')
    .isIn(['free', 'monthly', 'lifetime'])
    .withMessage('Tipo de plano inválido. Deve ser: free, monthly ou lifetime')
    .trim()
    .toLowerCase(),
  handleValidationErrors
];

/**
 * ✅ Validação de lista de planos para comparação
 */
const validatePlanComparison = [
  query('plans')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      const plans = value.split(',').map(p => p.trim().toLowerCase());
      const validPlans = ['free', 'monthly', 'lifetime'];
      
      // Verificar se todos os planos são válidos
      const invalidPlans = plans.filter(plan => !validPlans.includes(plan));
      if (invalidPlans.length > 0) {
        throw new Error(`Planos inválidos encontrados: ${invalidPlans.join(', ')}`);
      }
      
      // Verificar duplicatas
      const uniquePlans = [...new Set(plans)];
      if (uniquePlans.length !== plans.length) {
        throw new Error('Planos duplicados não são permitidos na comparação');
      }
      
      // Pelo menos 2 planos para comparação válida
      if (plans.length < 2) {
        throw new Error('É necessário pelo menos 2 planos para comparação');
      }
      
      return true;
    })
    .withMessage('Lista de planos deve conter apenas: free, monthly, lifetime (separados por vírgula)'),
  handleValidationErrors
];

/**
 * ✅ Validação de parâmetros de recomendação personalizada
 */
const validatePersonalizedRecommendation = [
  query('usage')
    .optional()
    .isIn(['uso_esporadico', 'uso_regular', 'uso_intensivo', 'uso_familiar'])
    .withMessage('Padrão de uso deve ser: uso_esporadico, uso_regular, uso_intensivo ou uso_familiar')
    .trim(),
    
  query('budget')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Faixa de orçamento deve ser: low, medium ou high')
    .trim(),
    
  query('priorities')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      const priorities = value.split(',').map(p => p.trim().toLowerCase());
      const validPriorities = [
        'no_ads', 
        'quality', 
        'unlimited_downloads', 
        'support', 
        'devices',
        'offline_access',
        'streaming_quality',
        'content_variety'
      ];
      
      // Verificar se todas as prioridades são válidas
      const invalidPriorities = priorities.filter(priority => !validPriorities.includes(priority));
      if (invalidPriorities.length > 0) {
        throw new Error(`Prioridades inválidas: ${invalidPriorities.join(', ')}`);
      }
      
      // Verificar duplicatas
      const uniquePriorities = [...new Set(priorities)];
      if (uniquePriorities.length !== priorities.length) {
        throw new Error('Prioridades duplicadas não são permitidas');
      }
      
      // Máximo de 5 prioridades para manter foco
      if (priorities.length > 5) {
        throw new Error('Máximo de 5 prioridades permitidas');
      }
      
      return true;
    })
    .withMessage('Prioridades devem ser válidas e sem duplicatas (máx. 5)'),
    
  query('currentPlan')
    .optional()
    .isIn(['free', 'monthly', 'lifetime'])
    .withMessage('Plano atual deve ser: free, monthly ou lifetime')
    .trim(),
    
  handleValidationErrors
];

/**
 * ✅ Validação de filtros para estatísticas
 */
const validateRestrictionStats = [
  query('includeDetails')
    .optional()
    .isBoolean()
    .withMessage('includeDetails deve ser um valor booleano')
    .toBoolean(),
    
  query('category')
    .optional()
    .isIn([
      'download', 
      'advertising', 
      'quality', 
      'device', 
      'support', 
      'content', 
      'offline'
    ])
    .withMessage('Categoria deve ser uma das categorias válidas de restrição')
    .trim(),
    
  handleValidationErrors
];

/**
 * ✅ Validação de avisos de compra
 */
const validatePurchaseWarnings = [
  param('planType')
    .notEmpty()
    .withMessage('Tipo de plano é obrigatório')
    .isIn(['free', 'monthly', 'lifetime'])
    .withMessage('Tipo de plano inválido')
    .trim()
    .toLowerCase(),
    
  query('userProfile')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      try {
        const profile = JSON.parse(value);
        
        // Validar estrutura básica do perfil
        if (typeof profile !== 'object') {
          throw new Error('Perfil deve ser um objeto JSON válido');
        }
        
        // Validar campos opcionais do perfil
        if (profile.usage && !['uso_esporadico', 'uso_regular', 'uso_intensivo', 'uso_familiar'].includes(profile.usage)) {
          throw new Error('Campo usage do perfil inválido');
        }
        
        if (profile.budget && !['low', 'medium', 'high'].includes(profile.budget)) {
          throw new Error('Campo budget do perfil inválido');
        }
        
        if (profile.experience && !['iniciante', 'intermediario', 'avancado'].includes(profile.experience)) {
          throw new Error('Campo experience do perfil inválido');
        }
        
        return true;
      } catch (error) {
        throw new Error(`Perfil de usuário inválido: ${error.message}`);
      }
    })
    .withMessage('Perfil de usuário deve ser um JSON válido'),
    
  handleValidationErrors
];

/**
 * 🛡️ Validação combinada para múltiplos parâmetros
 */
const validateMultiPlanQuery = [
  query('plans')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      const plans = value.split(',').map(p => p.trim().toLowerCase());
      const validPlans = ['free', 'monthly', 'lifetime'];
      
      const invalidPlans = plans.filter(plan => !validPlans.includes(plan));
      if (invalidPlans.length > 0) {
        throw new Error(`Planos inválidos: ${invalidPlans.join(', ')}`);
      }
      
      return true;
    }),
    
  query('format')
    .optional()
    .isIn(['summary', 'detailed', 'comparison'])
    .withMessage('Formato deve ser: summary, detailed ou comparison'),
    
  handleValidationErrors
];

/**
 * 📊 Esquemas de validação para documentação
 */
const planRestrictionsSchemas = {
  PlanRestrictions: {
    type: 'object',
    properties: {
      planType: {
        type: 'string',
        enum: ['free', 'monthly', 'lifetime']
      },
      planName: {
        type: 'string'
      },
      downloadRestrictions: {
        type: 'object',
        properties: {
          monthlyLimit: { type: 'number' },
          warningMessage: { type: 'string' }
        }
      },
      advertisingRestrictions: {
        type: 'object',
        properties: {
          hasAds: { type: 'boolean' },
          experienceImpact: { type: 'string' }
        }
      },
      qualityRestrictions: {
        type: 'object',
        properties: {
          maxQuality: { type: 'string' },
          limitationSeverity: { type: 'string' }
        }
      },
      criticalLimitations: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  }
};

export {
  validatePlanType,
  validatePlanComparison,
  validatePersonalizedRecommendation,
  validateRestrictionStats,
  validatePurchaseWarnings,
  validateMultiPlanQuery,
  handleValidationErrors,
  planRestrictionsSchemas
};
