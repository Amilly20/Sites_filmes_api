import { describe, beforeEach, afterEach, beforeAll, afterAll, test, expect } from '@jest/globals';
import PlanService from '../../../src/services/planService.js';
import TestDatabase from '../../helpers/testDatabase.js';
import User from '../../../src/models/User.js';
import Plan from '../../../src/models/Plan.js';

describe('PlanService', () => {
  beforeAll(async () => {
    await TestDatabase.connect();
  }, 30000);

  afterAll(async () => {
    await TestDatabase.disconnect();
  }, 30000);

  beforeEach(async () => {
    await User.deleteMany({});
    await Plan.deleteMany({});
  });

  describe('listPlans', () => {
    test('deve retornar planos ativos do banco de dados', async () => {
      // Criar planos de teste
      await Plan.create([
        { name: 'free', displayName: 'Gratuito', price: 0, active: true },
        { name: 'monthly', displayName: 'Mensal', price: 19.90, active: true },
        { name: 'lifetime', displayName: 'Vitalício', price: 299.90, active: false }
      ]);

      const plans = await PlanService.listPlans();

      expect(plans).toHaveLength(2); // Apenas os ativos
      expect(plans[0].price).toBe(0); // Ordenado por preço
      expect(plans[1].price).toBe(19.90);
    });

    test('deve retornar configurações padrão quando não há planos no banco', async () => {
      const plans = await PlanService.listPlans();

      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
    });
  });

  describe('changePlan', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        plan: {
          type: 'free',
          startDate: new Date(),
          endDate: null
        }
      });
    });

    test('deve alterar plano de free para monthly', async () => {
      const result = await PlanService.changePlan(testUser._id, 'monthly');

      expect(result).toBeDefined();

      // Verificar se foi salvo no banco
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.plan.type).toBe('monthly');
    });

    test('deve rejeitar plano inválido', async () => {
      await expect(
        PlanService.changePlan(testUser._id, 'invalid_plan')
      ).rejects.toThrow();
    });

    test('deve rejeitar usuário inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(
        PlanService.changePlan(fakeId, 'monthly')
      ).rejects.toThrow();
    });

    test('deve alterar para plano lifetime', async () => {
      const result = await PlanService.changePlan(testUser._id, 'lifetime');

      expect(result).toBeDefined();
    });
  });

  describe('getUserPlanInfo', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        plan: {
          type: 'monthly',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
        },
        downloads: []
      });
    });

    test('deve retornar informações completas do plano', async () => {
      const planInfo = await PlanService.getUserPlanInfo(testUser._id);

      expect(planInfo.currentPlan.type).toBe('monthly');
      expect(planInfo.planDetails).toBeDefined();
      expect(planInfo.usage).toBeDefined();
    });

    test('deve rejeitar usuário inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(
        PlanService.getUserPlanInfo(fakeId)
      ).rejects.toThrow();
    });
  });

  describe('registerDownload', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        plan: {
          type: 'monthly',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        downloads: []
      });
    });

    test('deve registrar download com sucesso', async () => {
      const movieId = '507f1f77bcf86cd799439012';
      const result = await PlanService.registerDownload(testUser._id, movieId);

      expect(result).toBeDefined();

      // Verificar se foi salvo no banco
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser).toBeDefined();
    });

    test('deve rejeitar usuário inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const movieId = '507f1f77bcf86cd799439012';
      
      await expect(
        PlanService.registerDownload(fakeId, movieId)
      ).rejects.toThrow();
    });

    test('deve rejeitar usuário com plano inativo', async () => {
      // Expirar o plano
      await User.findByIdAndUpdate(testUser._id, {
        'plan.endDate': new Date(Date.now() - 24 * 60 * 60 * 1000) // Ontem
      });

      const movieId = '507f1f77bcf86cd799439012';
      
      await expect(
        PlanService.registerDownload(testUser._id, movieId)
      ).rejects.toThrow();
    });
  });
});
