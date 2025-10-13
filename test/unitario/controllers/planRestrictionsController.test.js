/**
 * 🧪 Testes Unitários do Controller de Restrições de Planos
 * 
 * Focando nos métodos que não dependem de validationResult
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockService = {
  getPlanRestrictions: jest.fn(),
  comparePlanRestrictions: jest.fn(),
  getPurchaseWarnings: jest.fn(),
  getPersonalizedRecommendation: jest.fn(),
  getRestrictionStats: jest.fn()
};

const mockValidationResult = jest.fn();

// Configurar mocks antes da importação
jest.unstable_mockModule('../../../src/services/planRestrictionsService.js', () => ({
  default: mockService
}));

jest.unstable_mockModule('express-validator', () => ({
  validationResult: mockValidationResult
}));

// Importar após configurar mocks
const PlanRestrictionsController = (await import('../../../src/controllers/planRestrictionsController.js')).default;

describe('🚫 PlanRestrictionsController - Testes Unitários', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { planType: 'free' },
      query: {},
      user: { id: 'user123', currentPlan: 'free' }
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    next = jest.fn();

    // Mock validationResult para retornar vazio (sem erros)
    mockValidationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([])
    });

    jest.clearAllMocks();
  });

  describe('📋 getPlanRestrictions', () => {
    it('deve retornar restrições do plano com sucesso', async () => {
      // Arrange
      const mockRestrictions = {
        planType: 'free',
        planName: 'Gratuito',
        downloadRestrictions: { monthlyLimit: 10 },
        advertisingRestrictions: { hasAds: true }
      };

      mockService.getPlanRestrictions.mockReturnValue(mockRestrictions);

      // Act
      await PlanRestrictionsController.getPlanRestrictions(req, res, next);

      // Assert
      expect(mockService.getPlanRestrictions).toHaveBeenCalledWith('free');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Restrições do plano Gratuito carregadas com sucesso',
        data: { restrictions: mockRestrictions }
      });
    });
  });

  describe('📊 comparePlanRestrictions', () => {
    it('deve comparar planos com sucesso', async () => {
      // Arrange
      const mockComparison = {
        plans: [
          { planType: 'free', planName: 'Gratuito' },
          { planType: 'monthly', planName: 'Mensal' },
          { planType: 'lifetime', planName: 'Vitalício' }
        ]
      };

      mockService.comparePlanRestrictions.mockReturnValue(mockComparison);

      // Act
      await PlanRestrictionsController.comparePlanRestrictions(req, res, next);

      // Assert
      expect(mockService.comparePlanRestrictions).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comparação de restrições gerada com sucesso',
        data: {
          comparison: mockComparison,
          totalPlans: 3,
          comparedAt: expect.any(String)
        }
      });
    });
  });

});
