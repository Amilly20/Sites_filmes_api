import { describe, test, expect } from '@jest/globals';

describe('Sport Model', () => {
  test('deve ter schema válido definido', async () => {
    const Sport = (await import('../../../src/models/Sport.js')).default;
    
    expect(Sport.schema).toBeDefined();
    expect(Sport.schema.paths.matchTitle).toBeDefined();
    expect(Sport.schema.paths.league).toBeDefined();
    expect(Sport.schema.paths.date).toBeDefined();
    expect(Sport.schema.paths.teams).toBeDefined();
    expect(Sport.schema.paths.url).toBeDefined();
    expect(Sport.schema.paths.status).toBeDefined();
  });

  test('deve ter campos obrigatórios configurados', async () => {
    const Sport = (await import('../../../src/models/Sport.js')).default;
    
    expect(Sport.schema.paths.matchTitle.isRequired).toBe(true);
    expect(Sport.schema.paths.league.isRequired).toBe(true);
    expect(Sport.schema.paths.date.isRequired).toBe(true);
    expect(Sport.schema.paths.url.isRequired).toBe(true);
    // teams é um array, então verifica de forma diferente
    expect(Sport.schema.paths.teams).toBeDefined();
  });

  test('deve ter valores padrão e estrutura completa', async () => {
    const Sport = (await import('../../../src/models/Sport.js')).default;
    
    // Verificar que todos os campos existem
    const schemaKeys = Object.keys(Sport.schema.paths);
    expect(schemaKeys).toContain('matchTitle');
    expect(schemaKeys).toContain('league');
    expect(schemaKeys).toContain('date');
    expect(schemaKeys).toContain('teams');
    expect(schemaKeys).toContain('url');
    expect(schemaKeys).toContain('status');
    expect(Sport.schema.paths.status.defaultValue).toBe('scheduled');
  });

  test('deve ter enum válido para status', async () => {
    const Sport = (await import('../../../src/models/Sport.js')).default;
    
    const statusEnum = Sport.schema.paths.status.enumValues;
    expect(statusEnum).toContain('scheduled');
    expect(statusEnum).toContain('live');
    expect(statusEnum).toContain('finished');
  });

  test('deve ter timestamps habilitados', async () => {
    const Sport = (await import('../../../src/models/Sport.js')).default;
    
    expect(Sport.schema.options.timestamps).toBe(true);
  });

  test('deve ser um modelo do mongoose válido', async () => {
    const Sport = (await import('../../../src/models/Sport.js')).default;
    
    expect(Sport.modelName).toBe('Sport');
    expect(typeof Sport.find).toBe('function');
    expect(typeof Sport.findOne).toBe('function');
    expect(typeof Sport.create).toBe('function');
  });
});
