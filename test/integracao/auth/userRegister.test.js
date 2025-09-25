import { describe, beforeEach, afterEach, beforeAll, afterAll, test, expect } from '@jest/globals';
import TestSetup from '../helpers/testSetup.js';

describe('🔄 Integração - Fluxo de Registro de Usuário', () => {
  let testSetup;

  beforeAll(async () => {
    testSetup = new TestSetup();
    await testSetup.setup();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  beforeEach(async () => {
    await testSetup.clearData();
  });

  describe('POST /api/users/register', () => {
    test('deve registrar um novo usuário com dados válidos', async () => {
      // Arrange
      const newUser = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        password: 'MinhaSenh@123'
      };

      // Act
      const response = await testSetup.server
        .post('/api/users/register')
        .send(newUser)
        .expect(201);

      // Assert
      expect(response.body).toEqual({
        data: {
          id: expect.any(String),
          name: 'João Silva',
          email: 'joao@gmail.com'
        },
        error: false,
        code: 201,
        message: expect.any(String),
        errors: []
      });

      // Verificar que a senha não é retornada
      expect(response.body.data.password).toBeUndefined();
    });

    test('deve rejeitar registro com email já existente', async () => {
      // Arrange - Criar primeiro usuário
      const userData = {
        name: 'Usuario Um',
        email: 'duplicado@gmail.com',
        password: 'Senha123!@#'
      };
      
      await testSetup.createTestUser(userData);

      // Act - Tentar criar segundo usuário com mesmo email
      const duplicateUser = {
        name: 'Usuario Dois',
        email: userData.email, // Usar o mesmo email
        password: 'OutraSenha456$%^'
      };

      const response = await testSetup.server
        .post('/api/users/register')
        .send(duplicateUser)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        data: [],
        error: true,
        code: 400,
        message: expect.any(String),
        errors: [
          {
            path: 'email',
            message: 'Email já cadastrado'
          }
        ]
      });
    });

    test('deve rejeitar registro com dados inválidos', async () => {
      // Arrange
      const invalidUser = {
        name: '', // Nome vazio
        email: 'email-invalido', // Email sem @
        password: '123' // Senha muito curta
      };

      // Act
      const response = await testSetup.server
        .post('/api/users/register')
        .send(invalidUser)
        .expect(400);

      // Assert
      expect(response.body.error).toBe(true);
      expect(response.body.code).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: expect.any(String),
            message: expect.any(String)
          })
        ])
      );
    });

    test('deve rejeitar registro sem campos obrigatórios', async () => {
      // Arrange
      const incompleteUser = {
        name: 'Apenas Nome'
        // Faltam email e password
      };

      // Act
      const response = await testSetup.server
        .post('/api/users/register')
        .send(incompleteUser)
        .expect(400);

      // Assert
      expect(response.body.error).toBe(true);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'email',
            message: expect.any(String)
          }),
          expect.objectContaining({
            path: 'password',
            message: expect.any(String)
          })
        ])
      );
    });

    test('deve armazenar senha com hash seguro', async () => {
      // Arrange
      const userData = {
        name: 'Hash Test User',
        email: 'hashtest@gmail.com',
        password: 'SenhaOriginal123!@#'
      };

      // Act
      const response = await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Assert - Verificar no banco que a senha foi hasheada
      const User = (await import('../../../src/models/User.js')).default;
      const savedUser = await User.findById(response.body.data.id);
      
      expect(savedUser).toBeTruthy();
      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toMatch(/^\$2[aby]\$\d+\$/); // Padrão bcrypt
      expect(savedUser.password.length).toBeGreaterThan(50);
    });

    test('deve definir role padrão como "user" para novos usuários', async () => {
      // Arrange
      const userData = {
        name: 'Role Test User',
        email: 'roletest@gmail.com',
        password: 'TesteRole123!@#'
      };

      // Act
      const response = await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Assert - Verificar no banco o role padrão
      const User = (await import('../../../src/models/User.js')).default;
      const savedUser = await User.findById(response.body.data.id);
      
      expect(savedUser).toBeTruthy();
      expect(savedUser.role).toBe('user');
    });
  });
});