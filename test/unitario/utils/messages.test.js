import { describe, test, expect } from '@jest/globals';
import messages from '../../../src/utils/messages.js';

describe('💬 Messages', () => {
  describe('estrutura principal', () => {
    test('deve ter todas as categorias principais definidas', () => {
      expect(messages.httpCodes).toBeDefined();
      expect(messages.info).toBeDefined();
      expect(messages.success).toBeDefined();
      expect(messages.error).toBeDefined();
      expect(messages.auth).toBeDefined();
      expect(messages.validationReference).toBeDefined();
      expect(messages.customValidation).toBeDefined();
    });

    test('todas as categorias devem ser objetos', () => {
      expect(typeof messages.httpCodes).toBe('object');
      expect(typeof messages.info).toBe('object');
      expect(typeof messages.success).toBe('object');
      expect(typeof messages.error).toBe('object');
      expect(typeof messages.auth).toBe('object');
      expect(typeof messages.validationReference).toBe('object');
      expect(typeof messages.customValidation).toBe('object');
    });
  });

  describe('httpCodes', () => {
    test('deve conter códigos HTTP comuns', () => {
      expect(messages.httpCodes['200']).toBeDefined();
      expect(messages.httpCodes['400']).toBeDefined();
      expect(messages.httpCodes['401']).toBeDefined();
      expect(messages.httpCodes['404']).toBeDefined();
      expect(messages.httpCodes['500']).toBeDefined();
    });

    test('mensagens HTTP devem ser strings', () => {
      const codes = ['200', '400', '401', '404', '500'];
      codes.forEach(code => {
        expect(typeof messages.httpCodes[code]).toBe('string');
        expect(messages.httpCodes[code].length).toBeGreaterThan(0);
      });
    });
  });

  describe('auth', () => {
    test('deve conter mensagens de autenticação', () => {
      expect(messages.auth.authenticationFailed).toBeDefined();
      expect(messages.auth.invalidCredentials).toBeDefined();
      expect(messages.auth.invalidToken).toBeDefined();
      
      expect(typeof messages.auth.authenticationFailed).toBe('string');
      expect(typeof messages.auth.invalidCredentials).toBe('string');
      expect(typeof messages.auth.invalidToken).toBe('string');
    });

    test('deve ter funções para mensagens dinâmicas de auth', () => {
      expect(typeof messages.auth.userNotFound).toBe('function');
      expect(typeof messages.auth.duplicateEntry).toBe('function');
      expect(typeof messages.auth.emailAlreadyExists).toBe('function');
      
      const userNotFoundResult = messages.auth.userNotFound('123');
      expect(typeof userNotFoundResult).toBe('string');
      expect(userNotFoundResult).toContain('123');
      
      const emailExistsResult = messages.auth.emailAlreadyExists('test@example.com');
      expect(typeof emailExistsResult).toBe('string');
      expect(emailExistsResult).toContain('test@example.com');
    });
  });

  describe('error', () => {
    test('deve conter mensagens de erro padrão', () => {
      expect(messages.error.error).toBeDefined();
      expect(messages.error.serverError).toBeDefined();
      expect(messages.error.invalidRequest).toBeDefined();
      expect(messages.error.unauthorizedAccess).toBeDefined();
      
      expect(typeof messages.error.error).toBe('string');
      expect(typeof messages.error.serverError).toBe('string');
      expect(typeof messages.error.invalidRequest).toBe('string');
      expect(typeof messages.error.unauthorizedAccess).toBe('string');
    });

    test('deve ter funções para mensagens dinâmicas', () => {
      expect(typeof messages.error.resourceNotFound).toBe('function');
      expect(typeof messages.error.resourceExists).toBe('function');
      expect(typeof messages.error.resourceFound).toBe('function');
      
      const notFoundResult = messages.error.resourceNotFound('usuário');
      expect(typeof notFoundResult).toBe('string');
      expect(notFoundResult).toContain('usuário');
    });
  });

  describe('success', () => {
    test('deve conter mensagem de sucesso', () => {
      expect(messages.success.success).toBeDefined();
      expect(typeof messages.success.success).toBe('string');
    });
  });

  describe('customValidation', () => {
    test('deve conter validações customizadas', () => {
      expect(messages.customValidation.invalidTitulo).toBeDefined();
      expect(messages.customValidation.invalidNome).toBeDefined();
      expect(messages.customValidation.invalidMatricula).toBeDefined();
      
      expect(typeof messages.customValidation.invalidTitulo.message).toBe('string');
      expect(typeof messages.customValidation.invalidNome.message).toBe('string');
      expect(typeof messages.customValidation.invalidMatricula.message).toBe('string');
    });

    test('deve ter funções para validações dinâmicas', () => {
      expect(typeof messages.customValidation.lengthTooBig).toBe('function');
      expect(typeof messages.customValidation.lengthTooShort).toBe('function');
      expect(typeof messages.customValidation.valueTooBig).toBe('function');
      expect(typeof messages.customValidation.valueTooSmall).toBe('function');
      
      const lengthResult = messages.customValidation.lengthTooBig('nome', 50);
      expect(typeof lengthResult).toBe('string');
      expect(lengthResult).toContain('nome');
      expect(lengthResult).toContain('50');
    });
  });

  describe('integração prática', () => {
    test('deve permitir uso em respostas HTTP', () => {
      const errorResponse = {
        success: false,
        code: 400,
        message: messages.httpCodes['400'],
        errors: [messages.auth.invalidCredentials]
      };

      expect(errorResponse.message).toBeDefined();
      expect(errorResponse.errors[0]).toBeDefined();
      expect(typeof errorResponse.message).toBe('string');
      expect(typeof errorResponse.errors[0]).toBe('string');
    });

    test('deve permitir uso de mensagens dinâmicas', () => {
      const userId = '12345';
      const email = 'user@example.com';
      
      const userNotFoundMessage = messages.auth.userNotFound(userId);
      const emailExistsMessage = messages.auth.emailAlreadyExists(email);
      
      expect(userNotFoundMessage).toContain(userId);
      expect(emailExistsMessage).toContain(email);
    });
  });
});