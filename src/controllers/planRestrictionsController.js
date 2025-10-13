import PlanRestrictionsService from '../services/planRestrictionsService.js';
import { APIError } from '../utils/ApiError.js';
import { validationResult } from 'express-validator';

/**
 * 🚫 Controller de Restrições de Planos
 * Gerencia endpoints para exibir limitações de planos antes da compra
 */
class PlanRestrictionsController {

  /**
   * 📋 Obter restrições detalhadas de um plano específico
   */
  static async getPlanRestrictions(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new APIError(400, errors.array());
      }

      const { planType } = req.params;
      
      const restrictions = PlanRestrictionsService.getPlanRestrictions(planType);
      
      res.status(200).json({
        success: true,
        message: `Restrições do plano ${restrictions.planName} carregadas com sucesso`,
        data: {
          restrictions
        }
      });
    } catch (error) {
      if (error.message === 'Plano não encontrado') {
        return next(new APIError(404, [{ 
          path: 'planType', 
          message: 'Plano não encontrado. Tipos válidos: free, monthly, lifetime' 
        }]));
      }
      next(error);
    }
  }

  /**
   * 📊 Comparar restrições entre todos os planos
   */
  static async comparePlanRestrictions(req, res, next) {
    try {
      const { plans } = req.query;
      
      // Se planos específicos foram fornecidos, usar eles, senão usar todos
      const planTypes = plans ? 
        plans.split(',').map(p => p.trim()) : 
        ['free', 'monthly', 'lifetime'];
      
      const comparison = PlanRestrictionsService.comparePlanRestrictions(planTypes);
      
      res.status(200).json({
        success: true,
        message: 'Comparação de restrições gerada com sucesso',
        data: {
          comparison,
          totalPlans: comparison.plans.length,
          comparedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ⚠️ Obter avisos críticos antes da compra
   */
  static async getPurchaseWarnings(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new APIError(400, errors.array());
      }

      const { planType } = req.params;
      const userCurrentPlan = req.user?.currentPlan || null;
      
      const warnings = PlanRestrictionsService.getPurchaseWarnings(planType, userCurrentPlan);
      
      // Determinar nível de risco geral
      const riskLevel = this._calculateRiskLevel(warnings);
      
      res.status(200).json({
        success: true,
        message: 'Avisos de compra gerados com sucesso',
        data: {
          planType,
          warnings,
          riskLevel,
          totalWarnings: warnings.critical.length + warnings.important.length + warnings.informational.length,
          recommendProceed: warnings.critical.length === 0,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      if (error.message === 'Plano não encontrado') {
        return next(new APIError(404, [{ 
          path: 'planType', 
          message: 'Plano não encontrado para análise de avisos' 
        }]));
      }
      next(error);
    }
  }

  /**
   * 🎯 Obter recomendação personalizada baseada no perfil do usuário
   */
  static async getPersonalizedRecommendation(req, res, next) {
    try {
      const { 
        usage = 'uso_regular', 
        budget = 'medium', 
        priorities = 'quality,no_ads' 
      } = req.query;
      
      const user = req.user;
      const userCurrentPlan = user?.currentPlan || null;
      
      // Obter comparação completa
      const comparison = PlanRestrictionsService.comparePlanRestrictions();
      
      // Analisar prioridades do usuário
      const userPriorities = priorities.split(',').map(p => p.trim());
      const recommendation = this._generatePersonalizedRecommendation(
        comparison, 
        usage, 
        budget, 
        userPriorities, 
        userCurrentPlan
      );
      
      res.status(200).json({
        success: true,
        message: 'Recomendação personalizada gerada com sucesso',
        data: {
          user: {
            currentPlan: userCurrentPlan,
            usage,
            budget,
            priorities: userPriorities
          },
          recommendation,
          alternatives: this._getAlternatives(recommendation, comparison.plans),
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 📊 Obter estatísticas de limitações por plano
   */
  static async getRestrictionStats(req, res, next) {
    try {
      const comparison = PlanRestrictionsService.comparePlanRestrictions();
      
      const stats = {
        totalPlans: comparison.plans.length,
        restrictionsSummary: {},
        mostRestrictive: null,
        leastRestrictive: null,
        commonRestrictions: [],
        upgradeImpact: {}
      };

      // Calcular estatísticas por plano
      comparison.plans.forEach(plan => {
        const restrictionCount = plan.criticalLimitations.length;
        stats.restrictionsSummary[plan.planType] = {
          planName: plan.planName,
          restrictionCount,
          criticalLimitations: plan.criticalLimitations,
          hasAds: plan.advertisingRestrictions.hasAds,
          downloadLimit: plan.downloadRestrictions.monthlyLimit,
          price: plan.price
        };
      });

      // Encontrar mais e menos restritivo
      const sortedByRestrictions = Object.entries(stats.restrictionsSummary)
        .sort((a, b) => b[1].restrictionCount - a[1].restrictionCount);
      
      stats.mostRestrictive = sortedByRestrictions[0];
      stats.leastRestrictive = sortedByRestrictions[sortedByRestrictions.length - 1];

      // Restrições comuns
      stats.commonRestrictions = this._findCommonRestrictions(comparison.plans);

      res.status(200).json({
        success: true,
        message: 'Estatísticas de restrições calculadas com sucesso',
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================
  // MÉTODOS AUXILIARES
  // ========================

  static _calculateRiskLevel(warnings) {
    if (warnings.critical.length > 0) return 'high';
    if (warnings.important.length > 2) return 'medium';
    if (warnings.important.length > 0) return 'low';
    return 'minimal';
  }

  static _generatePersonalizedRecommendation(comparison, usage, budget, priorities, currentPlan) {
    const plans = comparison.plans;
    let scores = {};

    // Pontuar cada plano baseado nas prioridades
    plans.forEach(plan => {
      let score = 0;

      // Pontuação por uso
      if (usage === 'uso_esporadico' && plan.planType === 'free') score += 30;
      if (usage === 'uso_regular' && plan.planType === 'monthly') score += 30;
      if (usage === 'uso_intensivo' && plan.planType === 'lifetime') score += 30;

      // Pontuação por orçamento
      if (budget === 'low' && plan.price === 0) score += 25;
      if (budget === 'medium' && plan.planType === 'monthly') score += 25;
      if (budget === 'high' && plan.planType === 'lifetime') score += 25;

      // Pontuação por prioridades
      priorities.forEach(priority => {
        switch (priority) {
          case 'no_ads':
            if (!plan.advertisingRestrictions.hasAds) score += 20;
            break;
          case 'quality':
            if (plan.qualityRestrictions.maxQuality.includes('HD')) score += 15;
            break;
          case 'unlimited_downloads':
            if (plan.downloadRestrictions.isUnlimited) score += 20;
            break;
          case 'support':
            if (plan.supportRestrictions.supportLevel !== 'community') score += 10;
            break;
          case 'devices':
            if (plan.deviceRestrictions.maxConcurrentDevices > 2) score += 15;
            break;
        }
      });

      scores[plan.planType] = score;
    });

    // Encontrar melhor recomendação
    const recommendedPlanType = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );
    
    const recommendedPlan = plans.find(p => p.planType === recommendedPlanType);
    const warnings = PlanRestrictionsService.getPurchaseWarnings(recommendedPlanType, currentPlan);

    return {
      recommendedPlan: recommendedPlan.planType,
      planName: recommendedPlan.planName,
      confidence: Math.min(scores[recommendedPlanType] / 50 * 100, 100),
      matchReasons: this._getMatchReasons(recommendedPlan, priorities, usage),
      warnings: warnings.critical.concat(warnings.important),
      keyBenefits: this._getKeyBenefits(recommendedPlan),
      priceJustification: this._getPriceJustification(recommendedPlan, budget)
    };
  }

  static _getAlternatives(recommendation, allPlans) {
    return allPlans
      .filter(plan => plan.planType !== recommendation.recommendedPlan)
      .map(plan => ({
        planType: plan.planType,
        planName: plan.planName,
        price: plan.price,
        mainBenefit: this._getMainBenefit(plan),
        mainLimitation: this._getMainLimitation(plan)
      }));
  }

  static _findCommonRestrictions(plans) {
    // Implementar lógica para encontrar restrições comuns entre planos
    return ['Suporte técnico limitado', 'Restrições de dispositivos simultâneos'];
  }

  static _getMatchReasons(plan, priorities, usage) {
    const reasons = [];
    
    if (priorities.includes('no_ads') && !plan.advertisingRestrictions.hasAds) {
      reasons.push('Experiência sem anúncios');
    }
    
    if (priorities.includes('quality') && plan.qualityRestrictions.maxQuality.includes('HD')) {
      reasons.push('Alta qualidade de vídeo');
    }
    
    if (usage === 'uso_intensivo' && plan.downloadRestrictions.isUnlimited) {
      reasons.push('Downloads ilimitados');
    }

    return reasons;
  }

  static _getKeyBenefits(plan) {
    const benefits = [];
    
    if (!plan.advertisingRestrictions.hasAds) benefits.push('Sem anúncios');
    if (plan.downloadRestrictions.isUnlimited) benefits.push('Downloads ilimitados');
    if (plan.qualityRestrictions.maxQuality.includes('4K')) benefits.push('Qualidade 4K');
    if (plan.deviceRestrictions.maxConcurrentDevices > 3) benefits.push('Múltiplos dispositivos');
    
    return benefits;
  }

  static _getPriceJustification(plan, budget) {
    if (plan.price === 0) return 'Completamente gratuito';
    if (budget === 'low') return 'Melhor opção dentro do seu orçamento';
    if (budget === 'high') return 'Investimento que vale a pena pelos benefícios';
    return 'Boa relação custo-benefício';
  }

  static _getMainBenefit(plan) {
    if (plan.downloadRestrictions.isUnlimited) return 'Downloads ilimitados';
    if (!plan.advertisingRestrictions.hasAds) return 'Sem anúncios';
    if (plan.price === 0) return 'Gratuito';
    return 'Custo-benefício balanceado';
  }

  static _getMainLimitation(plan) {
    if (plan.advertisingRestrictions.hasAds) return 'Com anúncios';
    if (!plan.downloadRestrictions.isUnlimited) return 'Downloads limitados';
    if (plan.deviceRestrictions.maxConcurrentDevices === 1) return 'Apenas 1 dispositivo';
    return 'Algumas restrições aplicam-se';
  }
}

export default PlanRestrictionsController;
