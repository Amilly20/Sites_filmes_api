import TestDatabase from '../../helpers/testDatabase.js';
import request from 'supertest';
import app from '../../../src/app.js';

/**
 * 🔧 Helper para configuração de testes de integração
 * Gerencia conexão com banco de dados de teste e limpeza
 */
class TestSetup {
  constructor() {
    this.server = request(app);
  }

  /**
   * Conecta ao banco de teste antes dos testes
   */
  async setup() {
    await TestDatabase.connect();
  }

  /**
   * Limpa dados e desconecta após os testes
   */
  async teardown() {
    await TestDatabase.clearDatabase();
    await TestDatabase.disconnect();
  }

  /**
   * Limpa apenas dados entre testes (mantém conexão)
   */
  async clearData() {
    await TestDatabase.clearDatabase();
  }

  /**
   * Cria usuário para testes (otimizado)
   */
  async createTestUser(userData = {}) {
    const finalUserData = {
      name: userData.name || 'Test User',
      email: userData.email || `test${Date.now()}@gmail.com`,
      password: userData.password || 'Test123!@#'
    };
    
    const response = await this.server
      .post('/api/users/register')
      .send(finalUserData)
      .timeout(5000); // Timeout menor
      
    return response;
  }

  /**
   * Faz login e retorna o token
   */
  async loginUser(credentials = {}) {
    const defaultCredentials = {
      email: 'test@gmail.com',
      senha: 'Test123!@#' // Campo correto é 'senha'
    };
    
    const response = await this.server
      .post('/api/auth/login')
      .send({ ...defaultCredentials, ...credentials });
      
    return response.body.data?.token || null;
  }

  /**
   * Cria usuário admin para testes
   */
  async createAdminUser() {
    // Primeiro cria o usuário
    const userData = {
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'Admin123!@#'
    };
    
    const userResponse = await this.createTestUser(userData);
    
    if (userResponse.status === 201) {
      // Depois atualiza o role diretamente no banco para admin
      const User = (await import('../../../src/models/User.js')).default;
      await User.findOneAndUpdate(
        { email: userData.email },
        { role: 'admin' }
      );
    }
    
    return userResponse;
  }

  /**
   * Faz login como admin e retorna token
   */
  async loginAdmin() {
    await this.createAdminUser();
    return await this.loginUser({
      email: 'admin@gmail.com',
      senha: 'Admin123!@#'
    });
  }
}

export default TestSetup;
