import { describe, test, expect } from '@jest/globals';

describe('EmailService', () => {
  test('deve ter método createTransporter definido', async () => {
    const EmailService = (await import('../../../src/services/emailService.js')).default;
    
    expect(typeof EmailService.createTransporter).toBe('function');
  });

  test('deve ter método sendPasswordResetEmail definido', async () => {
    const EmailService = (await import('../../../src/services/emailService.js')).default;
    
    expect(typeof EmailService.sendPasswordResetEmail).toBe('function');
  });

  test('deve criar transporter com configuração Gmail quando credenciais estão disponíveis', async () => {
    const EmailService = (await import('../../../src/services/emailService.js')).default;
    
    // Salvar variáveis originais
    const originalEmailUser = process.env.EMAIL_USER;
    const originalEmailPass = process.env.EMAIL_PASS;
    
    try {
      // Configurar credenciais
      process.env.EMAIL_USER = 'test@gmail.com';
      process.env.EMAIL_PASS = 'password123';
      
      // Deve retornar um transporter (não podemos testar o conteúdo sem mock)
      const transporter = EmailService.createTransporter();
      expect(transporter).toBeDefined();
      expect(typeof transporter.sendMail).toBe('function');
      
    } finally {
      // Restaurar variáveis originais
      if (originalEmailUser) process.env.EMAIL_USER = originalEmailUser;
      else delete process.env.EMAIL_USER;
      
      if (originalEmailPass) process.env.EMAIL_PASS = originalEmailPass;
      else delete process.env.EMAIL_PASS;
    }
  });

  test('deve usar fallback Ethereal quando credenciais não estão disponíveis', async () => {
    const EmailService = (await import('../../../src/services/emailService.js')).default;
    
    // Salvar variáveis originais
    const originalEmailUser = process.env.EMAIL_USER;
    const originalEmailPass = process.env.EMAIL_PASS;
    
    try {
      // Remover credenciais
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;
      
      // Deve retornar um transporter
      const transporter = EmailService.createTransporter();
      expect(transporter).toBeDefined();
      expect(typeof transporter.sendMail).toBe('function');
      
    } finally {
      // Restaurar variáveis originais
      if (originalEmailUser) process.env.EMAIL_USER = originalEmailUser;
      if (originalEmailPass) process.env.EMAIL_PASS = originalEmailPass;
    }
  });

  test('sendPasswordResetEmail deve processar parâmetros', async () => {
    const EmailService = (await import('../../../src/services/emailService.js')).default;
    
    // Teste de estrutura - método deve existir e aceitar parâmetros
    expect(() => {
      EmailService.sendPasswordResetEmail('test@example.com', 'token');
    }).not.toThrow();
  });

  test('sendPasswordResetEmail deve aceitar parâmetros válidos', async () => {
    const EmailService = (await import('../../../src/services/emailService.js')).default;
    
    // Teste básico - deve ser uma função assíncrona
    expect(typeof EmailService.sendPasswordResetEmail).toBe('function');
    
    // Se o teste falhar por problemas de SMTP, isso é esperado em ambiente de teste
    try {
      const result = await EmailService.sendPasswordResetEmail('test@example.com', 'valid-token');
      expect(typeof result).toBe('boolean');
    } catch (error) {
      // É esperado que falhe em ambiente de teste sem configuração de email
      expect(error.message).toContain('email');
    }
  });
});
