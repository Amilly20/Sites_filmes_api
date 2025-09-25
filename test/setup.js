import TestDatabase from './helpers/testDatabase.js';

// Setup global para todos os testes
beforeAll(async () => {
  // Configurar NODE_ENV para testes
  process.env.NODE_ENV = 'test';
  
  // Conectar ao banco de testes
  await TestDatabase.connect();
});

// Limpar dados entre cada teste
beforeEach(async () => {
  await TestDatabase.clearDatabase();
});

// Cleanup após todos os testes
afterAll(async () => {
  await TestDatabase.disconnect();
});

// Configurações globais para testes
// Silenciar logs durante testes se necessário
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: () => {},
    warn: () => {},
    error: console.error, // Manter erros visíveis
  };
}