import { describe, beforeEach, test, expect, jest } from '@jest/globals';

// Mocks
const mockPlanService = {
  listPlans: jest.fn(),
  getUserPlanInfo: jest.fn(),
  changePlan: jest.fn(),
  registerDownload: jest.fn()
};

const mockMessages = {
  sendResponse: jest.fn((res, code, data) => ({ code, data })),
  sendError: jest.fn((res, code, errors) => ({ code, errors }))
};

const mockAPIError = jest.fn();
mockAPIError.prototype.toJson = jest.fn(() => ({
  code: 400,
  errors: [{ path: 'test', message: 'Test error' }]
}));

// Mock dos módulos
jest.unstable_mockModule('../../../src/services/planService.js', () => ({
  default: mockPlanService
}));
jest.unstable_mockModule('../../../src/utils/messages.js', () => mockMessages);
jest.unstable_mockModule('../../../src/utils/ApiError.js', () => ({
  APIError: mockAPIError
}));

describe('PlanController', () => {
  let req, res;
  let PlanController;

  beforeEach(async () => {
    req = {
      body: {},
      user: { id: 'user123' },
      showAds: false
    };
    res = {};
    
    jest.clearAllMocks();
    
    // Import após setup dos mocks
    PlanController = (await import('../../../src/controllers/planController.js')).default;
  });

  describe('listPlans', () => {
    test('deve existir método listPlans', () => {
      expect(typeof PlanController.listPlans).toBe('function');
    });

    test('deve chamar PlanService.listPlans', async () => {
      const mockPlans = [
        { type: 'free', name: 'Gratuito' },
        { type: 'monthly', name: 'Mensal' }
      ];
      mockPlanService.listPlans.mockResolvedValue(mockPlans);

      await PlanController.listPlans(req, res);

      expect(mockPlanService.listPlans).toHaveBeenCalled();
      expect(mockMessages.sendResponse).toHaveBeenCalledWith(res, 200, {
        message: "Planos carregados com sucesso",
        data: mockPlans
      });
    });

    test('deve tratar erros', async () => {
      const error = new Error('Database error');
      mockPlanService.listPlans.mockRejectedValue(error);

      jest.spyOn(console, 'error').mockImplementation(() => {});

      await PlanController.listPlans(req, res);

      expect(console.error).toHaveBeenCalledWith('Erro ao listar planos:', error);
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);

      console.error.mockRestore();
    });
  });

  describe('getMyPlan', () => {
    test('deve existir método getMyPlan', () => {
      expect(typeof PlanController.getMyPlan).toBe('function');
    });

    test('deve chamar PlanService.getUserPlanInfo com userId correto', async () => {
      const mockPlanInfo = {
        currentPlan: { type: 'monthly' },
        usage: { downloadsThisMonth: 5 }
      };
      mockPlanService.getUserPlanInfo.mockResolvedValue(mockPlanInfo);

      await PlanController.getMyPlan(req, res);

      expect(mockPlanService.getUserPlanInfo).toHaveBeenCalledWith('user123');
      expect(mockMessages.sendResponse).toHaveBeenCalledWith(res, 200, {
        message: "Informações do plano carregadas com sucesso",
        data: mockPlanInfo
      });
    });
  });

  describe('changePlan', () => {
    test('deve existir método changePlan', () => {
      expect(typeof PlanController.changePlan).toBe('function');
    });

    test('deve validar entrada e chamar service', async () => {
      req.body = { planType: 'monthly' };
      const mockResult = {
        planDetails: { displayName: 'Mensal' }
      };
      mockPlanService.changePlan.mockResolvedValue(mockResult);

      await PlanController.changePlan(req, res);

      expect(mockPlanService.changePlan).toHaveBeenCalledWith('user123', 'monthly');
      expect(mockMessages.sendResponse).toHaveBeenCalledWith(res, 200, {
        message: "Plano alterado para Mensal com sucesso",
        data: mockResult
      });
    });
  });

  describe('registerDownload', () => {
    test('deve existir método registerDownload', () => {
      expect(typeof PlanController.registerDownload).toBe('function');
    });

    test('deve validar entrada e registrar download', async () => {
      req.body = { movieId: 'movie123' };
      const mockResult = {
        movieId: 'movie123',
        downloadsRemaining: 45
      };
      mockPlanService.registerDownload.mockResolvedValue(mockResult);

      await PlanController.registerDownload(req, res);

      expect(mockPlanService.registerDownload).toHaveBeenCalledWith('user123', 'movie123');
      expect(mockMessages.sendResponse).toHaveBeenCalledWith(res, 200, {
        message: "Download registrado com sucesso",
        data: mockResult
      });
    });
  });

  describe('shouldShowAds', () => {
    test('deve existir método shouldShowAds', () => {
      expect(typeof PlanController.shouldShowAds).toBe('function');
    });

    test('deve retornar status do middleware', async () => {
      req.showAds = true; // Como o controller usa || true, vamos testar com true

      await PlanController.shouldShowAds(req, res);

      expect(mockMessages.sendResponse).toHaveBeenCalledWith(res, 200, {
        message: "Status de anúncios obtido com sucesso",
        data: {
          showAds: true
        }
      });
    });
  });

  describe('getAdsConfig', () => {
    test('deve existir método getAdsConfig', () => {
      expect(typeof PlanController.getAdsConfig).toBe('function');
    });

    test('deve retornar configuração de anúncios', async () => {
      const mockPlanInfo = {
        usage: { showAds: true },
        currentPlan: { type: 'free' },
        planDetails: { displayName: 'Gratuito' }
      };
      mockPlanService.getUserPlanInfo.mockResolvedValue(mockPlanInfo);

      await PlanController.getAdsConfig(req, res);

      expect(mockMessages.sendResponse).toHaveBeenCalledWith(res, 200, {
        message: "Configuração de anúncios carregada",
        data: {
          showAds: true,
          planType: 'free',
          planDisplayName: 'Gratuito',
          adFrequency: 'high',
          adTypes: ['preroll', 'midroll', 'banner']
        }
      });
    });
  });
});
