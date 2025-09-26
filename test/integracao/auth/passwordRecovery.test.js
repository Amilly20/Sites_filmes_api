import { describe, beforeEach, afterEach, beforeAll, afterAll, test, expect } from '@jest/globals';
import TestSetup from '../helpers/testSetup.js';

describe('🔄 Integração - Fluxo de Recuperação de Senha', () => {
  let testSetup;

  beforeAll(async () => {
    testSetup = new TestSetup();
    await testSetup.setup();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  beforeEach(async () => {
    // Este teste específico precisa de limpeza completa
    process.env.FORCE_CLEAR = 'true';
    await testSetup.clearData();
  });

  describe('POST /api/auth/forgot-password', () => {
    test('deve iniciar processo de recuperação com email válido', async () => {
      // Arrange - Criar usuário primeiro
      const userData = {
        name: 'Password Recovery User',
        email: 'recovery@gmail.com',
        password: 'OriginalPass123!@#'
      };
      
      await testSetup.createTestUser(userData);

      // Act
      const response = await testSetup.server
        .post('/api/auth/forgot-password')
        .send({ email: userData.email })
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        data: [],
        error: false,
        code: 200,
        message: expect.stringContaining('enviado'),
        errors: []
      });

      // Verificar se o token foi criado no banco
      const User = (await import('../../../src/models/User.js')).default;
      const userWithToken = await User.findOne({ email: userData.email });
      
      expect(userWithToken).toBeTruthy();
      expect(userWithToken.resetToken).toBeTruthy();
      expect(userWithToken.resetTokenExpires).toBeInstanceOf(Date);
      expect(userWithToken.resetTokenExpires.getTime()).toBeGreaterThan(Date.now());
    });

    test('deve rejeitar recuperação com email inexistente', async () => {
      // Arrange
      const emailInexistente = 'naoexiste@gmail.com';

      // Act
      const response = await testSetup.server
        .post('/api/auth/forgot-password')
        .send({ email: emailInexistente })
        .expect(200);

      // Assert - Por segurança, retorna sucesso mesmo para email inexistente
      expect(response.body).toEqual({
        data: [],
        error: false,
        code: 200,
        message: expect.stringContaining('email'),
        errors: []
      });
    });

    test('deve validar formato do email', async () => {
      // Arrange
      const emailInvalido = 'email-sem-arroba';

      // Act
      const response = await testSetup.server
        .post('/api/auth/forgot-password')
        .send({ email: emailInvalido })
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
            message: expect.any(String)
          }
        ]
      });
    });

    test('deve substituir token anterior se já existe um', async () => {
      // Arrange - Criar usuário
      const userData = {
        name: 'Token Replacement User',
        email: 'tokenreplace@gmail.com',
        password: 'Pass123!@#'
      };
      
      await testSetup.createTestUser(userData);

      // Primeira solicitação
      await testSetup.server
        .post('/api/auth/forgot-password')
        .send({ email: userData.email })
        .expect(200);

      // Pegar o primeiro token
      const User = (await import('../../../src/models/User.js')).default;
      const userAfterFirst = await User.findOne({ email: userData.email });
      expect(userAfterFirst).toBeTruthy();
      expect(userAfterFirst.resetToken).toBeTruthy();
      const firstToken = userAfterFirst.resetToken;

      // Segunda solicitação
      await testSetup.server
        .post('/api/auth/forgot-password')
        .send({ email: userData.email })
        .expect(200);

      // Assert - Verificar que o token foi substituído
      const userAfterSecond = await User.findOne({ email: userData.email });
      const secondToken = userAfterSecond.resetToken;

      expect(firstToken).not.toBe(secondToken);
      expect(secondToken).toBeTruthy();
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('deve resetar senha com token válido', async () => {
      // Arrange - Criar usuário e gerar token
      const userData = {
        name: 'Reset Password User',
        email: 'reset@gmail.com',
        password: 'OldPass123!@#'
      };
      
      await testSetup.createTestUser(userData);

      // Gerar token de recuperação
      await testSetup.server
        .post('/api/auth/forgot-password')
        .send({ email: userData.email })
        .expect(200);

      // Obter o token de reset
      const User = (await import('../../../src/models/User.js')).default;
      const userWithToken = await User.findOne({ email: userData.email });
      expect(userWithToken).toBeTruthy();
      expect(userWithToken.resetToken).toBeTruthy();
      const resetToken = userWithToken.resetToken;

      const resetData = {
        token: resetToken,
        newPassword: 'NewPass456$%^'
      };

      // Act
      const response = await testSetup.server
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        data: [],
        error: false,
        code: 200,
        message: expect.stringContaining('sucesso'),
        errors: []
      });

      // Verificar que o token foi removido
      const userAfterReset = await User.findOne({ email: userData.email });
      expect(userAfterReset.resetToken).toBe(null);
      expect(userAfterReset.resetTokenExpires).toBe(null);
    });

    test('deve rejeitar reset com token inválido', async () => {
      // Arrange
      const resetData = {
        token: 'token_inexistente_12345',
        newPassword: 'NewPass456$%^'
      };

      // Act
      const response = await testSetup.server
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        data: [],
        error: true,
        code: 400,
        message: expect.any(String),
        errors: [
          {
            path: 'token',
            message: expect.stringContaining('inválido')
          }
        ]
      });
    });

    test('deve rejeitar reset com token expirado', async () => {
      // Arrange - Criar usuário
      const userData = {
        name: 'Expired Token User',
        email: 'expired@gmail.com',
        password: 'Pass123!@#'
      };
      
      await testSetup.createTestUser(userData);

      // Simular token expirado diretamente no banco
      const User = (await import('../../../src/models/User.js')).default;
      const user = await User.findOne({ email: userData.email });
      
      // Criar token com data de expiração no passado
      await User.findByIdAndUpdate(user._id, {
        resetToken: 'token_expirado_12345',
        resetTokenExpires: new Date(Date.now() - 1000 * 60 * 60) // 1 hora atrás
      });

      const resetData = {
        token: 'token_expirado_12345',
        newPassword: 'NewPass456$%^'
      };

      // Act
      const response = await testSetup.server
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        data: [],
        error: true,
        code: 400,
        message: expect.any(String),
        errors: [
          {
            path: 'token',
            message: expect.stringContaining('expirado')
          }
        ]
      });
    });

    test('deve rejeitar reset com nova senha inválida', async () => {
      // Arrange - Criar usuário e gerar token
      const userData = {
        name: 'Invalid New Password User',
        email: 'invalidnew@gmail.com',
        password: 'OldPass123!@#'
      };
      
      await testSetup.createTestUser(userData);

      // Gerar token de recuperação
      await testSetup.server
        .post('/api/auth/forgot-password')
        .send({ email: userData.email })
        .expect(200);

      // Obter o token
      const User = (await import('../../../src/models/User.js')).default;
      const userWithToken = await User.findOne({ email: userData.email });

      const resetData = {
        token: userWithToken.resetToken,
        newPassword: '123' // Senha muito simples
      };

      // Act
      const response = await testSetup.server
        .post('/api/auth/reset-password')
        .send(resetData)
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
  });

  describe('🔄 Fluxo Completo - Recuperação de Senha', () => {
    test('deve completar fluxo completo: forgot -> reset -> login', async () => {
      // Arrange - Criar usuário
      const userData = {
        name: 'Complete Flow User',
        email: 'completeflow@gmail.com',
        password: 'OriginalPass123!@#'
      };
      
      await testSetup.createTestUser(userData);

      const newPassword = 'NewPassword456$%^';

      // Act 1 - Solicitar recuperação de senha
      await testSetup.server
        .post('/api/auth/forgot-password')
        .send({ email: userData.email })
        .expect(200);

      // Act 2 - Obter token e resetar senha
      const User = (await import('../../../src/models/User.js')).default;
      const userWithToken = await User.findOne({ email: userData.email });
      
      await testSetup.server
        .post('/api/auth/reset-password')
        .send({
          token: userWithToken.resetToken,
          newPassword: newPassword
        })
        .expect(200);

      // Act 3 - Login com nova senha
      const loginResponse = await testSetup.server
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: newPassword
        })
        .expect(200);

      expect(loginResponse.body.data.token).toBeTruthy();
      expect(loginResponse.body.data.email).toBe(userData.email);
    });
  });
});