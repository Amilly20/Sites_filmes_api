import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

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
jest.unstable_mockModule('../../../src/utils/messages.js', () => mockMessages);

// Importar após configurar mocks
const isAdmin = (await import('../../../src/middlewares/isAdmin.js')).default;

describe('👑 IsAdmin Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do req/res/next
    req = {
      user: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isAdmin middleware', () => {
    test('deve permitir acesso para usuário admin autenticado', () => {
      // Arrange
      req.user = {
        id: 'admin-123',
        email: 'admin@cinestream.com',
        name: 'Admin User',
        role: 'admin'
      };

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(mockMessages.sendError).not.toHaveBeenCalled();
    });

    test('deve rejeitar usuário não autenticado', () => {
      // Arrange - req.user é null (usuário não passou pelo middleware de auth)
      req.user = null;
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 401, [
        {
          path: 'user',
          message: 'Usuário não autenticado'
        }
      ]);
      expect(next).not.toHaveBeenCalled();
    });

    test('deve rejeitar usuário comum (não admin)', () => {
      // Arrange
      req.user = {
        id: 'user-123',
        email: 'joao@gmail.com',
        name: 'João Silva',
        role: 'user' // Não é admin
      };
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 403, [
        {
          path: 'role',
          message: 'Acesso negado. Apenas administradores podem acessar este recurso.'
        }
      ]);
      expect(next).not.toHaveBeenCalled();
    });

    test('deve rejeitar usuário sem role definida', () => {
      // Arrange
      req.user = {
        id: 'user-123',
        email: 'joao@gmail.com',
        name: 'João Silva'
        // role é undefined
      };
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 403, [
        {
          path: 'role',
          message: 'Acesso negado. Apenas administradores podem acessar este recurso.'
        }
      ]);
      expect(next).not.toHaveBeenCalled();
    });

    test('deve rejeitar role vazia ou inválida', () => {
      // Arrange
      req.user = {
        id: 'user-123',
        email: 'joao@gmail.com',
        name: 'João Silva',
        role: '' // Role vazia
      };
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 403, [
        {
          path: 'role',
          message: 'Acesso negado. Apenas administradores podem acessar este recurso.'
        }
      ]);
      expect(next).not.toHaveBeenCalled();
    });

    test('deve ser case-sensitive para role admin', () => {
      // Arrange - Testando se 'ADMIN' ou 'Admin' funcionam (não devem funcionar)
      req.user = {
        id: 'user-123',
        email: 'admin@gmail.com',
        name: 'Admin User',
        role: 'ADMIN' // Maiúsculo, deve falhar
      };
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 403, [
        {
          path: 'role',
          message: 'Acesso negado. Apenas administradores podem acessar este recurso.'
        }
      ]);
      expect(next).not.toHaveBeenCalled();
    });

    test('deve rejeitar roles similares mas não exatas', () => {
      // Arrange
      const invalidRoles = ['administrator', 'super-admin', 'root', 'moderator'];
      
      for (const role of invalidRoles) {
        jest.clearAllMocks();
        
        req.user = {
          id: 'user-123',
          email: 'test@gmail.com',
          name: 'Test User',
          role: role
        };
        mockMessages.sendError.mockReturnValue({ error: true });

        // Act
        isAdmin(req, res, next);

        // Assert
        expect(mockMessages.sendError).toHaveBeenCalledWith(res, 403, [
          {
            path: 'role',
            message: 'Acesso negado. Apenas administradores podem acessar este recurso.'
          }
        ]);
        expect(next).not.toHaveBeenCalled();
      }
    });

    test('deve funcionar com diferentes estruturas de user', () => {
      // Arrange - Testando com usuário que tem propriedades extras
      req.user = {
        id: 'admin-456',
        email: 'super.admin@cinestream.com',
        name: 'Super Admin',
        role: 'admin',
        // Propriedades extras que não devem afetar o funcionamento
        createdAt: '2023-01-01T00:00:00.000Z',
        lastLogin: '2023-12-25T10:00:00.000Z',
        permissions: ['read', 'write', 'delete'],
        plan: 'premium'
      };

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(mockMessages.sendError).not.toHaveBeenCalled();
    });

    test('deve lidar com req.user undefined vs null', () => {
      // Arrange - Testando undefined (diferente de null)
      req.user = undefined;
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 401, [
        {
          path: 'user',
          message: 'Usuário não autenticado'
        }
      ]);
      expect(next).not.toHaveBeenCalled();
    });

    test('deve permitir múltiplos admins diferentes', () => {
      // Arrange - Testando diferentes usuários admin
      const adminUsers = [
        {
          id: 'admin-1',
          email: 'admin1@cinestream.com',
          name: 'Admin One',
          role: 'admin'
        },
        {
          id: 'admin-2',
          email: 'admin2@cinestream.com',  
          name: 'Admin Two',
          role: 'admin'
        }
      ];

      for (const adminUser of adminUsers) {
        jest.clearAllMocks();
        
        req.user = adminUser;

        // Act
        isAdmin(req, res, next);

        // Assert
        expect(next).toHaveBeenCalled();
        expect(mockMessages.sendError).not.toHaveBeenCalled();
      }
    });

    test('deve tratar erros inesperados graciosamente', () => {
      // Arrange - Simulando erro no middleware
      req.user = {
        get role() {
          throw new Error('Propriedade role com erro');
        }
      };
      mockMessages.sendError.mockReturnValue({ error: true });

      // Act
      isAdmin(req, res, next);

      // Assert
      expect(mockMessages.sendError).toHaveBeenCalledWith(res, 500, [
        {
          path: 'server',
          message: 'Erro interno na verificação de permissões'
        }
      ]);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
