import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

const mockUser = {
  create: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
};

// Configurar mock antes da importação
jest.unstable_mockModule('../../../src/models/User.js', () => ({
  default: mockUser
}));

// Importar após configurar mocks
const UserRepository = (await import('../../../src/repositories/userRepository.js')).default;

describe('👥 UserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('deve criar um novo usuário com dados obrigatórios', async () => {
      // Arrange
      const userData = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        password: 'hashedPassword123'
      };

      const mockCreatedUser = {
        _id: 'user-id-123',
        ...userData,
        role: 'user',
        createdAt: new Date()
      };

      mockUser.create.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await UserRepository.create(userData);

      // Assert
      expect(mockUser.create).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'user', // valor padrão
        plan: undefined,
        devices: undefined,
        history: undefined,
        downloads: undefined
      });
      expect(result).toEqual(mockCreatedUser);
    });

    test('deve criar usuário com role customizada', async () => {
      // Arrange
      const userData = {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'hashedPassword123',
        role: 'admin'
      };

      mockUser.create.mockResolvedValue({ _id: 'admin-id', ...userData });

      // Act
      await UserRepository.create(userData);

      // Assert
      expect(mockUser.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin' })
      );
    });

    test('deve criar usuário com dados opcionais', async () => {
      // Arrange
      const userData = {
        name: 'João Silva',
        email: 'joao@gmail.com', 
        password: 'hashedPassword123',
        plan: 'premium',
        devices: ['device1', 'device2'],
        history: [],
        downloads: []
      };

      mockUser.create.mockResolvedValue({ _id: 'user-id', ...userData });

      // Act
      await UserRepository.create(userData);

      // Assert
      expect(mockUser.create).toHaveBeenCalledWith({
        ...userData,
        role: 'user' // Valor padrão sempre adicionado
      });
    });
  });

  describe('findByEmail', () => {
    test('deve buscar usuário por email', async () => {
      // Arrange
      const email = 'joao@gmail.com';
      const mockFoundUser = {
        _id: 'user-id-123',
        name: 'João Silva',
        email: email,
        role: 'user'
      };

      mockUser.findOne.mockResolvedValue(mockFoundUser);

      // Act
      const result = await UserRepository.findByEmail(email);

      // Assert
      expect(mockUser.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockFoundUser);
    });

    test('deve retornar null quando usuário não existe', async () => {
      // Arrange
      const email = 'inexistente@gmail.com';
      
      mockUser.findOne.mockResolvedValue(null);

      // Act
      const result = await UserRepository.findByEmail(email);

      // Assert
      expect(mockUser.findOne).toHaveBeenCalledWith({ email });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    test('deve buscar usuário por ID', async () => {
      // Arrange
      const userId = 'user-id-123';
      const mockFoundUser = {
        _id: userId,
        name: 'João Silva',
        email: 'joao@gmail.com',
        role: 'user'
      };

      mockUser.findById.mockResolvedValue(mockFoundUser);

      // Act
      const result = await UserRepository.findById(userId);

      // Assert
      expect(mockUser.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockFoundUser);
    });

    test('deve retornar null quando usuário não existe', async () => {
      // Arrange
      const userId = 'inexistente-id';
      
      mockUser.findById.mockResolvedValue(null);

      // Act
      const result = await UserRepository.findById(userId);

      // Assert
      expect(mockUser.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe('buscarPorId', () => {
    test('deve funcionar como alias para findById', async () => {
      // Arrange
      const userId = 'user-id-123';
      const mockFoundUser = {
        _id: userId,
        name: 'João Silva',
        email: 'joao@gmail.com'
      };

      mockUser.findById.mockResolvedValue(mockFoundUser);

      // Act
      const result = await UserRepository.buscarPorId(userId);

      // Assert
      expect(mockUser.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockFoundUser);
    });
  });

  describe('findMany', () => {
    test('deve buscar usuários sem filtros', async () => {
      // Arrange
      const mockUsers = [
        { _id: 'user1', name: 'João', email: 'joao@gmail.com' },
        { _id: 'user2', name: 'Maria', email: 'maria@gmail.com' }
      ];

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUsers)
      };
      mockUser.find.mockReturnValue(mockQuery);

      // Act
      const result = await UserRepository.findMany({});

      // Assert
      expect(mockUser.find).toHaveBeenCalledWith({});
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUsers);
    });

    test('deve buscar usuários com filtro de nome', async () => {
      // Arrange
      const filtros = { name: 'João' };
      const expectedQuery = {
        name: { $regex: 'João', $options: 'i' }
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue([])
      };
      mockUser.find.mockReturnValue(mockQuery);

      // Act
      await UserRepository.findMany(filtros);

      // Assert
      expect(mockUser.find).toHaveBeenCalledWith(expectedQuery);
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
    });

    test('deve buscar usuários com filtro de email', async () => {
      // Arrange
      const filtros = { email: 'gmail' };
      const expectedQuery = {
        email: { $regex: 'gmail', $options: 'i' }
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue([])
      };
      mockUser.find.mockReturnValue(mockQuery);

      // Act
      await UserRepository.findMany(filtros);

      // Assert
      expect(mockUser.find).toHaveBeenCalledWith(expectedQuery);
    });

    test('deve buscar usuários com filtro de ID', async () => {
      // Arrange
      const filtros = { id: 'user-123' };
      const expectedQuery = { _id: 'user-123' };

      const mockQuery = {
        select: jest.fn().mockResolvedValue([])
      };
      mockUser.find.mockReturnValue(mockQuery);

      // Act
      await UserRepository.findMany(filtros);

      // Assert
      expect(mockUser.find).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('update', () => {
    test('deve atualizar usuário com dados fornecidos', async () => {
      // Arrange
      const userId = 'user-id-123';
      const updateData = {
        name: 'João Silva Atualizado',
        email: 'joao.novo@gmail.com'
      };

      const mockUpdatedUser = {
        _id: userId,
        ...updateData,
        role: 'user'
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUpdatedUser)
      };
      mockUser.findByIdAndUpdate.mockReturnValue(mockQuery);

      // Act
      const result = await UserRepository.update(userId, updateData);

      // Assert
      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateData,
        { new: true }
      );
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUpdatedUser);
    });

    test('deve atualizar apenas campos fornecidos', async () => {
      // Arrange
      const userId = 'user-id-123';
      const updateData = { name: 'Novo Nome' };

      const mockQuery = {
        select: jest.fn().mockResolvedValue({})
      };
      mockUser.findByIdAndUpdate.mockReturnValue(mockQuery);

      // Act
      await UserRepository.update(userId, updateData);

      // Assert
      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { name: 'Novo Nome' }, // Só o campo fornecido
        { new: true }
      );
    });

    test('deve ignorar campos undefined', async () => {
      // Arrange
      const userId = 'user-id-123';
      const updateData = { 
        name: 'Novo Nome',
        email: undefined, // Deve ser ignorado
        password: 'nova-senha'
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue({})
      };
      mockUser.findByIdAndUpdate.mockReturnValue(mockQuery);

      // Act
      await UserRepository.update(userId, updateData);

      // Assert
      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { 
          name: 'Novo Nome',
          password: 'nova-senha'
          // email não deve aparecer pois é undefined
        },
        { new: true }
      );
    });
  });

  describe('delete', () => {
    test('deve deletar usuário por ID', async () => {
      // Arrange
      const userId = 'user-id-123';
      const mockDeletedUser = {
        _id: userId,
        name: 'João Silva',
        email: 'joao@gmail.com'
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockDeletedUser)
      };
      mockUser.findByIdAndDelete.mockReturnValue(mockQuery);

      // Act
      const result = await UserRepository.delete(userId);

      // Assert
      expect(mockUser.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockDeletedUser);
    });
  });

  describe('findAll', () => {
    test('deve buscar todos os usuários ordenados por data', async () => {
      // Arrange
      const mockUsers = [
        { _id: 'user1', name: 'João', createdAt: '2023-12-01' },
        { _id: 'user2', name: 'Maria', createdAt: '2023-11-01' }
      ];

      const mockQuery = {
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockUsers)
        })
      };
      mockUser.find.mockReturnValue(mockQuery);

      // Act
      const result = await UserRepository.findAll();

      // Assert
      expect(mockUser.find).toHaveBeenCalledWith({});
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(mockQuery.select().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(mockUsers);
    });
  });
});