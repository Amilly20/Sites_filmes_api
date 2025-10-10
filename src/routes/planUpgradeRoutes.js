/**
 * 🔄 Rotas de Upgrade/Downgrade de Planos
 * Todas as rotas são protegidas e requerem autenticação JWT
 */

import { Router } from "express";
import PlanUpgradeController from "../controllers/planUpgradeController.js";
import authentication from "../middlewares/authMiddlewares.js";

const router = Router();

/**
 * 🔐 Todas as rotas requerem autenticação
 */
router.use(authentication);

/**
 * 📈 Upgrade de Plano
 */
// Fazer upgrade do plano atual
router.post("/upgrade", PlanUpgradeController.upgradePlan);

/**
 * 📉 Downgrade de Plano  
 */
// Fazer downgrade do plano atual (requer confirmação)
router.post("/downgrade", PlanUpgradeController.downgradePlan);

/**
 * 🔄 Mudança Inteligente de Plano
 */
// Mudança automática (detecta se é upgrade ou downgrade)
router.put("/change-intelligent", PlanUpgradeController.changeIntelligent);

/**
 * 📊 Informações e Opções
 */
// Obter todas as opções de mudança disponíveis
router.get("/upgrade-options", PlanUpgradeController.getUpgradeOptions);

// Preview das mudanças antes de confirmar
router.get("/change-preview", PlanUpgradeController.previewPlanChange);

export default router;
