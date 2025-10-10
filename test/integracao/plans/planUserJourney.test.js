import { describe, beforeEach, afterEach, beforeAll, afterAll, test, expect } from '@jest/globals';
import TestSetup from '../helpers/testSetup.js';

describe('💎 Integração - Sistema de Planos no Registro', () => {
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

  describe('POST /api/users/register - Inicialização de Plano Gratuito', () => {
    test('deve criar usuário com plano gratuito automático', async () => {
      // Arrange
      const userData = {
        name: 'Novo Usuário',
        email: 'novousuario@gmail.com',
        password: 'MinhaSenh@123'
      };

      // Act - Registrar usuário
      const response = await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Assert - Verificar resposta
      expect(response.body).toEqual({
        data: {
          id: expect.any(String),
          name: userData.name,
          email: userData.email,
          plan: {
            type: 'free',
            features: '10 downloads/mês, anúncios, 1 dispositivo'
          }
        },
        error: false,
        code: 201,
        message: 'Usuário cadastrado com sucesso! Você recebeu um plano gratuito para começar a explorar nossa plataforma.',
        errors: []
      });

      // Verificar no banco de dados
      const User = (await import('../../../src/models/User.js')).default;
      const savedUser = await User.findById(response.body.data.id);
      
      expect(savedUser.plan).toEqual({
        type: 'free',
        startDate: expect.any(Date),
        endDate: null,
        downloadsUsed: 0,
        monthlyDownloadsReset: expect.any(Date)
      });
      
      expect(savedUser.devices).toEqual([]);
      expect(savedUser.history).toEqual([]);
      expect(savedUser.downloads).toEqual([]);
    });

    test('deve permitir login e acesso às funcionalidades do plano gratuito', async () => {
      // Arrange - Criar usuário
      const userData = {
        name: 'Usuário Teste Plano',
        email: 'planofree@gmail.com',
        password: 'TesteSenh@123'
      };

      const registerResponse = await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      const userId = registerResponse.body.data.id;

      // Act - Fazer login
      const loginResponse = await testSetup.server
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: userData.password
        })
        .expect(200);

      const token = loginResponse.body.data.token;

      // Act - Verificar plano do usuário
      const planResponse = await testSetup.server
        .get('/api/plans/my-plan')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert - Verificar informações do plano
      expect(planResponse.body.data).toEqual({
        currentPlan: {
          type: 'free',
          startDate: expect.any(String),
          endDate: null,
          downloadsUsed: 0,
          monthlyDownloadsReset: expect.any(String)
        },
        planConfig: {
          name: 'free',
          displayName: 'Gratuito',
          price: 0,
          currency: 'BRL',
          description: 'Plano gratuito com anúncios e acesso limitado',
          features: {
            showAds: true,
            monthlyDownloads: 10,
            unlimitedAccess: false,
            hdQuality: false,
            simultaneousDevices: 1,
            offlineDownload: false,
            quality: ['720p'],
            support: 'community',
            downloadSpeed: 'normal',
            concurrentDownloads: 1
          },
          limits: {
            maxFileSize: 2147483648,
            storageTime: 86400000
          },
          duration: null
        },
        features: {
          showAds: true,
          monthlyDownloads: 10,
          unlimitedAccess: false,
          hdQuality: false,
          simultaneousDevices: 1,
          offlineDownload: false,
          quality: ['720p'],
          support: 'community',
          downloadSpeed: 'normal',
          concurrentDownloads: 1
        },
        remainingDownloads: 10,
        isActive: true,
        usage: {
          showAds: true
        },
        planDetails: {
          displayName: 'Gratuito'
        }
      });
    });

    test('deve verificar configuração de anúncios para usuário gratuito', async () => {
      // Arrange - Criar e logar usuário
      const userData = {
        name: 'Usuário Anúncios',
        email: 'anuncios@gmail.com',
        password: 'Anuncios123!@#'
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

      // Act - Verificar configuração de anúncios
      const adsResponse = await testSetup.server
        .get('/api/plans/ads-config')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert - Verificar se o plano gratuito mostra anúncios
      expect(adsResponse.body.data.planType).toBe('free');
      expect(adsResponse.body.data.planDisplayName).toBe('Gratuito');
      expect(adsResponse.body.data.showAds).toBe(true);
      expect(adsResponse.body.data.adFrequency).toBe('high');
      expect(adsResponse.body.data.adTypes).toEqual(['preroll', 'midroll', 'banner']);
    });
  });

  describe('Fluxo completo de usuário', () => {
    test('deve simular jornada: cadastro → exploração → upgrade', async () => {
      // 1. CADASTRO
      console.log('📋 1. Registrando novo usuário...');
      const userData = {
        name: 'Jornada Usuário',
        email: 'jornada@gmail.com',
        password: 'Jornada123!@#'
      };

      const registerResponse = await testSetup.server
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.data.plan.type).toBe('free');
      console.log('✅ Usuário criado com plano gratuito');

      // 2. LOGIN
      console.log('🔑 2. Fazendo login...');
      const loginResponse = await testSetup.server
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: userData.password
        })
        .expect(200);

      const token = loginResponse.body.data.token;
      console.log('✅ Login realizado com sucesso');

      // 3. EXPLORAÇÃO (ver planos disponíveis)
      console.log('👀 3. Explorando planos disponíveis...');
      const plansResponse = await testSetup.server
        .get('/api/plans')
        .expect(200);

      expect(plansResponse.body.data).toHaveLength(3);
      expect(plansResponse.body.data[0].name).toBe('free');
      expect(plansResponse.body.data[1].name).toBe('monthly');
      expect(plansResponse.body.data[2].name).toBe('lifetime');
      console.log('✅ Usuário pode ver todos os planos');

      // 4. UPGRADE PARA MENSAL
      console.log('⬆️ 4. Fazendo upgrade para plano mensal...');
      const upgradeResponse = await testSetup.server
        .put('/api/plans/change')
        .set('Authorization', `Bearer ${token}`)
        .send({ planType: 'monthly' })
        .expect(200);

      expect(upgradeResponse.body.data.currentPlan.type).toBe('monthly');
      expect(upgradeResponse.body.data.features.showAds).toBe(false);
      expect(upgradeResponse.body.data.remainingDownloads).toBe(100);
      console.log('✅ Upgrade realizado com sucesso');

      // 5. VERIFICAR NOVAS FUNCIONALIDADES
      console.log('🎯 5. Verificando novas funcionalidades...');
      const newAdsConfig = await testSetup.server
        .get('/api/plans/ads-config')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(newAdsConfig.body.data.showAds).toBe(false);
      expect(newAdsConfig.body.data.planType).toBe('monthly');
      console.log('✅ Sem anúncios após upgrade!');

      console.log('🎉 Jornada completa do usuário finalizada com sucesso!');
    });
  });
});
