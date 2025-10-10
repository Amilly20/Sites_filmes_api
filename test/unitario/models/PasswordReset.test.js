import { describe, test, expect } from '@jest/globals';

describe('PasswordReset Model', () => {
  test('deve ter schema válido definido', async () => {
    const PasswordReset = (await import('../../../src/models/PasswordReset.js')).default;
    
    expect(PasswordReset.schema).toBeDefined();
    expect(PasswordReset.schema.paths.email).toBeDefined();
    expect(PasswordReset.schema.paths.token).toBeDefined();
    expect(PasswordReset.schema.paths.expiresAt).toBeDefined();
    expect(PasswordReset.schema.paths.used).toBeDefined();
  });

  test('deve ter campos obrigatórios configurados', async () => {
    const PasswordReset = (await import('../../../src/models/PasswordReset.js')).default;
    
    expect(PasswordReset.schema.paths.email.isRequired).toBe(true);
    expect(PasswordReset.schema.paths.token.isRequired).toBe(true);
    expect(PasswordReset.schema.paths.expiresAt.isRequired).toBe(true);
  });

  test('deve ter valor padrão para used', async () => {
    const PasswordReset = (await import('../../../src/models/PasswordReset.js')).default;
    
    expect(PasswordReset.schema.paths.used.defaultValue).toBe(false);
  });

  test('deve ter timestamps habilitados', async () => {
    const PasswordReset = (await import('../../../src/models/PasswordReset.js')).default;
    
    expect(PasswordReset.schema.options.timestamps).toBe(true);
  });

  test('deve ter token com unique constraint', async () => {
    const PasswordReset = (await import('../../../src/models/PasswordReset.js')).default;
    
    expect(PasswordReset.schema.paths.token.options.unique).toBe(true);
  });

  test('deve ter índice de expiração configurado', async () => {
    const PasswordReset = (await import('../../../src/models/PasswordReset.js')).default;
    
    const indexes = PasswordReset.schema.indexes();
    const expirationIndex = indexes.find(index => index[0].expiresAt === 1);
    
    expect(expirationIndex).toBeDefined();
    expect(expirationIndex[1].expireAfterSeconds).toBe(0);
  });

  test('deve ser um modelo do mongoose válido', async () => {
    const PasswordReset = (await import('../../../src/models/PasswordReset.js')).default;
    
    expect(PasswordReset.modelName).toBe('PasswordReset');
    expect(typeof PasswordReset.find).toBe('function');
    expect(typeof PasswordReset.findOne).toBe('function');
    expect(typeof PasswordReset.create).toBe('function');
  });
});
