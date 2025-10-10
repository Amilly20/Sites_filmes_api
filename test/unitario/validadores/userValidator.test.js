import { describe, test, expect } from '@jest/globals';
import UserValidationSchema from '../../../src/validadores/userValidator.js';

describe('🔍 UserValidationSchema', () => {
  describe('registerSchema - Nome', () => {
    test('deve aceitar nome válido', () => {
      const data = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        password: 'MinhaSenh@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('deve rejeitar nome com números', () => {
      const data = {
        name: 'João123',
        email: 'joao@gmail.com', 
        password: 'MinhaSenh@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('apenas letras e espaços');
    });

    test('deve rejeitar nome com símbolos', () => {
      const data = {
        name: 'João@Silva',
        email: 'joao@gmail.com',
        password: 'MinhaSenh@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('apenas letras e espaços');
    });

    test('deve rejeitar nome muito curto', () => {
      const data = {
        name: 'J',
        email: 'joao@gmail.com',
        password: 'MinhaSenh@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('mínimo 2 caracteres');
    });

    test('deve aceitar nomes com acentos', () => {
      const data = {
        name: 'José André',
        email: 'jose@gmail.com',
        password: 'MinhaSenh@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('registerSchema - Email', () => {
    test('deve aceitar email de provedor válido', () => {
      const validEmails = [
        'usuario@gmail.com',
        'test@hotmail.com', 
        'user@outlook.com',
        'pessoa@yahoo.com',
        'admin@uol.com.br'
      ];
      
      validEmails.forEach(email => {
        const data = {
          name: 'João Silva',
          email,
          password: 'MinhaSenh@123'
        };
        
        const result = UserValidationSchema.registerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    test('deve rejeitar email de provedor inválido', () => {
      const data = {
        name: 'João Silva',
        email: 'usuario@provedor-invalido.com',
        password: 'MinhaSenh@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('provedor válido');
    });

    test('deve rejeitar email inválido', () => {
      const data = {
        name: 'João Silva',
        email: 'email-inválido',
        password: 'MinhaSenh@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema - Senha', () => {
    test('deve aceitar senha válida', () => {
      const data = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        password: 'MinhaSenh@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('deve rejeitar senha sem letra minúscula', () => {
      const data = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        password: 'MINHASENHA@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('letra minúscula');
    });

    test('deve rejeitar senha sem letra maiúscula', () => {
      const data = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        password: 'minhasenha@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('letra maiúscula');
    });

    test('deve rejeitar senha sem número', () => {
      const data = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        password: 'MinhaSenha@'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('1 número');
    });

    test('deve rejeitar senha sem caractere especial', () => {
      const data = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        password: 'MinhaSenha123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('1 caractere especial');
    });

    test('deve rejeitar senha com espaços', () => {
      const data = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        password: 'Minha Senh@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('não deve conter espaços');
    });

    test('deve rejeitar senha muito curta', () => {
      const data = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        password: 'Ab@1'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('mínimo 8 caracteres');
    });
  });

  describe('registerSchema - Campos obrigatórios', () => {
    test('deve rejeitar dados sem nome', () => {
      const data = {
        email: 'joao@gmail.com',
        password: 'MinhaSenh@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].code).toBe('invalid_type');
      expect(result.error.issues[0].path).toEqual(['name']);
    });

    test('deve rejeitar dados sem email', () => {
      const data = {
        name: 'João Silva',
        password: 'MinhaSenh@123'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].code).toBe('invalid_type');
      expect(result.error.issues[0].path).toEqual(['email']);
    });

    test('deve rejeitar dados sem senha', () => {
      const data = {
        name: 'João Silva',
        email: 'joao@gmail.com'
      };
      
      const result = UserValidationSchema.registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].code).toBe('invalid_type');
      expect(result.error.issues[0].path).toEqual(['password']);
    });
  });
});
