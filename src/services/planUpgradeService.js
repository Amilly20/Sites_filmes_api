/**
 * 🔄 Serviço de Upgrade/Downgrade de Planos
 * Gerencia todas as operações de mudança de planos com validações específicas
 */

import User from '../models/User.js';
import { APIError } from '../utils/ApiError.js';
import { PLAN_TYPES, PLAN_CONFIGS } from '../utils/planUtils.js';

class PlanUpgradeService {
  /**
   * 📈 Realizar upgrade de plano
   * @param {string} userId - ID do usuário
   * @param {string} targetPlan - Plano de destino
   * @returns {Object} Informações do upgrade
   */
  static async upgradePlan(userId, targetPlan) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new APIError(404, [
          { path: "user", message: "Usuário não encontrado" }
        ]);
      }

      const currentPlan = user.plan?.type || PLAN_TYPES.FREE;
      const upgradeInfo = this._validateUpgrade(currentPlan, targetPlan);

      if (!upgradeInfo.isValid) {
        throw new APIError(400, [
          { path: "upgrade", message: upgradeInfo.reason }
        ]);
      }

      // Processar upgrade
      const result = await this._processUpgrade(user, targetPlan, upgradeInfo);

      return {
        success: true,
        operation: 'upgrade',
        previousPlan: {
          type: currentPlan,
          displayName: PLAN_CONFIGS[currentPlan].displayName
        },
        newPlan: {
          type: targetPlan,
          displayName: PLAN_CONFIGS[targetPlan].displayName
        },
        benefits: upgradeInfo.benefits,
        effectiveDate: result.effectiveDate,
        user: result.user,
        planDetails: PLAN_CONFIGS[targetPlan]
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      console.error('Erro ao fazer upgrade:', error);
      throw new APIError(500, [
        { path: "upgrade", message: "Erro interno no upgrade" }
      ]);
    }
  }

  /**
   * 📉 Realizar downgrade de plano
   * @param {string} userId - ID do usuário
   * @param {string} targetPlan - Plano de destino
   * @returns {Object} Informações do downgrade
   */
  static async downgradePlan(userId, targetPlan) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new APIError(404, [
          { path: "user", message: "Usuário não encontrado" }
        ]);
      }

      const currentPlan = user.plan?.type || PLAN_TYPES.FREE;
      const downgradeInfo = this._validateDowngrade(currentPlan, targetPlan);

      if (!downgradeInfo.isValid) {
        throw new APIError(400, [
          { path: "downgrade", message: downgradeInfo.reason }
        ]);
      }

      // Processar downgrade
      const result = await this._processDowngrade(user, targetPlan, downgradeInfo);

      return {
        success: true,
        operation: 'downgrade',
        previousPlan: {
          type: currentPlan,
          displayName: PLAN_CONFIGS[currentPlan].displayName
        },
        newPlan: {
          type: targetPlan,
          displayName: PLAN_CONFIGS[targetPlan].displayName
        },
        limitations: downgradeInfo.limitations,
        warnings: downgradeInfo.warnings,
        effectiveDate: result.effectiveDate,
        user: result.user,
        planDetails: PLAN_CONFIGS[targetPlan]
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      console.error('Erro ao fazer downgrade:', error);
      throw new APIError(500, [
        { path: "downgrade", message: "Erro interno no downgrade" }
      ]);
    }
  }

  /**
   * 🔄 Mudança inteligente de plano (detecta se é upgrade ou downgrade)
   * @param {string} userId - ID do usuário
   * @param {string} targetPlan - Plano de destino
   * @returns {Object} Resultado da operação
   */
  static async changePlanIntelligent(userId, targetPlan) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new APIError(404, [
          { path: "user", message: "Usuário não encontrado" }
        ]);
      }

      const currentPlan = user.plan?.type || PLAN_TYPES.FREE;
      
      // Não permitir mudança para o mesmo plano
      if (currentPlan === targetPlan) {
        throw new APIError(400, [
          { path: "plan", message: "Você já possui este plano" }
        ]);
      }

      const operationType = this._determineOperationType(currentPlan, targetPlan);

      if (operationType === 'upgrade') {
        return await this.upgradePlan(userId, targetPlan);
      } else {
        return await this.downgradePlan(userId, targetPlan);
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      console.error('Erro na mudança de plano:', error);
      throw new APIError(500, [
        { path: "plan", message: "Erro interno na mudança de plano" }
      ]);
    }
  }

  /**
   * 📊 Obter informações de upgrade disponíveis
   * @param {string} userId - ID do usuário
   * @returns {Array} Lista de upgrades possíveis
   */
  static async getUpgradeOptions(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new APIError(404, [
          { path: "user", message: "Usuário não encontrado" }
        ]);
      }

      const currentPlan = user.plan?.type || PLAN_TYPES.FREE;
      const upgradeOptions = [];

      Object.values(PLAN_TYPES).forEach(planType => {
        if (planType !== currentPlan) {
          const operationType = this._determineOperationType(currentPlan, planType);
          const info = operationType === 'upgrade' 
            ? this._validateUpgrade(currentPlan, planType)
            : this._validateDowngrade(currentPlan, planType);

          upgradeOptions.push({
            planType: planType,
            planConfig: PLAN_CONFIGS[planType],
            operationType: operationType,
            isAvailable: info.isValid,
            reason: info.reason,
            benefits: info.benefits || [],
            limitations: info.limitations || [],
            warnings: info.warnings || []
          });
        }
      });

      return {
        currentPlan: {
          type: currentPlan,
          config: PLAN_CONFIGS[currentPlan]
        },
        options: upgradeOptions
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      console.error('Erro ao obter opções de upgrade:', error);
      throw new APIError(500, [
        { path: "options", message: "Erro interno ao carregar opções" }
      ]);
    }
  }

  // ===========================
  // 🔧 MÉTODOS PRIVADOS
  // ===========================

  /**
   * Determina se a operação é upgrade ou downgrade
   */
  static _determineOperationType(currentPlan, targetPlan) {
    const planHierarchy = {
      [PLAN_TYPES.FREE]: 1,
      [PLAN_TYPES.MONTHLY]: 2,
      [PLAN_TYPES.LIFETIME]: 3
    };

    const currentLevel = planHierarchy[currentPlan];
    const targetLevel = planHierarchy[targetPlan];

    return targetLevel > currentLevel ? 'upgrade' : 'downgrade';
  }

  /**
   * Valida se o upgrade é possível
   */
  static _validateUpgrade(currentPlan, targetPlan) {
    const currentConfig = PLAN_CONFIGS[currentPlan];
    const targetConfig = PLAN_CONFIGS[targetPlan];

    // Validações básicas
    if (!targetConfig) {
      return { isValid: false, reason: "Plano de destino inválido" };
    }

    if (currentPlan === targetPlan) {
      return { isValid: false, reason: "Você já possui este plano" };
    }

    // Lógica de upgrade (free -> monthly -> lifetime)
    const upgradePaths = {
      [PLAN_TYPES.FREE]: [PLAN_TYPES.MONTHLY, PLAN_TYPES.LIFETIME],
      [PLAN_TYPES.MONTHLY]: [PLAN_TYPES.LIFETIME],
      [PLAN_TYPES.LIFETIME]: [] // Não pode fazer upgrade do vitalício
    };

    if (!upgradePaths[currentPlan].includes(targetPlan)) {
      return { 
        isValid: false, 
        reason: `Não é possível fazer upgrade de ${currentConfig.displayName} para ${targetConfig.displayName}` 
      };
    }

    // Calcular benefícios
    const benefits = this._calculateUpgradeBenefits(currentConfig, targetConfig);

    return {
      isValid: true,
      reason: "Upgrade válido",
      benefits: benefits
    };
  }

  /**
   * Valida se o downgrade é possível
   */
  static _validateDowngrade(currentPlan, targetPlan) {
    const currentConfig = PLAN_CONFIGS[currentPlan];
    const targetConfig = PLAN_CONFIGS[targetPlan];

    // Validações básicas
    if (!targetConfig) {
      return { isValid: false, reason: "Plano de destino inválido" };
    }

    if (currentPlan === targetPlan) {
      return { isValid: false, reason: "Você já possui este plano" };
    }

    // Lógica de downgrade (lifetime -> monthly -> free)
    const downgradePaths = {
      [PLAN_TYPES.FREE]: [], // Não pode fazer downgrade do gratuito
      [PLAN_TYPES.MONTHLY]: [PLAN_TYPES.FREE],
      [PLAN_TYPES.LIFETIME]: [PLAN_TYPES.MONTHLY, PLAN_TYPES.FREE]
    };

    if (!downgradePaths[currentPlan].includes(targetPlan)) {
      return { 
        isValid: false, 
        reason: `Não é possível fazer downgrade de ${currentConfig.displayName} para ${targetConfig.displayName}` 
      };
    }

    // Calcular limitações e avisos
    const { limitations, warnings } = this._calculateDowngradeLimitations(currentConfig, targetConfig);

    return {
      isValid: true,
      reason: "Downgrade válido",
      limitations: limitations,
      warnings: warnings
    };
  }

  /**
   * Processa o upgrade do usuário
   */
  static async _processUpgrade(user, targetPlan, upgradeInfo) {
    const now = new Date();
    const targetConfig = PLAN_CONFIGS[targetPlan];

    // Calcular data de expiração
    let endDate = null;
    if (targetConfig.duration) {
      endDate = new Date(now.getTime() + (targetConfig.duration * 24 * 60 * 60 * 1000));
    }

    // Atualizar plano
    user.plan = {
      type: targetPlan,
      startDate: now,
      endDate: endDate,
      downloadsUsed: user.plan?.downloadsUsed || 0, // Manter downloads usados
      monthlyDownloadsReset: user.plan?.monthlyDownloadsReset || now
    };

    await user.save();

    return {
      effectiveDate: now,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan
      }
    };
  }

  /**
   * Processa o downgrade do usuário
   */
  static async _processDowngrade(user, targetPlan, downgradeInfo) {
    const now = new Date();
    const targetConfig = PLAN_CONFIGS[targetPlan];

    // Para downgrade, aplicar imediatamente mas com avisos
    let endDate = null;
    if (targetConfig.duration) {
      endDate = new Date(now.getTime() + (targetConfig.duration * 24 * 60 * 60 * 1000));
    }

    // Resetar downloads se o novo plano tem limite menor
    let downloadsUsed = user.plan?.downloadsUsed || 0;
    if (targetConfig.features.monthlyDownloads < (user.plan?.downloadsUsed || 0)) {
      downloadsUsed = Math.min(downloadsUsed, targetConfig.features.monthlyDownloads);
    }

    user.plan = {
      type: targetPlan,
      startDate: now,
      endDate: endDate,
      downloadsUsed: downloadsUsed,
      monthlyDownloadsReset: now
    };

    await user.save();

    return {
      effectiveDate: now,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan
      }
    };
  }

  /**
   * Calcula os benefícios do upgrade
   */
  static _calculateUpgradeBenefits(currentConfig, targetConfig) {
    const benefits = [];

    // Comparar recursos
    const currentFeatures = currentConfig.features;
    const targetFeatures = targetConfig.features;

    if (!targetFeatures.showAds && currentFeatures.showAds) {
      benefits.push("Remoção de anúncios");
    }

    if (targetFeatures.monthlyDownloads > currentFeatures.monthlyDownloads) {
      benefits.push(`Aumento de downloads mensais: ${currentFeatures.monthlyDownloads} → ${targetFeatures.monthlyDownloads === 0 ? 'Ilimitado' : targetFeatures.monthlyDownloads}`);
    }

    if (targetFeatures.hdQuality && !currentFeatures.hdQuality) {
      benefits.push("Qualidade HD");
    }

    if (targetFeatures.simultaneousDevices > currentFeatures.simultaneousDevices) {
      benefits.push(`Mais dispositivos simultâneos: ${currentFeatures.simultaneousDevices} → ${targetFeatures.simultaneousDevices}`);
    }

    if (targetFeatures.offlineDownload && !currentFeatures.offlineDownload) {
      benefits.push("Downloads offline");
    }

    if (targetFeatures.unlimitedAccess && !currentFeatures.unlimitedAccess) {
      benefits.push("Acesso completo e ilimitado");
    }

    return benefits;
  }

  /**
   * Calcula as limitações do downgrade
   */
  static _calculateDowngradeLimitations(currentConfig, targetConfig) {
    const limitations = [];
    const warnings = [];

    const currentFeatures = currentConfig.features;
    const targetFeatures = targetConfig.features;

    if (targetFeatures.showAds && !currentFeatures.showAds) {
      limitations.push("Anúncios serão exibidos");
      warnings.push("Você verá anúncios durante a reprodução");
    }

    if (targetFeatures.monthlyDownloads < currentFeatures.monthlyDownloads) {
      limitations.push(`Redução de downloads mensais: ${currentFeatures.monthlyDownloads === 0 ? 'Ilimitado' : currentFeatures.monthlyDownloads} → ${targetFeatures.monthlyDownloads}`);
      warnings.push("Downloads em excesso serão bloqueados");
    }

    if (!targetFeatures.hdQuality && currentFeatures.hdQuality) {
      limitations.push("Perda da qualidade HD");
    }

    if (targetFeatures.simultaneousDevices < currentFeatures.simultaneousDevices) {
      limitations.push(`Menos dispositivos simultâneos: ${currentFeatures.simultaneousDevices} → ${targetFeatures.simultaneousDevices}`);
    }

    if (!targetFeatures.offlineDownload && currentFeatures.offlineDownload) {
      limitations.push("Perda de downloads offline");
      warnings.push("Downloads salvos podem ser removidos");
    }

    if (!targetFeatures.unlimitedAccess && currentFeatures.unlimitedAccess) {
      limitations.push("Acesso limitado ao conteúdo");
    }

    return { limitations, warnings };
  }
}

export default PlanUpgradeService;
