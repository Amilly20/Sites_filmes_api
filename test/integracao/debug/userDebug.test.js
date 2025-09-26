import { describe, beforeEach, afterEach, beforeAll, afterAll, test, expect } from '@jest/globals';
import TestSetup from '../helpers/testSetup.js';

describe('🔍 Debug - Teste de Criação de Usuário', () => {
  let testSetup;

  beforeAll(async () => {
    testSetup = new TestSetup();
    await testSetup.setup();
    console.log('✅ Setup concluído');
  });

  afterAll(async () => {
    await testSetup.teardown();
    console.log('✅ Teardown concluído');
  });

  beforeEach(async () => {
    console.log('🧹 Limpando banco antes do teste...');
    await testSetup.clearData();
    console.log('✅ Banco limpo');
  });

  test('deve criar usuário e conseguir encontrá-lo depois', async () => {
    // Arrange
    const userData = {
      name: 'Debug User',
      email: 'debug@gmail.com',
      password: 'Debug123!@#'
    };

    console.log('👤 Criando usuário:', userData.email);

    // Act - Criar usuário
    const createResponse = await testSetup.createTestUser(userData);
    console.log('📊 Status da criação:', createResponse.status);
    console.log('📋 Resposta da criação:', JSON.stringify(createResponse.body, null, 2));

    // Assert - Verificar criação
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.id).toBeTruthy();

    const userId = createResponse.body.data.id;
    console.log('🆔 ID do usuário criado:', userId);

    // Verificar se o usuário existe no banco
    const User = (await import('../../../src/models/User.js')).default;
    
    console.log('🔍 Buscando usuário por ID...');
    const userById = await User.findById(userId);
    console.log('👤 Usuário encontrado por ID:', userById ? 'SIM' : 'NÃO');
    
    console.log('🔍 Buscando usuário por email...');
    const userByEmail = await User.findOne({ email: userData.email });
    console.log('👤 Usuário encontrado por email:', userByEmail ? 'SIM' : 'NÃO');

    console.log('🔍 Listando todos os usuários...');
    const allUsers = await User.find({});
    console.log('📊 Total de usuários no banco:', allUsers.length);
    
    if (allUsers.length > 0) {
      allUsers.forEach((u, i) => {
        console.log(`👤 Usuário ${i + 1}: ${u.email} (ID: ${u._id})`);
      });
    }

    // Esperamos que o usuário seja encontrado
    expect(userById).toBeTruthy();
    expect(userByEmail).toBeTruthy();
  });
});