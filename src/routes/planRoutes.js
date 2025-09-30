import { Router } from "express";
import PlanController from "../controllers/planController.js";
import authentication from "../middlewares/authMiddlewares.js";
import { shouldShowAds } from "../middlewares/planMiddleware.js";

const router = Router();

/**
 * 📋 Rotas Públicas - Planos
 */
// Listar todos os planos disponíveis (público)
router.get("/", PlanController.listPlans);

/**
 * 🔐 Rotas Protegidas - Requer Autenticação
 */
// Obter informações do plano atual do usuário
router.get("/my-plan", authentication, PlanController.getMyPlan);

// Alterar plano do usuário
router.put("/change", authentication, PlanController.changePlan);

// Registrar download e verificar limites
router.post("/download", authentication, PlanController.registerDownload);

// Verificar se deve mostrar anúncios
router.get("/should-show-ads", shouldShowAds(), PlanController.shouldShowAds);

// Obter configuração completa de anúncios
router.get("/ads-config", authentication, PlanController.getAdsConfig);

export default router;