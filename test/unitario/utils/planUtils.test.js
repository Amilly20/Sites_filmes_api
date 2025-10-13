import { describe, beforeEach, test, expect } from '@jest/globals';
import { 
  PLAN_TYPES, 
  PLAN_CONFIGS, 
  isPlanActive, 
  hasFeature, 
  getRemainingDownloads,
  isValidUpgrade,
  isValidDowngrade,
  calculateUpgradeBenefits,
  formatPrice,
  getPlanStatus
} from '../../../src/utils/planUtils.js';

describe('💎 Plan Utils', () => {
  describe('PLAN_TYPES', () => {
    test('deve ter tipos de plano definidos', () => {
      expect(PLAN_TYPES.FREE).toBe('free');
      expect(PLAN_TYPES.MONTHLY).toBe('monthly');
      expect(PLAN_TYPES.LIFETIME).toBe('lifetime');
    });

    test('deve ter todos os tipos necessários', () => {
      const expectedTypes = ['FREE', 'MONTHLY', 'LIFETIME'];
      expectedTypes.forEach(type => {
        expect(PLAN_TYPES).toHaveProperty(type);
      });
    });
  });

  describe('PLAN_CONFIGS', () => {
    test('deve ter configurações para todos os planos', () => {
      Object.values(PLAN_TYPES).forEach(planType => {
        expect(PLAN_CONFIGS).toHaveProperty(planType);
        expect(PLAN_CONFIGS[planType]).toHaveProperty('name');
        expect(PLAN_CONFIGS[planType]).toHaveProperty('displayName');
        expect(PLAN_CONFIGS[planType]).toHaveProperty('price');
      });
    });

    test('deve ter estrutura correta para plano free', () => {
      const freeConfig = PLAN_CONFIGS[PLAN_TYPES.FREE];
      expect(freeConfig.price).toBe(0);
      expect(freeConfig.features.showAds).toBe(true);
      expect(freeConfig.features.monthlyDownloads).toBeGreaterThan(0);
    });

    test('deve ter estrutura correta para plano monthly', () => {
      const monthlyConfig = PLAN_CONFIGS[PLAN_TYPES.MONTHLY];
      expect(monthlyConfig.price).toBeGreaterThan(0);
      expect(monthlyConfig.features.showAds).toBe(false);
      expect(monthlyConfig.duration).toBe(30);
    });

    test('deve ter estrutura correta para plano lifetime', () => {
      const lifetimeConfig = PLAN_CONFIGS[PLAN_TYPES.LIFETIME];
      expect(lifetimeConfig.price).toBeGreaterThan(0);
      expect(lifetimeConfig.features.monthlyDownloads).toBe(0); // ilimitado
      expect(lifetimeConfig.duration).toBeNull(); // vitalício
    });

    test('deve ter features definidas para todos os planos', () => {
      Object.values(PLAN_CONFIGS).forEach(config => {
        expect(config.features).toHaveProperty('showAds');
        expect(config.features).toHaveProperty('monthlyDownloads');
        expect(config.features).toHaveProperty('unlimitedAccess');
        expect(config.features).toHaveProperty('hdQuality');
        expect(config.features).toHaveProperty('simultaneousDevices');
      });
    });
  });

  describe('isPlanActive', () => {
    test('deve retornar true para plano free', () => {
      const user = {
        plan: { type: 'free' }
      };
      expect(isPlanActive(user)).toBe(true);
    });

    test('deve retornar true para plano vitalício', () => {
      const user = {
        plan: { type: 'lifetime' }
      };
      expect(isPlanActive(user)).toBe(true);
    });

    test('deve retornar true para plano mensal ativo', () => {
      const user = {
        plan: {
          type: 'monthly',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias no futuro
        }
      };
      expect(isPlanActive(user)).toBe(true);
    });

    test('deve retornar false para plano mensal expirado', () => {
      const user = {
        plan: {
          type: 'monthly',
          endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
        }
      };
      expect(isPlanActive(user)).toBe(false);
    });

    test('deve retornar false se não há plano', () => {
      const user = {};
      expect(isPlanActive(user)).toBe(false);
    });
  });

  describe('hasFeature', () => {
    test('deve verificar features corretamente', () => {
      expect(hasFeature('free', 'showAds')).toBe(true);
      expect(hasFeature('monthly', 'showAds')).toBe(false);
      expect(hasFeature('lifetime', 'unlimitedAccess')).toBe(true);
      expect(hasFeature('free', 'hdQuality')).toBe(false);
    });

    test('deve retornar false para plano inexistente', () => {
      expect(hasFeature('invalid', 'showAds')).toBe(false);
    });

    test('deve retornar false para feature inexistente', () => {
      expect(hasFeature('free', 'invalidFeature')).toBe(false);
    });
  });

  describe('getRemainingDownloads', () => {
    test('deve retornar Infinity para plano lifetime', () => {
      const user = {
        plan: {
          type: 'lifetime',
          downloadsUsed: 50,
          monthlyDownloadsReset: new Date()
        }
      };
      expect(getRemainingDownloads(user)).toBe(Infinity);
    });

    test('deve calcular downloads restantes corretamente', () => {
      const user = {
        plan: {
          type: 'free',
          downloadsUsed: 3,
          monthlyDownloadsReset: new Date()
        }
      };
      expect(getRemainingDownloads(user)).toBe(7); // 10 - 3
    });

    test('deve resetar quando passou um mês', () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const user = {
        plan: {
          type: 'monthly',
          downloadsUsed: 50,
          monthlyDownloadsReset: lastMonth
        }
      };
      expect(getRemainingDownloads(user)).toBe(100); // Reset completo
    });

    test('deve retornar 0 se sem plano', () => {
      const user = {};
      expect(getRemainingDownloads(user)).toBe(0);
    });
  });

  describe('isValidUpgrade', () => {
    test('deve validar upgrades corretos', () => {
      expect(isValidUpgrade('free', 'monthly')).toBe(true);
      expect(isValidUpgrade('free', 'lifetime')).toBe(true);
      expect(isValidUpgrade('monthly', 'lifetime')).toBe(true);
    });

    test('deve rejeitar downgrades', () => {
      expect(isValidUpgrade('monthly', 'free')).toBe(false);
      expect(isValidUpgrade('lifetime', 'monthly')).toBe(false);
      expect(isValidUpgrade('lifetime', 'free')).toBe(false);
    });

    test('deve rejeitar upgrade para o mesmo plano', () => {
      expect(isValidUpgrade('free', 'free')).toBe(false);
      expect(isValidUpgrade('monthly', 'monthly')).toBe(false);
    });
  });

  describe('isValidDowngrade', () => {
    test('deve validar downgrades corretos', () => {
      expect(isValidDowngrade('monthly', 'free')).toBe(true);
      expect(isValidDowngrade('lifetime', 'monthly')).toBe(true);
      expect(isValidDowngrade('lifetime', 'free')).toBe(true);
    });

    test('deve rejeitar upgrades', () => {
      expect(isValidDowngrade('free', 'monthly')).toBe(false);
      expect(isValidDowngrade('monthly', 'lifetime')).toBe(false);
    });
  });

  describe('calculateUpgradeBenefits', () => {
    test('deve calcular benefícios de upgrade', () => {
      const result = calculateUpgradeBenefits('free', 'monthly');
      
      expect(result.benefits).toContain('Aumento para 100 downloads mensais');
      expect(result.benefits).toContain('Experiência sem propagandas');
      expect(result.improvements.downloads).toBe('+90');
    });

    test('deve detectar downloads ilimitados', () => {
      const result = calculateUpgradeBenefits('monthly', 'lifetime');
      
      expect(result.improvements.downloads).toBe('Ilimitados');
      expect(result.benefits).toContain('Downloads ilimitados por mês');
    });

    test('deve retornar vazio para planos inválidos', () => {
      const result = calculateUpgradeBenefits('invalid', 'monthly');
      
      expect(result.benefits).toEqual([]);
      expect(result.improvements).toEqual({});
    });
  });

  describe('formatPrice', () => {
    test('deve formatar preços corretamente', () => {
      expect(formatPrice(0)).toBe('Gratuito');
      expect(formatPrice(19.90)).toContain('19,90');
      expect(formatPrice(299.90)).toContain('299,90');
    });

    test('deve aceitar moeda customizada', () => {
      expect(formatPrice(10, 'USD')).toContain('10');
    });
  });

  describe('getPlanStatus', () => {
    test('deve retornar status ativo para plano free', () => {
      const userPlan = { type: 'free' };
      const status = getPlanStatus(userPlan);
      
      expect(status.active).toBe(true);
      expect(status.status).toBe('active');
    });

    test('deve retornar status ativo para plano lifetime', () => {
      const userPlan = { type: 'lifetime' };
      const status = getPlanStatus(userPlan);
      
      expect(status.active).toBe(true);
      expect(status.status).toBe('active');
    });

    test('deve detectar plano expirado', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const userPlan = {
        type: 'monthly',
        endDate: yesterday
      };
      
      const status = getPlanStatus(userPlan);
      
      expect(status.active).toBe(false);
      expect(status.status).toBe('expired');
    });

    test('deve detectar plano próximo ao vencimento', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const userPlan = {
        type: 'monthly',
        endDate: tomorrow
      };
      
      const status = getPlanStatus(userPlan);
      
      expect(status.active).toBe(true);
      expect(status.status).toBe('expiring');
      expect(status.daysLeft).toBe(1);
    });

    test('deve lidar com usuário sem plano', () => {
      const status = getPlanStatus(null);
      
      expect(status.active).toBe(true);
      expect(status.status).toBe('free');
    });
  });

  describe('Integração entre funções', () => {
    test('deve usar PLAN_CONFIGS corretamente', () => {
      Object.values(PLAN_TYPES).forEach(planType => {
        expect(hasFeature(planType, 'showAds')).toBeDefined();
        expect(typeof formatPrice(PLAN_CONFIGS[planType].price)).toBe('string');
      });
    });

    test('deve manter consistência entre hierarquia e validações', () => {
      expect(isValidUpgrade('free', 'monthly')).toBe(true);
      expect(isValidDowngrade('monthly', 'free')).toBe(true);
      expect(isValidUpgrade('monthly', 'free')).toBe(false);
    });

    test('deve calcular benefícios baseado nas configurações', () => {
      const benefits = calculateUpgradeBenefits('free', 'lifetime');
      expect(benefits.improvements.downloads).toBe('Ilimitados');
      expect(benefits.improvements.ads).toBe('Removidas');
    });
  });
});
