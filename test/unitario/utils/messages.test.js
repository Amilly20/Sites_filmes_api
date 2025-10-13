import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import messages, { sendError, sendResponse } from '../../../src/utils/messages.js';

describe('💬 Messages', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
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

  describe('🚫 sendError', () => {
    test('deve enviar erro com array de erros', () => {
      const errors = [
        { message: 'Erro 1', field: 'campo1' },
        { message: 'Erro 2', field: 'campo2' }
      ];

      sendError(res, 400, errors);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        data: [],
        error: true,
        code: 400,
        message: messages.httpCodes['400'],
        errors: errors
      });
    });

    test('deve enviar erro com objeto único', () => {
      const error = { message: 'Erro único', field: 'campo' };

      sendError(res, 404, error);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        data: [],
        error: true,
        code: 404,
        message: messages.httpCodes['404'],
        errors: [error]
      });
    });

    test('deve enviar erro com string simples', () => {
      sendError(res, 500, 'Erro interno do servidor');

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        data: [],
        error: true,
        code: 500,
        message: messages.httpCodes['500'],
        errors: [{ message: 'Erro interno do servidor' }]
      });
    });

    test('deve tratar erro sem parâmetros de erro', () => {
      sendError(res, 400);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        data: [],
        error: true,
        code: 400,
        message: messages.httpCodes['400'],
        errors: []
      });
    });

    test('deve converter números para string em erros', () => {
      sendError(res, 422, 123);

      expect(res.json).toHaveBeenCalledWith({
        data: [],
        error: true,
        code: 422,
        message: messages.httpCodes['422'],
        errors: [{ message: '123' }]
      });
    });

    test('deve tratar diferentes tipos de entrada', () => {
      // Array vazio 
      sendError(res, 400, []);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        errors: []
      }));

      jest.clearAllMocks();

      // String
      sendError(res, 400, 'test error');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        errors: [{ message: 'test error' }]
      }));

      jest.clearAllMocks();

      // Boolean
      sendError(res, 400, false);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        errors: [{ message: 'false' }]
      }));
    });

    test('deve usar mensagens HTTP corretas para diferentes códigos', () => {
      const codes = [400, 401, 403, 404, 422, 500, 501, 503];
      
      codes.forEach(code => {
        jest.clearAllMocks();
        sendError(res, code, 'teste');
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            code: code,
            message: messages.httpCodes[code.toString()]
          })
        );
      });
    });
  });

  describe('✅ sendResponse', () => {
    test('deve enviar resposta de sucesso simples', () => {
      sendResponse(res, 200);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        code: 200,
        message: messages.httpCodes['200'],
        errors: [],
        data: []
      });
    });

    test('deve enviar resposta com dados customizados', () => {
      const responseData = {
        data: { id: 1, name: 'Teste' }
      };

      sendResponse(res, 201, responseData);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        error: false,
        code: 201,
        message: messages.httpCodes['201'],
        errors: [],
        data: { id: 1, name: 'Teste' }
      });
    });

    test('deve sobrescrever propriedades padrão quando fornecidas', () => {
      const responseData = {
        error: true, 
        message: 'Mensagem customizada',
        customField: 'valor customizado'
      };

      sendResponse(res, 200, responseData);

      expect(res.json).toHaveBeenCalledWith({
        error: true,
        code: 200,
        message: 'Mensagem customizada',
        errors: [],
        data: [],
        customField: 'valor customizado'
      });
    });

    test('deve funcionar com diferentes códigos HTTP de sucesso', () => {
      // 201 Created
      sendResponse(res, 201, { data: { created: true } });
      expect(res.status).toHaveBeenCalledWith(201);

      jest.clearAllMocks();

      // 204 No Content
      sendResponse(res, 204);
      expect(res.status).toHaveBeenCalledWith(204);

      jest.clearAllMocks();

      // 202 Accepted
      sendResponse(res, 202, { message: 'Processando...' });
      expect(res.status).toHaveBeenCalledWith(202);
    });

    test('deve manter estrutura quando resp é vazio', () => {
      sendResponse(res, 200, {});

      expect(res.json).toHaveBeenCalledWith({
        error: false,
        code: 200,
        message: messages.httpCodes['200'],
        errors: [],
        data: []
      });
    });

    test('deve permitir arrays em data', () => {
      const responseData = {
        data: [{ id: 1 }, { id: 2 }]
      };

      sendResponse(res, 200, responseData);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: [{ id: 1 }, { id: 2 }]
      }));
    });

    test('deve preservar propriedades extras', () => {
      const responseData = {
        pagination: { total: 100, page: 1 },
        metadata: { version: '1.0' }
      };

      sendResponse(res, 200, responseData);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        pagination: { total: 100, page: 1 },
        metadata: { version: '1.0' }
      }));
    });
  });

  describe('🔄 Integração sendError e sendResponse', () => {
    test('devem manter estrutura consistente', () => {
      // Teste de erro
      sendError(res, 400, 'Erro teste');
      const errorCall = res.json.mock.calls[0][0];
      
      expect(errorCall).toHaveProperty('data');
      expect(errorCall).toHaveProperty('error');
      expect(errorCall).toHaveProperty('code');
      expect(errorCall).toHaveProperty('message');
      expect(errorCall).toHaveProperty('errors');

      jest.clearAllMocks();

      // Teste de sucesso
      sendResponse(res, 200, { data: 'teste' });
      const successCall = res.json.mock.calls[0][0];
      
      expect(successCall).toHaveProperty('error');
      expect(successCall).toHaveProperty('code');
      expect(successCall).toHaveProperty('message');
      expect(successCall).toHaveProperty('errors');
      expect(successCall).toHaveProperty('data');
    });

    test('devem usar mensagens HTTP consistentes', () => {
      const testCodes = [200, 201, 400, 404, 500];
      
      testCodes.forEach(code => {
        jest.clearAllMocks();
        
        if (code >= 400) {
          sendError(res, code, 'teste');
        } else {
          sendResponse(res, code, { data: 'teste' });
        }
        
        const call = res.json.mock.calls[0][0];
        expect(call.message).toBe(messages.httpCodes[code.toString()]);
        expect(call.code).toBe(code);
      });
    });

    test('devem ter comportamentos opostos para error flag', () => {
      sendError(res, 400, 'erro');
      const errorCall = res.json.mock.calls[0][0];
      expect(errorCall.error).toBe(true);

      jest.clearAllMocks();

      sendResponse(res, 200, { data: 'sucesso' });
      const successCall = res.json.mock.calls[0][0];
      expect(successCall.error).toBe(false);
    });

    test('devem funcionar com todos os códigos HTTP definidos', () => {
      const allCodes = Object.keys(messages.httpCodes).map(Number);
      
      allCodes.forEach(code => {
        jest.clearAllMocks();
        
        if (code >= 400) {
          sendError(res, code, `Erro ${code}`);
        } else {
          sendResponse(res, code, { data: `Sucesso ${code}` });
        }
        
        expect(res.status).toHaveBeenCalledWith(code);
        expect(res.json).toHaveBeenCalled();
      });
    });
  });
});
