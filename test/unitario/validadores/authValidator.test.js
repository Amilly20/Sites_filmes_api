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

    test('deve rejeitar senha muito curta', () => {
      const data = {
        email: 'usuario@gmail.com',
        senha: 'Abc1!'
      };
      
      const result = AutenticacaoSchema.loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('8 caracteres');
    });

    test('deve aceitar senhas com diferentes símbolos', () => {
      const symbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=', '{', '}', '[', ']', '|', '\\', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/', '~', '`'];
      
      symbols.forEach(symbol => {
        const data = {
          email: 'usuario@gmail.com',
          senha: `MinhaSenh${symbol}123`
        };
        
        const result = AutenticacaoSchema.loginSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    test('deve rejeitar tipos inválidos para email', () => {
      const invalidTypes = [123, [], {}, true];
      
      invalidTypes.forEach(email => {
        const data = { email, senha: 'MinhaSenh@123' };
        const result = AutenticacaoSchema.loginSchema.safeParse(data);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('Invalid input: expected string, received');
      });

      // Teste separado para null e undefined que têm mensagem diferente
      [null, undefined].forEach(email => {
        const data = { email, senha: 'MinhaSenh@123' };
        const result = AutenticacaoSchema.loginSchema.safeParse(data);
        expect(result.success).toBe(false);
        // Zod retorna mensagem genérica para null/undefined
        expect(result.error.issues[0].message).toContain('expected string');
      });
    });

    test('deve rejeitar tipos inválidos para senha', () => {
      const invalidTypes = [123, [], {}, true];
      
      invalidTypes.forEach(senha => {
        const data = { email: 'usuario@gmail.com', senha };
        const result = AutenticacaoSchema.loginSchema.safeParse(data);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('Invalid input: expected string, received');
      });

      // Teste separado para null e undefined 
      [null, undefined].forEach(senha => {
        const data = { email: 'usuario@gmail.com', senha };
        const result = AutenticacaoSchema.loginSchema.safeParse(data);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('expected string');
      });
    });

    test('deve retornar mensagens de erro específicas', () => {
      // Teste email inválido
      let result = AutenticacaoSchema.loginSchema.safeParse({ email: 'invalid', senha: 'MinhaSenh@123' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Email invalido!');

      // Teste comprimento mínimo senha
      result = AutenticacaoSchema.loginSchema.safeParse({ email: 'usuario@gmail.com', senha: 'Ab1!' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('A senha deve possuir no minimo 8 caracteres!');
    });

    test('deve validar múltiplos erros simultaneamente', () => {
      const result = AutenticacaoSchema.loginSchema.safeParse({
        email: 'invalid-email',
        senha: 'weak'
      });
      
      expect(result.success).toBe(false);
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
    });

    test('deve lidar com dados vazios', () => {
      const result = AutenticacaoSchema.loginSchema.safeParse({});
      
      expect(result.success).toBe(false);
      expect(result.error.issues.length).toBe(2);
      
      const paths = result.error.issues.map(issue => issue.path[0]);
      expect(paths).toContain('email');
      expect(paths).toContain('senha');
    });

    test('deve remover campos extras não definidos no schema', () => {
      const dataWithExtra = {
        email: 'usuario@gmail.com',
        senha: 'MinhaSenh@123',
        extraField: 'should be removed',
        anotherField: 123
      };

      const result = AutenticacaoSchema.loginSchema.safeParse(dataWithExtra);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        email: 'usuario@gmail.com',
        senha: 'MinhaSenh@123'
      });
      expect(result.data).not.toHaveProperty('extraField');
      expect(result.data).not.toHaveProperty('anotherField');
    });

    test('deve aceitar senhas complexas válidas', () => {
      const complexPasswords = [
        'MyStr0ng!P@ssw0rd',
        'C0mplex#P4ssw0rd!',
        'Sup3r$ecure&Pass',
        'Ultr@S3cur3*P4ss!'
      ];

      complexPasswords.forEach(senha => {
        const data = { email: 'usuario@gmail.com', senha };
        const result = AutenticacaoSchema.loginSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    test('deve funcionar com emails de diferentes domínios', () => {
      const emailDomains = [
        'user@gmail.com',
        'user@yahoo.com',
        'user@hotmail.com',
        'user@outlook.com',
        'user@empresa.com.br',
        'user@sub.domain.org',
        'user@university.edu'
      ];

      emailDomains.forEach(email => {
        const data = { email, senha: 'MinhaSenh@123' };
        const result = AutenticacaoSchema.loginSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    test('deve rejeitar strings vazias', () => {
      let result = AutenticacaoSchema.loginSchema.safeParse({
        email: '',
        senha: 'MinhaSenh@123'
      });
      expect(result.success).toBe(false);

      result = AutenticacaoSchema.loginSchema.safeParse({
        email: 'usuario@gmail.com',
        senha: ''
      });
      expect(result.success).toBe(false);
    });

    describe('🧪 Casos extremos', () => {
      test('deve lidar com senhas muito longas', () => {
        const longPassword = 'A'.repeat(50) + 'a'.repeat(50) + '1'.repeat(50) + '!'.repeat(50);
        const data = { email: 'usuario@gmail.com', senha: longPassword };
        
        const result = AutenticacaoSchema.loginSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      test('deve validar emails com caracteres especiais permitidos', () => {
        const specialEmails = [
          'user+tag@gmail.com',
          'user.name@domain.com',
          'user_name@domain.com',
          'user-name@domain.com',
          'user123@domain.com'
        ];

        specialEmails.forEach(email => {
          const data = { email, senha: 'MinhaSenh@123' };
          const result = AutenticacaoSchema.loginSchema.safeParse(data);
          expect(result.success).toBe(true);
        });
      });

      test('deve rejeitar emails malformados', () => {
        const malformedEmails = [
          '@gmail.com',
          'user@',
          'user@@gmail.com',
          'user..name@gmail.com',
          'user@gmail.',
          'user@.com',
          '.user@gmail.com'
        ];

        malformedEmails.forEach(email => {
          const data = { email, senha: 'MinhaSenh@123' };
          const result = AutenticacaoSchema.loginSchema.safeParse(data);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('📈 Estrutura do schema', () => {
      test('deve ter propriedades corretas do schema', () => {
        expect(AutenticacaoSchema.loginSchema).toBeDefined();
        expect(typeof AutenticacaoSchema.loginSchema.parse).toBe('function');
        expect(typeof AutenticacaoSchema.loginSchema.safeParse).toBe('function');
      });

      test('deve funcionar como um validador Zod', () => {
        // Teste que comprova que é um schema Zod funcional
        const validData = {
          email: 'test@example.com',
          senha: 'ValidPass123!'
        };
        
        const result = AutenticacaoSchema.loginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      test('deve validar apenas os campos esperados', () => {
        const dataWithExtra = {
          email: 'test@example.com',
          senha: 'ValidPass123!',
          extraField: 'should not appear'
        };
        
        const result = AutenticacaoSchema.loginSchema.safeParse(dataWithExtra);
        expect(result.success).toBe(true);
        expect(result.data).toEqual({
          email: 'test@example.com',
          senha: 'ValidPass123!'
        });
      });
    });
  });
});
