import { describe, beforeEach, afterEach, beforeAll, afterAll, test, expect } from '@jest/globals';
import TestSetup from '../helpers/testSetup.js';
import jwt from 'jsonwebtoken';

describe('🔄 Integração - Fluxo de Login', () => {
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

  describe('POST /api/auth/login', () => {
    test('deve fazer login com credenciais válidas', async () => {
      // Arrange - Criar usuário primeiro
      const userData = {
        name: 'Login Test User',
        email: 'login@gmail.com',
        password: 'MinhaSenh@123'
      };
      
      await testSetup.createTestUser(userData);

      const loginData = {
        email: userData.email,
        senha: userData.password
      };

      // Act
      const response = await testSetup.server
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        data: {
          token: expect.any(String),
          id: expect.any(String),
          name: userData.name,
          email: userData.email,
          role: 'user'
        },
        error: false,
        code: 200,
        message: expect.any(String),
        errors: []
      });

      // Verificar se o token JWT é válido
      const token = response.body.data.token;
      expect(token).toBeTruthy();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toEqual({
        id: expect.any(String),
        name: userData.name,
        email: userData.email,
        role: 'user',
        iat: expect.any(Number),
        exp: expect.any(Number)
      });
    });

    test('deve rejeitar login com email inexistente', async () => {
      // Arrange
      const loginData = {
        email: 'inexistente@gmail.com',
        senha: 'SenhaQualquer123!@#'
      };

      // Act
      const response = await testSetup.server
        .post('/api/auth/login')
        .send(loginData)
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
            message: 'Usuário não existe por favor corrija o email ou crie uma nova conta'
          }
        ]
      });
    });

    test('deve rejeitar login com senha incorreta', async () => {
      // Arrange - Criar usuário primeiro
      const userData = {
        name: 'Wrong Password User',
        email: 'wrongpass@gmail.com',
        password: 'SenhaCorreta123!@#'
      };
      
      await testSetup.createTestUser(userData);

      const loginData = {
        email: userData.email,
        senha: 'SenhaIncorreta456$%^'
      };

      // Act
      const response = await testSetup.server
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        data: [],
        error: true,
        code: 400,
        message: expect.any(String),
        errors: [
          {
            path: 'senha',
            message: 'Senha incorreta por favor corrija a senha'
          }
        ]
      });
    });

    test('deve validar formato dos campos obrigatórios', async () => {
      // Arrange
      const invalidLoginData = {
        email: 'email-invalido',
        senha: '' // senha vazia
      };

      // Act
      const response = await testSetup.server
        .post('/api/auth/login')
        .send(invalidLoginData)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        data: [],
        error: true,
        code: 400,
        message: expect.any(String),
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: expect.any(String),
            message: expect.any(String)
          })
        ])
      });
    });

    test('deve gerar token JWT com expiração correta', async () => {
      // Arrange - Criar usuário primeiro
      const userData = {
        name: 'JWT Test User',
        email: 'jwt@gmail.com',
        password: 'JwtTest123!@#'
      };
      
      await testSetup.createTestUser(userData);

      const loginData = {
        email: userData.email,
        senha: userData.password
      };

      // Act
      const response = await testSetup.server
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // Assert - Verificar estrutura do JWT
      const token = response.body.data.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar se a expiração é aproximadamente 24 horas
      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + (24 * 60 * 60); // 24 horas em segundos
      const tolerance = 60; // Tolerância de 1 minuto
      
      expect(decoded.exp).toBeGreaterThanOrEqual(expectedExp - tolerance);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExp + tolerance);
    });

    test('deve incluir todos os dados necessários no token', async () => {
      // Arrange - Criar usuário primeiro
      const userData = {
        name: 'Token Data User',
        email: 'tokendata@gmail.com',
        password: 'TokenData123!@#'
      };
      
      await testSetup.createTestUser(userData);

      const loginData = {
        email: userData.email,
        senha: userData.password
      };

      // Act
      const response = await testSetup.server
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // Assert - Verificar payload do JWT
      const token = response.body.data.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email', userData.email);
      expect(decoded).toHaveProperty('name', userData.name);
      expect(decoded).toHaveProperty('role', 'user');
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
      
      // Verificar tipos
      expect(typeof decoded.id).toBe('string');
      expect(typeof decoded.email).toBe('string');
      expect(typeof decoded.name).toBe('string');
      expect(typeof decoded.role).toBe('string');
      expect(typeof decoded.iat).toBe('number');
      expect(typeof decoded.exp).toBe('number');
    });
  });
});