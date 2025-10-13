import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

const mockJwt = {
  verify: jest.fn()
};

const mockMessages = {
  default: {
    httpCodes: {
      401: "Cliente sem credenciais para acessar o recurso solicitado.",
      403: "Sem permissão para atender a requisição."
    }
  },
  sendError: jest.fn(),
  sendResponse: jest.fn()
};

// Configurar mocks antes da importação  
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: mockJwt
}));

jest.unstable_mockModule('../../../src/utils/messages.js', () => mockMessages);

// Importar após configurar mocks
const authentication = (await import('../../../src/middlewares/authMiddlewares.js')).default;

describe('🔐 AuthMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do req/res/next
    req = {
      headers: {},
      user: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();

    // Configurar env JWT_SECRET
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authentication middleware', () => {
    test('deve autenticar usuário com token válido', () => {
      // Arrange
      const mockDecodedToken = {
        id: 'user-id-123',
        email: 'joao@gmail.com',
        name: 'João Silva',
        role: 'user'
      };

      req.headers.authorization = 'Bearer valid-jwt-token';
      mockJwt.verify.mockReturnValue(mockDecodedToken);

      // Act
      authentication(req, res, next);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith('valid-jwt-token', 'test-jwt-secret');
      expect(req.user).toEqual(mockDecodedToken);
      expect(next).toHaveBeenCalled();
      expect(mockMessages.sendError).not.toHaveBeenCalled();
    });

    test('deve rejeitar requisição sem header Authorization', () => {
      // Arrange - Sem header authorization
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      authentication(req, res, next);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 401, [
        {
          path: 'token',
          message: 'Token não informado. Por favor, faça login.'
        }
      ]);
      expect(next).not.toHaveBeenCalled();
      expect(mockJwt.verify).not.toHaveBeenCalled();
    });

    test('deve rejeitar header Authorization sem Bearer', () => {
      // Arrange
      req.headers.authorization = 'Basic invalid-auth-type';
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      authentication(req, res, next);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 401, [
        {
          path: 'token',
          message: 'Token não informado. Por favor, faça login.'
        }
      ]);
      expect(next).not.toHaveBeenCalled();
      expect(mockJwt.verify).not.toHaveBeenCalled();
    });

    test('deve rejeitar header Authorization com Bearer mas sem token', () => {
      // Arrange
      req.headers.authorization = 'Bearer ';
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Token vazio');
      });
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      authentication(req, res, next);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 401, [
        {
          path: 'token',
          message: 'Token informado não é válido. Por favor, faça login.'
        }
      ]);
      expect(next).not.toHaveBeenCalled();
    });

    test('deve rejeitar token inválido/expirado', () => {
      // Arrange
      req.headers.authorization = 'Bearer invalid-jwt-token';
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Token expirado');
      });
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      authentication(req, res, next);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith('invalid-jwt-token', 'test-jwt-secret');
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 401, [
        {
          path: 'token',
          message: 'Token informado não é válido. Por favor, faça login.'
        }
      ]);
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeNull();
    });

    test('deve extrair token corretamente do header Bearer', () => {
      // Arrange
      const mockDecodedToken = { id: 'user-123', email: 'test@test.com' };
      req.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      mockJwt.verify.mockReturnValue(mockDecodedToken);

      // Act
      authentication(req, res, next);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token', 
        'test-jwt-secret'
      );
      expect(req.user).toEqual(mockDecodedToken);
      expect(next).toHaveBeenCalled();
    });

    test('deve usar JWT_SECRET do environment', () => {
      // Arrange
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'custom-secret-key';
      
      req.headers.authorization = 'Bearer test-token';
      mockJwt.verify.mockReturnValue({ id: 'user' });

      // Act
      authentication(req, res, next);

      // Assert
      expect(mockJwt.verify).toHaveBeenCalledWith('test-token', 'custom-secret-key');
      
      // Restore
      process.env.JWT_SECRET = originalSecret;
    });

    test('deve lidar com diferentes tipos de erros JWT', () => {
      // Arrange
      req.headers.authorization = 'Bearer malformed-token';
      
      // Teste com JsonWebTokenError
      mockJwt.verify.mockImplementation(() => {
        const error = new Error('invalid signature');
        error.name = 'JsonWebTokenError';
        throw error;
      });
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      authentication(req, res, next);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 401, [
        {
          path: 'token',
          message: 'Token informado não é válido. Por favor, faça login.'
        }
      ]);
      expect(next).not.toHaveBeenCalled();
    });

    test('deve adicionar dados do usuário ao request', () => {
      // Arrange
      const mockUserData = {
        id: 'admin-123',
        email: 'admin@cinestream.com',
        name: 'Admin User',
        role: 'admin',
        iat: 1642688400,
        exp: 1642774800
      };

      req.headers.authorization = 'Bearer admin-jwt-token';
      mockJwt.verify.mockReturnValue(mockUserData);

      // Act
      authentication(req, res, next);

      // Assert
      expect(req.user).toEqual(mockUserData);
      expect(req.user.id).toBe('admin-123');
      expect(req.user.role).toBe('admin');
      expect(next).toHaveBeenCalled();
    });

    test('deve tratar header Authorization case-insensitive', () => {
      // Arrange
      req.headers.authorization = 'bearer lowercase-token';
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      authentication(req, res, next);

      // Assert - Should fail because it's case-sensitive (Bearer vs bearer)
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 401, [
        {
          path: 'token',
          message: 'Token não informado. Por favor, faça login.'
        }
      ]);
      expect(mockJwt.verify).not.toHaveBeenCalled();
    });
  });
});
