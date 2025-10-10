/**
 * 🧪 Testes Unitários - Serviço de Restrições de Planos
 * 
 * Testa todas as funcionalidades do PlanRestrictionsService para garantir
 * que o sistema RF08 exibe corretamente as restrições antes da compra.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import PlanRestrictionsService from '../../../src/services/planRestrictionsService.js';
import { PLAN_CONFIGS } from '../../../src/utils/planUtils.js';
import { APIError } from '../../../src/utils/ApiError.js';

describe('🚫 PlanRestrictionsService - Testes Unitários', () => {

  describe('📋 getPlanRestrictions', () => {
    
    it('deve retornar restrições detalhadas para plano free', () => {
      const result = PlanRestrictionsService.getPlanRestrictions('free');
      
      expect(result).toHaveProperty('planType', 'free');
      expect(result).toHaveProperty('planName', 'Gratuito');
      expect(result).toHaveProperty('downloadRestrictions');
      expect(result).toHaveProperty('advertisingRestrictions');
      expect(result).toHaveProperty('criticalLimitations');
      
      // Verificar restrições específicas do plano gratuito
      expect(result.downloadRestrictions.monthlyLimit).toBe(10);
      expect(result.advertisingRestrictions.hasAds).toBe(true);
      expect(result.criticalLimitations).toContain('🚫 Anúncios obrigatórios durante a reprodução');
    });

    it('deve retornar restrições detalhadas para plano monthly', () => {
      const result = PlanRestrictionsService.getPlanRestrictions('monthly');
      
      expect(result).toHaveProperty('planType', 'monthly');
      expect(result).toHaveProperty('planName', 'Mensal');
      expect(result.advertisingRestrictions.hasAds).toBe(false);
      expect(result.downloadRestrictions.monthlyLimit).toBe(100);
    });

    it('deve retornar restrições mínimas para plano lifetime', () => {
      const result = PlanRestrictionsService.getPlanRestrictions('lifetime');
      
      expect(result).toHaveProperty('planType', 'lifetime');
      expect(result).toHaveProperty('planName', 'Vitalício');
      expect(result.advertisingRestrictions.hasAds).toBe(false);
      expect(result.downloadRestrictions.isUnlimited).toBe(true);
      expect(result.criticalLimitations).toHaveLength(0);
    });

    it('deve lançar erro para plano inválido', () => {
      expect(() => {
        PlanRestrictionsService.getPlanRestrictions('invalid');
      }).toThrow(APIError);
    });

    it('deve incluir recomendações de upgrade quando apropriado', () => {
      const freeRestrictions = PlanRestrictionsService.getPlanRestrictions('free');
      const monthlyRestrictions = PlanRestrictionsService.getPlanRestrictions('monthly');
      
      expect(freeRestrictions.upgradeRecommendations).toBeDefined();
      expect(freeRestrictions.upgradeRecommendations.length).toBeGreaterThan(0);
      expect(monthlyRestrictions.upgradeRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('📊 comparePlanRestrictions', () => {
    
    it('deve comparar todos os planos quando nenhum é especificado', () => {
      const result = PlanRestrictionsService.comparePlanRestrictions();
      
      expect(result).toHaveProperty('plans');
      expect(result).toHaveProperty('comparisonMatrix');
      expect(result).toHaveProperty('recommendationsByUsage');
      
      expect(result.plans).toHaveLength(3);
      expect(result.comparisonMatrix).toHaveProperty('downloads');
      expect(result.comparisonMatrix).toHaveProperty('ads');
      expect(result.recommendationsByUsage).toHaveProperty('uso_esporadico');
    });

    it('deve comparar apenas planos especificados', () => {
      const result = PlanRestrictionsService.comparePlanRestrictions(['free', 'monthly']);
      
      expect(result.plans).toHaveLength(2);
      expect(result.plans.some(p => p.planType === 'free')).toBe(true);
      expect(result.plans.some(p => p.planType === 'monthly')).toBe(true);
      expect(result.plans.some(p => p.planType === 'lifetime')).toBe(false);
    });

    it('deve gerar matriz de comparação correta', () => {
      const result = PlanRestrictionsService.comparePlanRestrictions(['free', 'lifetime']);
      
      expect(result.comparisonMatrix.downloads.free).toBe(10);
      expect(result.comparisonMatrix.downloads.lifetime).toBe('Ilimitado');
      expect(result.comparisonMatrix.ads.free).toBe('Com anúncios');
      expect(result.comparisonMatrix.ads.lifetime).toBe('Sem anúncios');
    });

    it('deve incluir recomendações por tipo de uso', () => {
      const result = PlanRestrictionsService.comparePlanRestrictions();
      
      expect(result.recommendationsByUsage.uso_esporadico).toBe('free');
      expect(result.recommendationsByUsage.uso_intensivo).toBe('lifetime');
      expect(['monthly', 'lifetime']).toContain(result.recommendationsByUsage.uso_familiar);
    });

    it('deve lançar erro para planos inválidos', () => {
      expect(() => {
        PlanRestrictionsService.comparePlanRestrictions(['free', 'invalid']);
      }).toThrow(APIError);
    });
  });

  describe('⚠️ getPurchaseWarnings', () => {
    
    it('deve gerar avisos críticos para plano free', () => {
      const result = PlanRestrictionsService.getPurchaseWarnings('free');
      
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('recommendProceed');
      
      expect(result.warnings.critical.length).toBeGreaterThan(0);
      expect(result.riskLevel).toBe('high');
      expect(result.recommendProceed).toBe(false);
    });

    it('deve gerar poucos avisos para plano lifetime', () => {
      const result = PlanRestrictionsService.getPurchaseWarnings('lifetime');
      
      expect(result.warnings.critical).toHaveLength(0);
      expect(result.riskLevel).toBe('minimal');
      expect(result.recommendProceed).toBe(true);
    });

    it('deve incluir análise personalizada quando perfil fornecido', () => {
      const userProfile = {
        usage: 'uso_intensivo',
        budget: 'low',
        experience: 'iniciante'
      };
      
      const result = PlanRestrictionsService.getPurchaseWarnings('free', null, userProfile);
      
      expect(result).toHaveProperty('userSpecificAnalysis');
      expect(result.userSpecificAnalysis.personalizedWarnings.length).toBeGreaterThan(0);
    });

    it('deve incluir sugestões de alternativas', () => {
      const result = PlanRestrictionsService.getPurchaseWarnings('free');
      
      expect(result).toHaveProperty('alternativeSuggestions');
      expect(result.alternativeSuggestions.length).toBeGreaterThan(0);
    });

    it('deve calcular nível de risco corretamente', () => {
      const freeWarnings = PlanRestrictionsService.getPurchaseWarnings('free');
      const monthlyWarnings = PlanRestrictionsService.getPurchaseWarnings('monthly');
      const lifetimeWarnings = PlanRestrictionsService.getPurchaseWarnings('lifetime');
      
      const riskLevels = ['minimal', 'low', 'medium', 'high'];
      
      expect(riskLevels).toContain(freeWarnings.riskLevel);
      expect(riskLevels).toContain(monthlyWarnings.riskLevel);
      expect(riskLevels).toContain(lifetimeWarnings.riskLevel);
      
      // Free deve ter risco maior que lifetime
      const freeRiskIndex = riskLevels.indexOf(freeWarnings.riskLevel);
      const lifetimeRiskIndex = riskLevels.indexOf(lifetimeWarnings.riskLevel);
      expect(freeRiskIndex).toBeGreaterThan(lifetimeRiskIndex);
    });
  });

  describe('🎯 getPersonalizedRecommendation', () => {
    
    it('deve recomendar plano baseado no perfil do usuário', () => {
      const userData = { currentPlan: 'free' };
      const preferences = {
        usage: 'uso_regular',
        budget: 'medium',
        priorities: ['no_ads', 'quality']
      };
      
      const result = PlanRestrictionsService.getPersonalizedRecommendation(userData, preferences);
      
      expect(result).toHaveProperty('recommendedPlan');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('matchReasons');
      expect(result).toHaveProperty('keyBenefits');
      
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.matchReasons.length).toBeGreaterThan(0);
    });

    it('deve ter alta confiança para perfis claros', () => {
      const userData = { currentPlan: 'free' };
      const preferences = {
        usage: 'uso_intensivo',
        budget: 'high',
        priorities: ['unlimited_downloads', 'no_ads', 'quality']
      };
      
      const result = PlanRestrictionsService.getPersonalizedRecommendation(userData, preferences);
      
      expect(result.recommendedPlan).toBe('lifetime');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('deve recomendar free para uso esporádico com orçamento baixo', () => {
      const userData = { currentPlan: null };
      const preferences = {
        usage: 'uso_esporadico',
        budget: 'low',
        priorities: []
      };
      
      const result = PlanRestrictionsService.getPersonalizedRecommendation(userData, preferences);
      
      expect(result.recommendedPlan).toBe('free');
    });

    it('deve incluir limitações potenciais na recomendação', () => {
      const userData = { currentPlan: 'free' };
      const preferences = {
        usage: 'uso_regular',
        budget: 'medium',
        priorities: ['no_ads']
      };
      
      const result = PlanRestrictionsService.getPersonalizedRecommendation(userData, preferences);
      
      expect(result).toHaveProperty('potentialLimitations');
      expect(Array.isArray(result.potentialLimitations)).toBe(true);
    });

    it('deve sugerir alternativas quando apropriado', () => {
      const userData = { currentPlan: 'monthly' };
      const preferences = {
        usage: 'uso_familiar',
        budget: 'medium',
        priorities: ['devices', 'unlimited_downloads']
      };
      
      const result = PlanRestrictionsService.getPersonalizedRecommendation(userData, preferences);
      
      expect(result).toHaveProperty('alternatives');
      expect(Array.isArray(result.alternatives)).toBe(true);
    });
  });

  describe('📈 getRestrictionStats', () => {
    
    it('deve retornar estatísticas básicas dos planos', () => {
      const result = PlanRestrictionsService.getRestrictionStats();
      
      expect(result).toHaveProperty('totalPlans', 3);
      expect(result).toHaveProperty('mostRestrictive');
      expect(result).toHaveProperty('leastRestrictive');
      expect(result).toHaveProperty('commonRestrictions');
      
      expect(result.mostRestrictive.plan).toBe('free');
      expect(result.leastRestrictive.plan).toBe('lifetime');
    });

    it('deve incluir quebra por categoria quando solicitado', () => {
      const result = PlanRestrictionsService.getRestrictionStats({ includeDetails: true });
      
      expect(result).toHaveProperty('categoryBreakdown');
      expect(result.categoryBreakdown).toHaveProperty('download');
      expect(result.categoryBreakdown).toHaveProperty('advertising');
      expect(result.categoryBreakdown).toHaveProperty('quality');
    });

    it('deve filtrar por categoria específica', () => {
      const result = PlanRestrictionsService.getRestrictionStats({ 
        category: 'advertising',
        includeDetails: true 
      });
      
      expect(result).toHaveProperty('categoryAnalysis');
      expect(result.categoryAnalysis.category).toBe('advertising');
    });
  });

  describe('🔧 Funções auxiliares', () => {
    
    it('deve categorizar corretamente as restrições', () => {
      const freeRestrictions = PlanRestrictionsService.getPlanRestrictions('free');
      
      // Testar se todas as categorias principais estão presentes
      expect(freeRestrictions).toHaveProperty('downloadRestrictions');
      expect(freeRestrictions).toHaveProperty('advertisingRestrictions');
      expect(freeRestrictions).toHaveProperty('qualityRestrictions');
      expect(freeRestrictions).toHaveProperty('deviceRestrictions');
      expect(freeRestrictions).toHaveProperty('supportRestrictions');
      expect(freeRestrictions).toHaveProperty('contentRestrictions');
      expect(freeRestrictions).toHaveProperty('offlineRestrictions');
    });

    it('deve validar consistência entre planos', () => {
      const plans = ['free', 'monthly', 'lifetime'];
      const restrictions = plans.map(plan => 
        PlanRestrictionsService.getPlanRestrictions(plan)
      );
      
      // Verificar que preços são progressivos
      expect(restrictions[0].planPrice.value).toBeLessThan(restrictions[1].planPrice.value);
      expect(restrictions[1].planPrice.value).toBeLessThan(restrictions[2].planPrice.value);
      
      // Verificar que restrições diminuem conforme plano melhora
      expect(restrictions[0].criticalLimitations.length)
        .toBeGreaterThan(restrictions[2].criticalLimitations.length);
    });
  });

  describe('🚨 Tratamento de erros', () => {
    
    it('deve lançar APIError para parâmetros inválidos', () => {
      expect(() => {
        PlanRestrictionsService.getPlanRestrictions(null);
      }).toThrow(APIError);
      
      expect(() => {
        PlanRestrictionsService.getPlanRestrictions('');
      }).toThrow(APIError);
      
      expect(() => {
        PlanRestrictionsService.comparePlanRestrictions([]);
      }).toThrow(APIError);
    });

    it('deve tratar graciosamente perfis de usuário inválidos', () => {
      const invalidProfile = { invalid: 'data' };
      
      expect(() => {
        PlanRestrictionsService.getPurchaseWarnings('free', invalidProfile);
      }).not.toThrow();
      
      // Deve retornar avisos padrão mesmo com perfil inválido
      const result = PlanRestrictionsService.getPurchaseWarnings('free', invalidProfile);
      expect(result).toHaveProperty('warnings');
    });

    it('deve validar prioridades na recomendação personalizada', () => {
      const userData = { currentPlan: 'free' };
      const invalidPreferences = {
        usage: 'invalid_usage',
        budget: 'invalid_budget',
        priorities: ['invalid_priority']
      };
      
      expect(() => {
        PlanRestrictionsService.getPersonalizedRecommendation(userData, invalidPreferences);
      }).not.toThrow();
      
      // Deve usar valores padrão para dados inválidos
      const result = PlanRestrictionsService.getPersonalizedRecommendation(userData, invalidPreferences);
      expect(result).toHaveProperty('recommendedPlan');
    });
  });
});
