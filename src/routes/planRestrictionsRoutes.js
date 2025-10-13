import express from 'express';
import PlanRestrictionsController from '../controllers/planRestrictionsController.js';
import authentication from '../middlewares/authMiddlewares.js';
import {
  validatePlanType,
  validatePlanComparison,
  validatePersonalizedRecommendation,
  validateRestrictionStats,
  validatePurchaseWarnings
} from '../validadores/planRestrictionsValidator.js';

const router = express.Router();

/**
 * 🛣️ ROTAS DE RESTRIÇÕES DE PLANOS
 */


router.get('/compare', 
  validatePlanComparison,
  PlanRestrictionsController.comparePlanRestrictions
);


router.get('/stats', 
  validateRestrictionStats,
  PlanRestrictionsController.getRestrictionStats
);


router.get('/recommendation', 
  authentication,
  validatePersonalizedRecommendation,
  PlanRestrictionsController.getPersonalizedRecommendation
);


router.get('/:planType', 
  validatePlanType,
  PlanRestrictionsController.getPlanRestrictions
);


router.get('/:planType/warnings', 
  authentication,
  validatePurchaseWarnings,
  PlanRestrictionsController.getPurchaseWarnings
);

export default router;
