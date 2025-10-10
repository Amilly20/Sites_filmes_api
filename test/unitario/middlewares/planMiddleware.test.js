import { describe, beforeEach, test, expect, jest } from '@jest/globals';

// Mock das funções utilitárias
const mockPlanUtils = {
  hasFeature: jest.fn(),
  isPlanActive: jest.fn(),
  PLAN_CONFIGS: {
    free: { displayName: 'Gratuito' },
    monthly: { displayName: 'Mensal' },
    lifetime: { displayName: 'Vitalício' }
  }
};

const mockMessages = {
  sendError: jest.fn((res, code, errors) => ({ code, errors }))
};

// Mock dos módulos
jest.unstable_mockModule('../../../src/utils/planUtils.js', () => mockPlanUtils);
jest.unstable_mockModule('../../../src/utils/messages.js', () => mockMessages);

describe('Plan Middleware', () => {
  let req, res, next;
  let planMiddleware;

  beforeEach(async () => {
    req = { user: null };
    res = {};
    next = jest.fn();
    
    jest.clearAllMocks();
    
    // Import após setup dos mocks
    planMiddleware = await import('../../../src/middlewares/planMiddleware.js');
  });

  describe('requirePlan', () => {
    test('deve existir função requirePlan', () => {
      expect(typeof planMiddleware.requirePlan).toBe('function');
    });

    test('deve retornar middleware function', () => {
      const middleware = planMiddleware.requirePlan('monthly');
      expect(typeof middleware).toBe('function');
    });

    test('deve rejeitar usuário não autenticado', () => {
      req.user = null;
      const middleware = planMiddleware.requirePlan('monthly');
      
      middleware(req, res, next);
      
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 401, [
        { path: "auth", message: "Acesso negado. Faça login primeiro." }
      ]);
      expect(next).not.toHaveBeenCalled();
    });

    test('deve verificar se plano está ativo', () => {
      req.user = { plan: { type: 'monthly' } };
      mockPlanUtils.isPlanActive.mockReturnValue(false);
      
      const middleware = planMiddleware.requirePlan('monthly');
      middleware(req, res, next);
      
      expect(mockPlanUtils.isPlanActive).toHaveBeenCalledWith(req.user);
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 403, [
        { path: "plan", message: "Seu plano expirou. Renove sua assinatura." }
      ]);
    });
  });

  describe('requireFeature', () => {
    test('deve existir função requireFeature', () => {
      expect(typeof planMiddleware.requireFeature).toBe('function');
    });

    test('deve retornar middleware function', () => {
      const middleware = planMiddleware.requireFeature('hd_streaming');
      expect(typeof middleware).toBe('function');
    });

    test('deve verificar feature do usuário', () => {
      req.user = { plan: { type: 'free' } };
      mockPlanUtils.isPlanActive.mockReturnValue(true);
      mockPlanUtils.hasFeature.mockReturnValue(false);
      
      const middleware = planMiddleware.requireFeature('hd_streaming');
      middleware(req, res, next);
      
      expect(mockPlanUtils.hasFeature).toHaveBeenCalledWith('free', 'hd_streaming');
    });
  });

  describe('checkDownloadLimit', () => {
    test('deve existir função checkDownloadLimit', () => {
      expect(typeof planMiddleware.checkDownloadLimit).toBe('function');
    });

    test('deve retornar middleware function', () => {
      const middleware = planMiddleware.checkDownloadLimit();
      expect(typeof middleware).toBe('function');
    });
  });

  describe('shouldShowAds', () => {
    test('deve existir função shouldShowAds', () => {
      expect(typeof planMiddleware.shouldShowAds).toBe('function');
    });

    test('deve definir showAds para usuário não autenticado', () => {
      req.user = null;
      
      const middleware = planMiddleware.shouldShowAds();
      middleware(req, res, next);
      
      expect(req.showAds).toBe(true);
      expect(next).toHaveBeenCalled();
    });

    test('deve usar hasFeature para usuário autenticado', () => {
      req.user = { plan: { type: 'free' } };
      mockPlanUtils.hasFeature.mockReturnValue(true);
      
      const middleware = planMiddleware.shouldShowAds();
      middleware(req, res, next);
      
      expect(mockPlanUtils.hasFeature).toHaveBeenCalledWith('free', 'showAds');
      expect(req.showAds).toBe(true);
      expect(next).toHaveBeenCalled();
    });
  });
});
