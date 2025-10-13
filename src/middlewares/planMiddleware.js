import { hasFeature, isPlanActive, PLAN_CONFIGS } from '../utils/planUtils.js';
import { sendError } from '../utils/messages.js';

/**
 * 💎 Middleware para verificar se o usuário tem um plano específico
 */
export const requirePlan = (requiredPlan) => {
  return (req, res, next) => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.user) {
        return sendError(res, 401, [
          { path: "auth", message: "Acesso negado. Faça login primeiro." }
        ]);
      }

      // Verificar se o plano está ativo
      if (!isPlanActive(req.user)) {
        return sendError(res, 403, [
          { path: "plan", message: "Seu plano expirou. Renove sua assinatura." }
        ]);
      }

      // Verificar se tem o plano necessário
      if (req.user.plan.type !== requiredPlan) {
        const requiredPlanName = PLAN_CONFIGS[requiredPlan]?.displayName || requiredPlan;
        return sendError(res, 403, [
          { path: "plan", message: `Esta funcionalidade requer o plano ${requiredPlanName}.` }
        ]);
      }

      next();
    } catch (error) {
      console.error('Erro no middleware requirePlan:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  };
};

/**
 * 🎯 Middleware para verificar se o usuário tem acesso a uma feature
 */
export const requireFeature = (featureName, errorMessage = null) => {
  return (req, res, next) => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.user) {
        return sendError(res, 401, [
          { path: "auth", message: "Acesso negado. Faça login primeiro." }
        ]);
      }

      // Verificar se o plano está ativo
      if (!isPlanActive(req.user)) {
        return sendError(res, 403, [
          { path: "plan", message: "Seu plano expirou. Renove sua assinatura." }
        ]);
      }

      // Verificar se tem a feature
      if (!hasFeature(req.user.plan.type, featureName)) {
        const message = errorMessage || `Esta funcionalidade não está disponível no seu plano atual.`;
        return sendError(res, 403, [
          { path: "feature", message }
        ]);
      }

      next();
    } catch (error) {
      console.error('Erro no middleware requireFeature:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  };
};

/**
 * 📊 Middleware para verificar limite de downloads
 */
export const checkDownloadLimit = () => {
  return async (req, res, next) => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.user) {
        return sendError(res, 401, [
          { path: "auth", message: "Acesso negado. Faça login primeiro." }
        ]);
      }

      // Verificar se o plano está ativo
      if (!isPlanActive(req.user)) {
        return sendError(res, 403, [
          { path: "plan", message: "Seu plano expirou. Renove sua assinatura." }
        ]);
      }

      // Importar dinamicamente para evitar dependência circular
      const { getRemainingDownloads } = await import('../utils/planUtils.js');
      const remainingDownloads = getRemainingDownloads(req.user);

      // Verificar se ainda tem downloads disponíveis
      if (remainingDownloads === 0) {
        return sendError(res, 403, [
          { path: "downloads", message: "Limite de downloads mensal atingido. Faça upgrade do seu plano." }
        ]);
      }

      // Adicionar informação ao request
      req.remainingDownloads = remainingDownloads;
      next();
    } catch (error) {
      console.error('Erro no middleware checkDownloadLimit:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  };
};

/**
 * 🎭 Middleware para verificar se deve mostrar anúncios
 */
export const shouldShowAds = () => {
  return (req, res, next) => {
    try {
      // Por padrão, mostrar anúncios se não estiver autenticado
      if (!req.user) {
        req.showAds = true;
        return next();
      }

      // Verificar se o plano do usuário deve mostrar anúncios
      req.showAds = hasFeature(req.user.plan.type, 'showAds');
      next();
    } catch (error) {
      console.error('Erro no middleware shouldShowAds:', error);
      req.showAds = true; // Fallback para mostrar anúncios
      next();
    }
  };
};

export default {
  requirePlan,
  requireFeature,
  checkDownloadLimit,
  shouldShowAds
};
