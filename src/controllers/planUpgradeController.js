/**
 * 🔄 Controlador de Upgrade/Downgrade de Planos
 * Gerencia todas as operações de mudança de planos
 */

import PlanUpgradeService from '../services/planUpgradeService.js';
import { APIErro } from '../utils/ApiError.js';
import { sendError, sendResponse } from '../utils/messages.js';
import { z } from 'zod';

class PlanUpgradeController {
  /**
   * 📈 POST /api/plans/upgrade - Fazer upgrade do plano
   */
  static async upgradePlan(req, res) {
    try {
      // Validar entrada
      const upgradeSchema = z.object({
        targetPlan: z.enum(['monthly', 'lifetime'], {
          errorMap: () => ({ message: "Plano deve ser: monthly ou lifetime" })
        })
      });

      const { targetPlan } = upgradeSchema.parse(req.body);
      const userId = req.user.id;

      const result = await PlanUpgradeService.upgradePlan(userId, targetPlan);
      
      return sendResponse(res, 200, {
        message: `Upgrade realizado com sucesso! Bem-vindo ao plano ${result.newPlan.displayName}`,
        data: result
      });
    } catch (error) {
      if (error instanceof APIErro) {
        const { code, errors } = error.toJson();
        return sendError(res, code, ...errors);
      }

      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => ({
          path: issue.path[0],
          message: issue.message
        }));
        return sendError(res, 400, errors);
      }
      
      console.error('Erro ao fazer upgrade:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  }

  /**
   * 📉 POST /api/plans/downgrade - Fazer downgrade do plano
   */
  static async downgradePlan(req, res) {
    try {
      // Validar entrada
      const downgradeSchema = z.object({
        targetPlan: z.enum(['free', 'monthly'], {
          errorMap: () => ({ message: "Plano deve ser: free ou monthly" })
        }),
        confirmDowngrade: z.boolean({
          required_error: "Confirmação de downgrade é obrigatória"
        }).refine(val => val === true, {
          message: "Você deve confirmar o downgrade"
        })
      });

      const { targetPlan, confirmDowngrade } = downgradeSchema.parse(req.body);
      const userId = req.user.id;

      const result = await PlanUpgradeService.downgradePlan(userId, targetPlan);
      
      return sendResponse(res, 200, {
        message: `Downgrade realizado com sucesso! Você agora está no plano ${result.newPlan.displayName}`,
        data: result
      });
    } catch (error) {
      if (error instanceof APIErro) {
        const { code, errors } = error.toJson();
        return sendError(res, code, ...errors);
      }

      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => ({
          path: issue.path[0],
          message: issue.message
        }));
        return sendError(res, 400, errors);
      }
      
      console.error('Erro ao fazer downgrade:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  }

  /**
   * 🔄 PUT /api/plans/change-intelligent - Mudança inteligente de plano
   */
  static async changeIntelligent(req, res) {
    try {
      // Validar entrada
      const changeSchema = z.object({
        targetPlan: z.enum(['free', 'monthly', 'lifetime'], {
          errorMap: () => ({ message: "Plano deve ser: free, monthly ou lifetime" })
        })
      });

      const { targetPlan } = changeSchema.parse(req.body);
      const userId = req.user.id;

      const result = await PlanUpgradeService.changePlanIntelligent(userId, targetPlan);
      
      const operationMessage = result.operation === 'upgrade' 
        ? `Upgrade realizado com sucesso! Bem-vindo ao plano ${result.newPlan.displayName}`
        : `Downgrade realizado. Você agora está no plano ${result.newPlan.displayName}`;

      return sendResponse(res, 200, {
        message: operationMessage,
        data: result
      });
    } catch (error) {
      if (error instanceof APIErro) {
        const { code, errors } = error.toJson();
        return sendError(res, code, ...errors);
      }

      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => ({
          path: issue.path[0],
          message: issue.message
        }));
        return sendError(res, 400, errors);
      }
      
      console.error('Erro na mudança de plano:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  }

  /**
   * 📊 GET /api/plans/upgrade-options - Obter opções de upgrade/downgrade
   */
  static async getUpgradeOptions(req, res) {
    try {
      const userId = req.user.id;
      const options = await PlanUpgradeService.getUpgradeOptions(userId);
      
      return sendResponse(res, 200, {
        message: "Opções de mudança de plano carregadas com sucesso",
        data: options
      });
    } catch (error) {
      if (error instanceof APIErro) {
        const { code, errors } = error.toJson();
        return sendError(res, code, ...errors);
      }
      
      console.error('Erro ao carregar opções de upgrade:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  }

  /**
   * 📋 GET /api/plans/change-preview - Preview das mudanças antes de confirmar
   */
  static async previewPlanChange(req, res) {
    try {
      const targetPlan = req.query.targetPlan;
      
      if (!targetPlan) {
        return sendError(res, 400, [
          { path: "targetPlan", message: "Plano de destino é obrigatório" }
        ]);
      }

      if (!['free', 'monthly', 'lifetime'].includes(targetPlan)) {
        return sendError(res, 400, [
          { path: "targetPlan", message: "Plano deve ser: free, monthly ou lifetime" }
        ]);
      }

      const userId = req.user.id;
      
      // Obter informações do usuário atual
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(userId);
      
      if (!user) {
        return sendError(res, 404, [
          { path: "user", message: "Usuário não encontrado" }
        ]);
      }

      const currentPlan = user.plan?.type || 'free';
      
      if (currentPlan === targetPlan) {
        return sendError(res, 400, [
          { path: "plan", message: "Você já possui este plano" }
        ]);
      }

      // Determinar tipo de operação
      const planHierarchy = { 'free': 1, 'monthly': 2, 'lifetime': 3 };
      const operationType = planHierarchy[targetPlan] > planHierarchy[currentPlan] ? 'upgrade' : 'downgrade';
      
      // Obter opções para ver detalhes
      const options = await PlanUpgradeService.getUpgradeOptions(userId);
      const targetOption = options.options.find(opt => opt.planType === targetPlan);

      if (!targetOption) {
        return sendError(res, 400, [
          { path: "plan", message: "Plano de destino inválido" }
        ]);
      }

      return sendResponse(res, 200, {
        message: `Preview da ${operationType === 'upgrade' ? 'upgrade' : 'downgrade'} carregado com sucesso`,
        data: {
          currentPlan: options.currentPlan,
          targetPlan: {
            type: targetPlan,
            config: targetOption.planConfig
          },
          operationType: operationType,
          changes: {
            benefits: targetOption.benefits || [],
            limitations: targetOption.limitations || [],
            warnings: targetOption.warnings || []
          },
          isAvailable: targetOption.isAvailable,
          reason: targetOption.reason
        }
      });
    } catch (error) {
      console.error('Erro no preview da mudança:', error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    }
  }
}

export default PlanUpgradeController;