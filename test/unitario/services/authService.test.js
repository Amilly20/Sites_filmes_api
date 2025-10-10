import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

const mockUserRepository = {
  findByEmail: jest.fn()
};

const mockHashSenha = {
  compararSenha: jest.fn()
};

const mockJwt = {
  sign: jest.fn()
};

// Configurar mocks antes da importação
jest.unstable_mockModule('../../../src/repositories/userRepository.js', () => ({
  default: mockUserRepository
}));

jest.unstable_mockModule('../../../src/utils/hashSenha.js', () => ({
  default: mockHashSenha
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: mockJwt
}));

// Importar após configurar mocks
const AuthService = (await import('../../../src/services/authService.js')).default;
const { APIError } = await import('../../../src/utils/ApiError.js');

describe('🔐 AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('deve autenticar usuário com credenciais válidas', async () => {
      // Arrange
      const email = 'usuario@gmail.com';
      const senha = 'MinhaSeNha@123';
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: email,
        password: 'hashed-password',
        name: 'João Silva'
      };
      const mockToken = 'jwt.token.string';

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockHashSenha.compararSenha.mockResolvedValue(true);
      mockJwt.sign.mockReturnValue(mockToken);

      // Act
      const result = await AuthService.login({ email, senha });

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockHashSenha.compararSenha).toHaveBeenCalledWith(senha, mockUser.password);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser._id.toString(),
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role || 'user'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(result).toEqual({
        token: mockToken,
        id: mockUser._id.toString(),
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role || 'user'
      });
    });

    test('deve lançar erro quando usuário não existe', async () => {
      // Arrange
      const email = 'inexistente@gmail.com';
      const senha = 'MinhaSeNha@123'; // Senha válida para passar na validação
      
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.login({ email, senha }))
        .rejects
        .toThrow(APIError);
    });

    test('deve lançar erro quando senha está incorreta', async () => {
      // Arrange
      const email = 'usuario@gmail.com';
      const senha = 'SenhaErrada@123'; // Senha válida mas incorreta
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: email,
        password: 'hashed-password'
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockHashSenha.compararSenha.mockResolvedValue(false);

      // Act & Assert
      await expect(AuthService.login({ email, senha }))
        .rejects
        .toThrow(APIError);
    });

    test('deve validar entrada com schema de autenticação', async () => {
      // Arrange
      const dadosInvalidos = {
        email: 'email-inválido',
        senha: '123' // Muito simples
      };

      // Act & Assert
      await expect(AuthService.login(dadosInvalidos))
        .rejects
        .toThrow(); // Erro de validação do Zod
    });

    test('deve retornar apenas dados seguros do usuário', async () => {
      // Arrange
      const mockUser = {
        _id: 'user123',
        email: 'test@test.com',
        password: 'hashed-password', // Não deve aparecer no retorno
        name: 'Test User',
        role: 'admin',
        createdAt: '2023-01-01',
        sensitive_data: 'dados-sensíveis' // Não deve aparecer
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockHashSenha.compararSenha.mockResolvedValue(true);
      mockJwt.sign.mockReturnValue('token');

      // Act
      const result = await AuthService.login({ email: 'test@test.com', senha: 'MinhaSeNha@123' });

      // Assert  
      expect(result).toEqual({
        token: 'token',
        id: mockUser._id.toString(),
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role || 'user'
      });
      // Verificar que dados sensíveis não estão no retorno
      expect(result.password).toBeUndefined();
      expect(result.sensitive_data).toBeUndefined();
    });
  });
});
