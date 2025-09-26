import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { z } from 'zod';

const mockAuthService = {
  login: jest.fn()
};

const mockPasswordResetService = {
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn()
};

const mockMessages = {
  sendError: jest.fn(),
  sendResponse: jest.fn()
};

// Configurar mocks antes da importação  
jest.unstable_mockModule('../../../src/services/authService.js', () => ({
  default: mockAuthService
}));

jest.unstable_mockModule('../../../src/services/passwordResetService.js', () => ({
  default: mockPasswordResetService
}));

jest.unstable_mockModule('../../../src/utils/messages.js', () => mockMessages);

// Importar após configurar mocks
const Autenticacao = (await import('../../../src/controllers/authController.js')).default;
const { APIErro } = await import('../../../src/utils/ApiError.js');

describe('🔐 AuthController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do req/res
    req = {
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock do console.log para evitar poluição nos testes
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.log.mockRestore?.();
  });

  describe('login', () => {
    test('deve fazer login com sucesso', async () => {
      // Arrange
      req.body = {
        email: 'joao@gmail.com',
        senha: 'MinhaSeNha@123'
      };

      const mockAuthResponse = {
        token: 'jwt-token-123',
        id: 'user-id-123',
        name: 'João Silva',
        email: 'joao@gmail.com',
        role: 'user'
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      mockMessages.sendResponse.mockReturnValue({ success: true });

      // Act
      await Autenticacao.login(req, res);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(req.body);
      expect(mockMessages.sendResponse).toHaveBeenCalledWith(res, 200, {
        data: mockAuthResponse
      });
    });

    test('deve lidar com erro de API customizado', async () => {
      // Arrange
      req.body = {
        email: 'usuario@gmail.com',
        senha: 'senha-errada'
      };

      const apiError = new APIErro(401, [
        { path: 'senha', message: 'Senha incorreta' }
      ]);

      mockAuthService.login.mockRejectedValue(apiError);
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      await Autenticacao.login(req, res);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(
        res, 
        401, 
        { path: 'senha', message: 'Senha incorreta' }
      );
    });

    test('deve lidar com erro de validação Zod', async () => {
      // Arrange
      req.body = {
        email: 'email-inválido',
        senha: 'senha-fraca'
      };

      const zodError = new z.ZodError([
        {
          path: ['email'],
          message: 'Email deve ser um email válido'
        },
        {
          path: ['senha'],
          message: 'Senha deve ter pelo menos 8 caracteres'
        }
      ]);

      mockAuthService.login.mockRejectedValue(zodError);
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      await Autenticacao.login(req, res);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(
        res, 
        400, 
        [
          { path: 'email', message: 'Email deve ser um email válido' },
          { path: 'senha', message: 'Senha deve ter pelo menos 8 caracteres' }
        ]
      );
    });

    test('deve lidar com erro interno do servidor', async () => {
      // Arrange
      req.body = {
        email: 'joao@gmail.com',
        senha: 'MinhaSeNha@123'
      };

      mockAuthService.login.mockRejectedValue(new Error('Erro de banco'));
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      await Autenticacao.login(req, res);

      // Assert
      expect(console.log).toHaveBeenCalledWith('Erro no login:', expect.any(Error));
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 500, []);
    });
  });

  describe('forgotPassword', () => {
    test('deve processar solicitação de recuperação de senha com sucesso', async () => {
      // Arrange
      req.body = {
        email: 'joao@gmail.com'
      };

      mockPasswordResetService.requestPasswordReset.mockResolvedValue();
      mockMessages.sendResponse.mockReturnValue({ success: true });

      // Act
      await Autenticacao.forgotPassword(req, res);

      // Assert
      expect(mockPasswordResetService.requestPasswordReset).toHaveBeenCalledWith('joao@gmail.com');
      expect(mockMessages.sendResponse).toHaveBeenCalledWith(res, 200, {
        message: "Se o email existir, um link de recuperação foi enviado"
      });
    });

    test('deve retornar erro quando email não é fornecido', async () => {
      // Arrange
      req.body = {}; // Sem email

      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      await Autenticacao.forgotPassword(req, res);

      // Assert
      expect(mockPasswordResetService.requestPasswordReset).not.toHaveBeenCalled();
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 400, [
        { path: "email", message: "Invalid input: expected string, received undefined" }
      ]);
    });

    test('deve lidar com erro de API customizado', async () => {
      // Arrange
      req.body = {
        email: 'joao@gmail.com'
      };

      const apiError = new APIErro(400, [
        { path: 'email', message: 'Email inválido' }
      ]);

      mockPasswordResetService.requestPasswordReset.mockRejectedValue(apiError);
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      await Autenticacao.forgotPassword(req, res);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(
        res, 
        400, 
        { path: 'email', message: 'Email inválido' }
      );
    });

    test('deve lidar com erro interno do servidor', async () => {
      // Arrange
      req.body = {
        email: 'joao@gmail.com'
      };

      mockPasswordResetService.requestPasswordReset.mockRejectedValue(new Error('Erro de email'));
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      await Autenticacao.forgotPassword(req, res);

      // Assert
      expect(console.log).toHaveBeenCalledWith('Erro no esqueci senha:', expect.any(Error));
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    });
  });

  describe('resetPassword', () => {
    test('deve redefinir senha com sucesso', async () => {
      // Arrange
      req.body = {
        token: 'reset-token-123',
        newPassword: 'NovaSenha@123'
      };

      mockPasswordResetService.resetPassword.mockResolvedValue();
      mockMessages.sendResponse.mockReturnValue({ success: true });

      // Act
      await Autenticacao.resetPassword(req, res);

      // Assert
      expect(mockPasswordResetService.resetPassword).toHaveBeenCalledWith(
        'reset-token-123', 
        'NovaSenha@123'
      );
      expect(mockMessages.sendResponse).toHaveBeenCalledWith(res, 200, {
        message: "Senha alterada com sucesso"
      });
    });

    test('deve retornar erro quando token não é fornecido', async () => {
      // Arrange
      req.body = {
        newPassword: 'NovaSenha@123'
      }; // Sem token

      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      await Autenticacao.resetPassword(req, res);

      // Assert
      expect(mockPasswordResetService.resetPassword).not.toHaveBeenCalled();
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 400, [
        { path: "token", message: "Token é obrigatório" },
        { path: "newPassword", message: "Nova senha é obrigatória" }
      ]);
    });

    test('deve retornar erro quando nova senha não é fornecida', async () => {
      // Arrange
      req.body = {
        token: 'reset-token-123'
      }; // Sem newPassword

      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      await Autenticacao.resetPassword(req, res);

      // Assert
      expect(mockPasswordResetService.resetPassword).not.toHaveBeenCalled();
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 400, [
        { path: "token", message: "Token é obrigatório" },
        { path: "newPassword", message: "Nova senha é obrigatória" }
      ]);
    });

    test('deve lidar com erro de API customizado', async () => {
      // Arrange
      req.body = {
        token: 'invalid-token',
        newPassword: 'NovaSenha@123'
      };

      const apiError = new APIErro(400, [
        { path: 'token', message: 'Token inválido ou expirado' }
      ]);

      mockPasswordResetService.resetPassword.mockRejectedValue(apiError);
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      await Autenticacao.resetPassword(req, res);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(
        res, 
        400, 
        { path: 'token', message: 'Token inválido ou expirado' }
      );
    });

    test('deve lidar com erro interno do servidor', async () => {
      // Arrange
      req.body = {
        token: 'reset-token-123',
        newPassword: 'NovaSenha@123'
      };

      mockPasswordResetService.resetPassword.mockRejectedValue(new Error('Erro de banco'));
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      await Autenticacao.resetPassword(req, res);

      // Assert
      expect(console.log).toHaveBeenCalledWith('Erro no reset senha:', expect.any(Error));
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 500, [
        { path: "server", message: "Erro interno do servidor" }
      ]);
    });
  });
});