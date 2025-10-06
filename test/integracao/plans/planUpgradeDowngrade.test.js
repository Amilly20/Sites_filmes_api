import { describe, beforeEach, afterEach, beforeAll, afterAll, test, expect } from '@jest/globals';
import TestSetup from '../helpers/testSetup.js';

describe('🔄 RF06 - Sistema de Upgrade/Downgrade de Planos', () => {
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

  describe('📈 Upgrade de Planos', () => {
    test('deve permitir upgrade de gratuito para mensal', async () => {
      // Arrange - Criar usuário com plano gratuito
      const userData = {
        name: 'Usuário Upgrade',
        email: 'upgrade@gmail.com',
        password: 'Upgrade123!@#'
      };

      const registerResponse = await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const loginResponse = await testSetup.server
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: userData.password
        })
        .expect(200);

      const token = loginResponse.body.data.token;

      // Act - Fazer upgrade para mensal
      const upgradeResponse = await testSetup.server
        .post('/api/plans/upgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetPlan: 'monthly'
        })
        .expect(200);

      // Assert
      expect(upgradeResponse.body.error).toBe(false);
      expect(upgradeResponse.body.data.success).toBe(true);
      expect(upgradeResponse.body.data.operation).toBe('upgrade');
      expect(upgradeResponse.body.data.previousPlan.type).toBe('free');
      expect(upgradeResponse.body.data.newPlan.type).toBe('monthly');
      expect(upgradeResponse.body.data.benefits).toContain('Remoção de anúncios');
      expect(upgradeResponse.body.message).toContain('Upgrade realizado com sucesso');
    });

    test('deve permitir upgrade de mensal para vitalício', async () => {
      // Arrange - Criar usuário e fazer upgrade para mensal primeiro
      const userData = {
        name: 'Usuário Upgrade Lifetime',
        email: 'lifetime@gmail.com',
        password: 'Lifetime123!@#'
      };

      await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const loginResponse = await testSetup.server
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: userData.password
        })
        .expect(200);

      const token = loginResponse.body.data.token;

      // Upgrade para mensal primeiro
      await testSetup.server
        .post('/api/plans/upgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetPlan: 'monthly'
        })
        .expect(200);

      // Act - Upgrade para vitalício
      const upgradeResponse = await testSetup.server
        .post('/api/plans/upgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetPlan: 'lifetime'
        })
        .expect(200);

      // Assert
      expect(upgradeResponse.body.data.operation).toBe('upgrade');
      expect(upgradeResponse.body.data.previousPlan.type).toBe('monthly');
      expect(upgradeResponse.body.data.newPlan.type).toBe('lifetime');
      expect(upgradeResponse.body.data.benefits).toContain('Acesso completo e ilimitado');
    });

    test('deve rejeitar upgrade inválido', async () => {
      // Arrange
      const userData = {
        name: 'Usuário Invalid Upgrade',
        email: 'invalid@gmail.com',
        password: 'Invalid123!@#'
      };

      await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const loginResponse = await testSetup.server
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: userData.password
        })
        .expect(200);

      const token = loginResponse.body.data.token;

      // Act & Assert - Tentar upgrade para plano inválido
      const upgradeResponse = await testSetup.server
        .post('/api/plans/upgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetPlan: 'invalid_plan'
        })
        .expect(400);

      expect(upgradeResponse.body.error).toBe(true);
    });
  });

  describe('📉 Downgrade de Planos', () => {
    test('deve permitir downgrade de vitalício para mensal', async () => {
      // Arrange - Criar usuário e fazer upgrade para vitalício
      const userData = {
        name: 'Usuário Downgrade',
        email: 'downgrade@gmail.com',
        password: 'Downgrade123!@#'
      };

      await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const loginResponse = await testSetup.server
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: userData.password
        })
        .expect(200);

      const token = loginResponse.body.data.token;

      // Upgrade para vitalício primeiro
      await testSetup.server
        .put('/api/plans/change-intelligent')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetPlan: 'lifetime'
        })
        .expect(200);

      // Act - Downgrade para mensal
      const downgradeResponse = await testSetup.server
        .post('/api/plans/downgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetPlan: 'monthly',
          confirmDowngrade: true
        })
        .expect(200);

      // Assert
      expect(downgradeResponse.body.data.operation).toBe('downgrade');
      expect(downgradeResponse.body.data.previousPlan.type).toBe('lifetime');
      expect(downgradeResponse.body.data.newPlan.type).toBe('monthly');
      expect(downgradeResponse.body.data.limitations).toBeDefined();
      expect(downgradeResponse.body.message).toContain('Downgrade realizado com sucesso');
    });

    test('deve rejeitar downgrade sem confirmação', async () => {
      // Arrange - Criar usuário com plano mensal
      const userData = {
        name: 'Usuário No Confirm',
        email: 'noconfirm@gmail.com',
        password: 'NoConfirm123!@#'
      };

      await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const loginResponse = await testSetup.server
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: userData.password
        })
        .expect(200);

      const token = loginResponse.body.data.token;

      // Upgrade para mensal primeiro
      await testSetup.server
        .put('/api/plans/change-intelligent')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetPlan: 'monthly'
        })
        .expect(200);

      // Act & Assert - Tentar downgrade sem confirmação
      const downgradeResponse = await testSetup.server
        .post('/api/plans/downgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetPlan: 'free',
          confirmDowngrade: false
        })
        .expect(400);

      expect(downgradeResponse.body.error).toBe(true);
    });
  });

  describe('🔄 Mudança Inteligente de Planos', () => {
    test('deve detectar automaticamente se é upgrade ou downgrade', async () => {
      // Arrange
      const userData = {
        name: 'Usuário Smart Change',
        email: 'smart@gmail.com',
        password: 'Smart123!@#'
      };

      await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const loginResponse = await testSetup.server
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: userData.password
        })
        .expect(200);

      const token = loginResponse.body.data.token;

      // Act 1 - Mudança inteligente para mensal (upgrade)
      const upgradeResponse = await testSetup.server
        .put('/api/plans/change-intelligent')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetPlan: 'monthly'
        })
        .expect(200);

      // Assert 1
      expect(upgradeResponse.body.data.operation).toBe('upgrade');
      expect(upgradeResponse.body.data.newPlan.type).toBe('monthly');

      // Act 2 - Mudança inteligente para gratuito (downgrade)
      const downgradeResponse = await testSetup.server
        .put('/api/plans/change-intelligent')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetPlan: 'free'
        })
        .expect(200);

      // Assert 2
      expect(downgradeResponse.body.data.operation).toBe('downgrade');
      expect(downgradeResponse.body.data.newPlan.type).toBe('free');
    });
  });

  describe('📊 Informações de Upgrade', () => {
    test('deve listar opções de upgrade disponíveis', async () => {
      // Arrange
      const userData = {
        name: 'Usuário Options',
        email: 'options@gmail.com',
        password: 'Options123!@#'
      };

      await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const loginResponse = await testSetup.server
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: userData.password
        })
        .expect(200);

      const token = loginResponse.body.data.token;

      // Act - Obter opções
      const optionsResponse = await testSetup.server
        .get('/api/plans/upgrade-options')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(optionsResponse.body.data.currentPlan.type).toBe('free');
      expect(optionsResponse.body.data.options).toHaveLength(2); // monthly e lifetime
      expect(optionsResponse.body.data.options[0].operationType).toBeDefined();
      expect(optionsResponse.body.data.options[0].isAvailable).toBeDefined();
    });

    test('deve fornecer preview de mudança de plano', async () => {
      // Arrange
      const userData = {
        name: 'Usuário Preview',
        email: 'preview@gmail.com',
        password: 'Preview123!@#'
      };

      await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const loginResponse = await testSetup.server
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: userData.password
        })
        .expect(200);

      const token = loginResponse.body.data.token;

      // Act - Obter preview
      const previewResponse = await testSetup.server
        .get('/api/plans/change-preview?targetPlan=monthly')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(previewResponse.body.data.currentPlan.type).toBe('free');
      expect(previewResponse.body.data.targetPlan.type).toBe('monthly');
      expect(previewResponse.body.data.operationType).toBe('upgrade');
      expect(previewResponse.body.data.changes).toBeDefined();
      expect(previewResponse.body.data.isAvailable).toBe(true);
    });
  });

  describe('🔒 Validações de Segurança', () => {
    test('deve rejeitar mudanças sem autenticação', async () => {
      // Act & Assert
      await testSetup.server
        .post('/api/plans/upgrade')
        .send({
          targetPlan: 'monthly'
        })
        .expect(401);
    });

    test('deve rejeitar mudança para o mesmo plano', async () => {
      // Arrange
      const userData = {
        name: 'Usuário Same Plan',
        email: 'same@gmail.com',
        password: 'Same123!@#'
      };

      await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const loginResponse = await testSetup.server
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: userData.password
        })
        .expect(200);

      const token = loginResponse.body.data.token;

      // Act & Assert - Tentar mudança para o mesmo plano
      const response = await testSetup.server
        .put('/api/plans/change-intelligent')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetPlan: 'free'
        })
        .expect(400);

      expect(response.body.error).toBe(true);
      expect(response.body.errors[0].message).toContain('já possui este plano');
    });
  });
});