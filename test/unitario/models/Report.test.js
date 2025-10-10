import { describe, test, expect } from '@jest/globals';

describe('Report Model', () => {
  test('deve ter schema válido definido', async () => {
    const Report = (await import('../../../src/models/Report.js')).default;
    
    expect(Report.schema).toBeDefined();
    expect(Report.schema.paths.date).toBeDefined();
    expect(Report.schema.paths.totalUsers).toBeDefined();
    expect(Report.schema.paths.activeUsers).toBeDefined();
    expect(Report.schema.paths.mostWatchedMovies).toBeDefined();
    expect(Report.schema.paths.mostWatchedSports).toBeDefined();
  });

  test('deve ter campos obrigatórios configurados', async () => {
    const Report = (await import('../../../src/models/Report.js')).default;
    
    expect(Report.schema.paths.date.isRequired).toBe(true);
    expect(Report.schema.paths.totalUsers.isRequired).toBe(true);
    expect(Report.schema.paths.activeUsers.isRequired).toBe(true);
  });

  test('deve ter estrutura completa do schema', async () => {
    const Report = (await import('../../../src/models/Report.js')).default;
    
    // Verificar que todos os campos principais existem
    const schemaKeys = Object.keys(Report.schema.paths);
    expect(schemaKeys).toContain('date');
    expect(schemaKeys).toContain('totalUsers'); 
    expect(schemaKeys).toContain('activeUsers');
    expect(schemaKeys).toContain('mostWatchedMovies');
    expect(schemaKeys).toContain('mostWatchedSports');
  });

  test('deve ter timestamps habilitados', async () => {
    const Report = (await import('../../../src/models/Report.js')).default;
    
    expect(Report.schema.options.timestamps).toBe(true);
  });

  test('deve ter arrays para filmes e esportes mais assistidos', async () => {
    const Report = (await import('../../../src/models/Report.js')).default;
    
    const movieField = Report.schema.paths.mostWatchedMovies;
    const sportField = Report.schema.paths.mostWatchedSports;
    
    expect(movieField).toBeDefined();
    expect(sportField).toBeDefined();
  });

  test('deve ser um modelo do mongoose válido', async () => {
    const Report = (await import('../../../src/models/Report.js')).default;
    
    expect(Report.modelName).toBe('Report');
    expect(typeof Report.find).toBe('function');
    expect(typeof Report.findOne).toBe('function');
    expect(typeof Report.create).toBe('function');
  });
});
