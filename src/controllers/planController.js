import PlanService from '../services/planService.js';
import { APIError } from '../utils/ApiError.js';
import { sendError, sendResponse } from '../utils/messages.js';
import { z } from 'zod';

class PlanController {
  /**
   * 📋 GET /api/plans - Listar todos os planos disponíveis
   */
  static async listPlans(req, res) {
    try {
      const plans = await PlanService.listPlans();
      
      return sendResponse(res, 200, {
        message: "Planos carregados com sucesso",
        data: plans
      });
    } catch (error) {
      if (error instanceof APIError) {
        const { statusCode, errors } = error.toJson();
        return sendError(res, statusCode, ...errors);
      }
      
      console.error('Erro ao listar planos:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  }

  /**
   * 📊 GET /api/plans/my-plan - Obter informações do plano atual do usuário
   */
  static async getMyPlan(req, res) {
    try {
      const userId = req.user.id;
      const planInfo = await PlanService.getUserPlanInfo(userId);
      
      return sendResponse(res, 200, {
        message: "Informações do plano carregadas com sucesso",
        data: planInfo
      });
    } catch (error) {
      if (error instanceof APIError) {
        const { statusCode, errors } = error.toJson();
        return sendError(res, statusCode, ...errors);
      }
      
      console.error('Erro ao obter plano do usuário:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  }

  /**
   * 🔄 PUT /api/plans/change - Alterar plano do usuário
   */
  static async changePlan(req, res) {
    try {
      // Validar entrada
      const changeSchema = z.object({
        planType: z.enum(['free', 'monthly', 'lifetime'], {
          errorMap: () => ({ message: "Plano deve ser: free, monthly ou lifetime" })
        })
      });

      const { planType } = changeSchema.parse(req.body);
      const userId = req.user.id;

      const result = await PlanService.changePlan(userId, planType);
      
      return sendResponse(res, 200, {
        message: `Plano alterado para ${result.planDetails.displayName} com sucesso`,
        data: result
      });
    } catch (error) {
      if (error instanceof APIError) {
        const { statusCode, errors } = error.toJson();
        return sendError(res, statusCode, ...errors);
      }

      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => ({
          path: issue.path[0],
          message: issue.message
        }));
        return sendError(res, 400, errors);
      }
      
      console.error('Erro ao alterar plano:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  }

  /**
   * ⬇️ POST /api/plans/download - Registrar download e verificar limites
   */
  static async registerDownload(req, res) {
    try {
      // Validar entrada
      const downloadSchema = z.object({
        movieId: z.string().min(1, "ID do filme é obrigatório")
      });

      const { movieId } = downloadSchema.parse(req.body);
      const userId = req.user.id;

      const result = await PlanService.registerDownload(userId, movieId);
      
      return sendResponse(res, 200, {
        message: "Download registrado com sucesso",
        data: result
      });
    } catch (error) {
      if (error instanceof APIError) {
        const { statusCode, errors } = error.toJson();
        return sendError(res, statusCode, ...errors);
      }

      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => ({
          path: issue.path[0],
          message: issue.message
        }));
        return sendError(res, 400, errors);
      }
      
      console.error('Erro ao registrar download:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  }

  /**
   * 🎭 GET /api/plans/should-show-ads - Verificar se deve mostrar anúncios
   */
  static async shouldShowAds(req, res) {
    try {
      // O middleware shouldShowAds já define req.showAds
      return sendResponse(res, 200, {
        message: "Status de anúncios obtido com sucesso",
        data: {
          showAds: req.showAds || true
        }
      });
    } catch (error) {
      console.error('Erro ao verificar status de anúncios:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  }

  /**
   * 📺 GET /api/plans/ads-config - Obter configuração completa de anúncios
   */
  static async getAdsConfig(req, res) {
    try {
      const userId = req.user.id;
      const planInfo = await PlanService.getUserPlanInfo(userId);

      const adsConfig = {
        showAds: planInfo.usage.showAds,
        planType: planInfo.currentPlan.type,
        planDisplayName: planInfo.planDetails.displayName,
        adFrequency: planInfo.usage.showAds ? 'high' : 'none',
        adTypes: planInfo.usage.showAds ? ['preroll', 'midroll', 'banner'] : []
      };

      return sendResponse(res, 200, {
        message: "Configuração de anúncios carregada",
        data: adsConfig
      });
    } catch (error) {
      if (error instanceof APIError) {
        const { statusCode, errors } = error.toJson();
        return sendError(res, statusCode, ...errors);
      }
      
      console.error('Erro ao carregar configuração de anúncios:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  }
}

export default PlanController;
