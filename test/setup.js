import TestDatabase from './helpers/testDatabase.js';

// Setup global para todos os testes
beforeAll(async () => {
  // Configurar NODE_ENV para testes
  process.env.NODE_ENV = 'test';
  
  // Conectar ao banco de testes
  await TestDatabase.connect();
}, 15000);

// Cleanup após todos os testes
afterAll(async () => {
  await TestDatabase.disconnect();
}, 10000);

// Configurações globais para testes otimizadas
if (process.env.NODE_ENV === 'test') {
  // Silenciar completamente os logs para performance
  global.console = {
    ...console,
    log: () => {},
    warn: () => {},
    info: () => {},
    debug: () => {},
    error: () => {}, // Silenciar até erros para máxima performance
  };
  
  // Configurar mongoose para performance
  process.env.MONGOOSE_BUFFER_COMMANDS = 'false';
}