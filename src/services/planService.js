import User from '../models/User.js';
import Plan from '../models/Plan.js';
import { PLAN_CONFIGS, PLAN_TYPES, isPlanActive, getRemainingDownloads } from '../utils/planUtils.js';
import { APIErro } from '../utils/ApiError.js';

class PlanService {
  /**
   * 📋 Listar todos os planos disponíveis
   */
  static async listPlans() {
    try {
      const plans = await Plan.find({ active: true }).sort({ price: 1 });
      
      // Se não há planos no banco, retornar configurações padrão
      if (plans.length === 0) {
        return Object.values(PLAN_CONFIGS);
      }
      
      return plans;
    } catch (error) {
      console.error('Erro ao listar planos:', error);
      throw new APIErro(500, [
        { path: "plans", message: "Erro ao carregar planos disponíveis" }
      ]);
    }
  }

  /**
   * 🔄 Alterar plano do usuário
   */
  static async changePlan(userId, newPlanType) {
    try {
      // Validar se o plano existe
      if (!Object.values(PLAN_TYPES).includes(newPlanType)) {
        throw new APIErro(400, [
          { path: "plan", message: "Plano inválido" }
        ]);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new APIErro(404, [
          { path: "user", message: "Usuário não encontrado" }
        ]);
      }

      const planConfig = PLAN_CONFIGS[newPlanType];
      const now = new Date();

      // Calcular data de expiração
      let endDate = null;
      if (planConfig.duration) {
        endDate = new Date(now.getTime() + (planConfig.duration * 24 * 60 * 60 * 1000));
      }

      // Atualizar plano do usuário
      user.plan = {
        type: newPlanType,
        startDate: now,
        endDate: endDate,
        downloadsUsed: 0, // Resetar contador
        monthlyDownloadsReset: now
      };

      await user.save();

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan
        },
        planDetails: planConfig,
        currentPlan: user.plan,
        features: planConfig.features,
        remainingDownloads: planConfig.features.monthlyDownloads === 0 ? 'Ilimitado' : planConfig.features.monthlyDownloads
      };
    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      console.error('Erro ao alterar plano:', error);
      throw new APIErro(500, [
        { path: "plan", message: "Erro interno ao alterar plano" }
      ]);
    }
  }

  /**
   * 📊 Obter informações do plano atual do usuário
   */
  static async getUserPlanInfo(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new APIErro(404, [
          { path: "user", message: "Usuário não encontrado" }
        ]);
      }

      const planConfig = PLAN_CONFIGS[user.plan?.type || PLAN_TYPES.FREE];
      const isActive = isPlanActive(user);
      const remainingDownloads = getRemainingDownloads(user);

      return {
        currentPlan: user.plan,
        planConfig: planConfig,
        isActive: isActive,
        remainingDownloads: remainingDownloads === Infinity ? 'Ilimitado' : remainingDownloads,
        features: planConfig.features,
        usage: {
          showAds: planConfig.features.showAds
        },
        planDetails: {
          displayName: planConfig.displayName
        }
      };
    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      console.error('Erro ao obter informações do plano:', error);
      throw new APIErro(500, [
        { path: "plan", message: "Erro interno ao carregar informações do plano" }
      ]);
    }
  }

  /**
   * ⬇️ Registrar download (atualizar contador)
   */
  static async registerDownload(userId, movieId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new APIErro(404, [
          { path: "user", message: "Usuário não encontrado" }
        ]);
      }

      // Verificar se o plano está ativo
      if (!isPlanActive(user)) {
        throw new APIErro(403, [
          { path: "plan", message: "Plano expirado. Renove sua assinatura." }
        ]);
      }

      // Verificar limite de downloads
      const remainingDownloads = getRemainingDownloads(user);
      if (remainingDownloads === 0) {
        throw new APIErro(403, [
          { path: "downloads", message: "Limite de downloads mensal atingido" }
        ]);
      }

      // Verificar se precisa resetar contador mensal
      const now = new Date();
      const resetDate = new Date(user.plan.monthlyDownloadsReset);
      const monthsDiff = (now.getFullYear() - resetDate.getFullYear()) * 12 + (now.getMonth() - resetDate.getMonth());

      if (monthsDiff >= 1) {
        // Resetar contador mensal
        user.plan.downloadsUsed = 0;
        user.plan.monthlyDownloadsReset = now;
      }

      // Incrementar contador de downloads
      user.plan.downloadsUsed = (user.plan.downloadsUsed || 0) + 1;

      // Adicionar ao histórico de downloads se não existe
      if (!user.downloads.includes(movieId)) {
        user.downloads.push(movieId);
      }

      await user.save();

      return {
        success: true,
        downloadsUsed: user.plan.downloadsUsed,
        remainingDownloads: getRemainingDownloads(user)
      };
    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      console.error('Erro ao registrar download:', error);
      throw new APIErro(500, [
        { path: "download", message: "Erro interno ao registrar download" }
      ]);
    }
  }

  /**
   * 🆓 Inicializar plano gratuito para novo usuário
   */
  static async initializeFreePlan(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new APIErro(404, [
          { path: "user", message: "Usuário não encontrado" }
        ]);
      }

      // Se já tem plano, não alterar
      if (user.plan && user.plan.type) {
        return user.plan;
      }

      // Inicializar com plano gratuito
      const now = new Date();
      user.plan = {
        type: PLAN_TYPES.FREE,
        startDate: now,
        endDate: null,
        downloadsUsed: 0,
        monthlyDownloadsReset: now
      };

      await user.save();
      return user.plan;
    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      console.error('Erro ao inicializar plano gratuito:', error);
      throw new APIErro(500, [
        { path: "plan", message: "Erro interno ao inicializar plano" }
      ]);
    }
  }
}

export default PlanService;