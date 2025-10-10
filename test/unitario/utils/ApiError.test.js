import { describe, test, expect } from '@jest/globals';
import { APIError } from '../../../src/utils/ApiError.js';

describe('⚠️ APIError', () => {
  describe('construtor', () => {
    test('deve criar erro com statusCode e errors', () => {
      const code = 400;
      const errors = ['Erro de teste'];
      
      const error = new APIError(code, errors);
      
      expect(error.statusCode).toBe(code);
      expect(error.errors).toEqual(errors);
      expect(error instanceof Error).toBe(true);
      expect(error instanceof APIError).toBe(true);
    });

    test('deve usar statusCode padrão 400 quando não fornecido', () => {
      const errors = ['Erro sem statusCode'];
      
      const error = new APIError(undefined, errors);
      
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(errors);
    });

    test('deve usar errors padrão vazio quando não fornecido', () => {
      const code = 500;
      
      const error = new APIError(code);
      
      expect(error.statusCode).toBe(code);
      expect(error.errors).toEqual([]);
    });

    test('deve preservar stack trace', () => {
      const error = new APIError(400, ['Teste stack trace']);
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack.length).toBeGreaterThan(0);
    });
  });

  describe('toJson', () => {
    test('deve retornar objeto JSON com statusCode e errors', () => {
      const code = 400;
      const errors = ['Dados inválidos', 'Campo obrigatório'];
      
      const error = new APIError(code, errors);
      const json = error.toJson();
      
      expect(json).toEqual({
        statusCode: code,
        errors: errors
      });
    });

    test('deve retornar JSON com errors vazio quando não fornecido', () => {
      const error = new APIError(500);
      const json = error.toJson();
      
      expect(json).toEqual({
        statusCode: 500,
        errors: []
      });
    });

    test('deve retornar JSON válido para diferentes códigos de erro', () => {
      const testCases = [
        { code: 400, errors: ['Bad Request'] },
        { code: 401, errors: ['Unauthorized'] },
        { code: 403, errors: ['Forbidden'] },
        { code: 404, errors: ['Not Found'] },
        { code: 500, errors: ['Internal Server Error'] }
      ];

      testCases.forEach(({ code, errors }) => {
        const error = new APIError(code, errors);
        const json = error.toJson();
        
        expect(json.statusCode).toBe(code);
        expect(json.errors).toEqual(errors);
      });
    });
  });

  describe('comportamento como Error padrão', () => {
    test('deve ser capturado por try/catch', () => {
      expect(() => {
        try {
          throw new APIError(400, ['Erro de teste']);
        } catch (error) {
          expect(error instanceof APIError).toBe(true);
          expect(error.statusCode).toBe(400);
          expect(error.errors).toEqual(['Erro de teste']);
          throw error; // Re-throw para o expect externo
        }
      }).toThrow();
    });

    test('deve manter propriedades Error padrão', () => {
      const error = new APIError(400, ['Teste']);
      
      expect(error.name).toBe('Error'); // Herda de Error
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('casos de uso comuns', () => {
    test('deve criar erros para diferentes cenários HTTP', () => {
      const badRequest = new APIError(400, ['Requisição inválida']);
      const unauthorized = new APIError(401, ['Token inválido']);
      const forbidden = new APIError(403, ['Acesso negado']);
      const notFound = new APIError(404, ['Recurso não encontrado']);
      const internal = new APIError(500, ['Erro interno']);
      
      expect(badRequest.statusCode).toBe(400);
      expect(unauthorized.statusCode).toBe(401);
      expect(forbidden.statusCode).toBe(403);
      expect(notFound.statusCode).toBe(404);
      expect(internal.statusCode).toBe(500);
      
      [badRequest, unauthorized, forbidden, notFound, internal].forEach(error => {
        expect(error instanceof APIError).toBe(true);
        expect(error instanceof Error).toBe(true);
      });
    });

    test('deve suportar múltiplas mensagens de erro', () => {
      const errors = [
        'Email inválido',
        'Senha muito fraca',
        'Nome é obrigatório'
      ];
      
      const error = new APIError(422, errors);
      
      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual(errors);
      expect(error.errors.length).toBe(3);
    });
  });
});
