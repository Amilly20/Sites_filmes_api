import { describe, test, expect } from '@jest/globals';
import AutenticacaoSchema from '../../../src/validadores/authValidator.js';

describe('🔐 AutenticacaoSchema', () => {
  describe('loginSchema', () => {
    test('deve aceitar dados de login válidos', () => {
      const data = {
        email: 'usuario@gmail.com',
        senha: 'MinhaSenh@123'
      };
      
      const result = AutenticacaoSchema.loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('deve rejeitar email inválido', () => {
      const data = {
        email: 'email-invalido',
        senha: 'MinhaSenh@123'
      };
      
      const result = AutenticacaoSchema.loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('email');
    });

    test('deve aceitar diferentes emails válidos', () => {
      const validEmails = [
        'test@gmail.com',
        'user@hotmail.com',
        'pessoa@outlook.com',
        'admin@yahoo.com',
        'contato@uol.com.br'
      ];
      
      validEmails.forEach(email => {
        const data = {
          email,
          senha: 'MinhaSenh@123'
        };
        
        const result = AutenticacaoSchema.loginSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    test('deve rejeitar dados sem email', () => {
      const data = {
        senha: 'MinhaSenh@123'
      };
      
      const result = AutenticacaoSchema.loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      // Zod retorna mensagem padrão quando o campo não existe
      expect(result.error.issues[0].code).toBe('invalid_type');
      expect(result.error.issues[0].path).toEqual(['email']);
    });

    test('deve rejeitar dados sem senha', () => {
      const data = {
        email: 'usuario@gmail.com'
      };
      
      const result = AutenticacaoSchema.loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].code).toBe('invalid_type');
      expect(result.error.issues[0].path).toEqual(['senha']);
    });

    test('deve rejeitar senha sem letra minúscula', () => {
      const data = {
        email: 'usuario@gmail.com',
        senha: 'MINHASENHA@123'
      };
      
      const result = AutenticacaoSchema.loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('letra minúscula');
    });

    test('deve rejeitar senha sem letra maiúscula', () => {
      const data = {
        email: 'usuario@gmail.com',
        senha: 'minhasenha@123'
      };
      
      const result = AutenticacaoSchema.loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('letra maiúscula');
    });

    test('deve rejeitar senha sem número', () => {
      const data = {
        email: 'usuario@gmail.com',
        senha: 'MinhaSenha@'
      };
      
      const result = AutenticacaoSchema.loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('número');
    });

    test('deve rejeitar senha sem símbolo', () => {
      const data = {
        email: 'usuario@gmail.com',
        senha: 'MinhaSenha123'
      };
      
      const result = AutenticacaoSchema.loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('símbolo');
    });
  });
});