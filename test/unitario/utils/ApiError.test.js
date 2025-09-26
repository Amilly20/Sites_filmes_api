import { describe, test, expect } from '@jest/globals';
import { APIErro } from '../../../src/utils/ApiError.js';

describe('⚠️ APIErro', () => {
  describe('construtor', () => {
    test('deve criar erro com code e errors', () => {
      const code = 400;
      const errors = ['Erro de teste'];
      
      const error = new APIErro(code, errors);
      
      expect(error.code).toBe(code);
      expect(error.errors).toEqual(errors);
      expect(error instanceof Error).toBe(true);
      expect(error instanceof APIErro).toBe(true);
    });

    test('deve usar code padrão 400 quando não fornecido', () => {
      const errors = ['Erro sem code'];
      
      const error = new APIErro(undefined, errors);
      
      expect(error.code).toBe(400);
      expect(error.errors).toEqual(errors);
    });

    test('deve usar errors padrão vazio quando não fornecido', () => {
      const code = 500;
      
      const error = new APIErro(code);
      
      expect(error.code).toBe(code);
      expect(error.errors).toEqual([]);
    });

    test('deve preservar stack trace', () => {
      const error = new APIErro(400, ['Teste stack trace']);
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack.length).toBeGreaterThan(0);
    });
  });

  describe('toJson', () => {
    test('deve retornar objeto JSON com code e errors', () => {
      const code = 400;
      const errors = ['Dados inválidos', 'Campo obrigatório'];
      
      const error = new APIErro(code, errors);
      const json = error.toJson();
      
      expect(json).toEqual({
        code: code,
        errors: errors
      });
    });

    test('deve retornar JSON com errors vazio quando não fornecido', () => {
      const error = new APIErro(500);
      const json = error.toJson();
      
      expect(json).toEqual({
        code: 500,
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
        const error = new APIErro(code, errors);
        const json = error.toJson();
        
        expect(json.code).toBe(code);
        expect(json.errors).toEqual(errors);
      });
    });
  });

  describe('comportamento como Error padrão', () => {
    test('deve ser capturado por try/catch', () => {
      expect(() => {
        try {
          throw new APIErro(400, ['Erro de teste']);
        } catch (error) {
          expect(error instanceof APIErro).toBe(true);
          expect(error.code).toBe(400);
          expect(error.errors).toEqual(['Erro de teste']);
          throw error; // Re-throw para o expect externo
        }
      }).toThrow();
    });

    test('deve manter propriedades Error padrão', () => {
      const error = new APIErro(400, ['Teste']);
      
      expect(error.name).toBe('Error'); // Herda de Error
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('casos de uso comuns', () => {
    test('deve criar erros para diferentes cenários HTTP', () => {
      const badRequest = new APIErro(400, ['Requisição inválida']);
      const unauthorized = new APIErro(401, ['Token inválido']);
      const forbidden = new APIErro(403, ['Acesso negado']);
      const notFound = new APIErro(404, ['Recurso não encontrado']);
      const internal = new APIErro(500, ['Erro interno']);
      
      expect(badRequest.code).toBe(400);
      expect(unauthorized.code).toBe(401);
      expect(forbidden.code).toBe(403);
      expect(notFound.code).toBe(404);
      expect(internal.code).toBe(500);
      
      [badRequest, unauthorized, forbidden, notFound, internal].forEach(error => {
        expect(error instanceof APIErro).toBe(true);
        expect(error instanceof Error).toBe(true);
      });
    });

    test('deve suportar múltiplas mensagens de erro', () => {
      const errors = [
        'Email inválido',
        'Senha muito fraca',
        'Nome é obrigatório'
      ];
      
      const error = new APIErro(422, errors);
      
      expect(error.code).toBe(422);
      expect(error.errors).toEqual(errors);
      expect(error.errors.length).toBe(3);
    });
  });
});