import { describe, test, expect } from '@jest/globals';
import HashSenha from '../../../src/utils/hashSenha.js';

describe('🔐 HashSenha', () => {
  describe('criarHashSenha', () => {
    test('deve gerar hash da senha fornecida', async () => {
      const senha = 'MinhaSenh@123';
      const hash = await HashSenha.criarHashSenha(senha);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(senha);
      expect(hash.length).toBeGreaterThan(0);
    });

    test('deve gerar hashes diferentes para a mesma senha', async () => {
      const senha = 'MinhaSenh@123';
      const hash1 = await HashSenha.criarHashSenha(senha);
      const hash2 = await HashSenha.criarHashSenha(senha);
      
      expect(hash1).not.toBe(hash2);
    });

    test('deve gerar hash para senhas com caracteres especiais', async () => {
      const senha = 'Senh@!#$%^&*()123';
      const hash = await HashSenha.criarHashSenha(senha);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(senha);
    });

    test('deve gerar hash para senha vazia', async () => {
      const senha = '';
      const hash = await HashSenha.criarHashSenha(senha);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    test('deve gerar hash para senha muito longa', async () => {
      const senha = 'A'.repeat(1000) + '@123';
      const hash = await HashSenha.criarHashSenha(senha);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('compararSenha', () => {
    test('deve retornar true para senha correta', async () => {
      const senha = 'MinhaSenh@123';
      const hash = await HashSenha.criarHashSenha(senha);
      const resultado = await HashSenha.compararSenha(senha, hash);
      
      expect(resultado).toBe(true);
    });

    test('deve retornar false para senha incorreta', async () => {
      const senha = 'MinhaSenh@123';
      const senhaIncorreta = 'SenhaErrada@456';
      const hash = await HashSenha.criarHashSenha(senha);
      const resultado = await HashSenha.compararSenha(senhaIncorreta, hash);
      
      expect(resultado).toBe(false);
    });

    test('deve retornar false para hash inválido', async () => {
      const senha = 'MinhaSenh@123';
      const hashInvalido = 'hash-invalido';
      const resultado = await HashSenha.compararSenha(senha, hashInvalido);
      
      expect(resultado).toBe(false);
    });

    test('deve ser case-sensitive', async () => {
      const senha = 'MinhaSenh@123';
      const senhaDiferente = 'minhaSenh@123';
      const hash = await HashSenha.criarHashSenha(senha);
      const resultado = await HashSenha.compararSenha(senhaDiferente, hash);
      
      expect(resultado).toBe(false);
    });

    test('deve funcionar com caracteres especiais', async () => {
      const senha = 'Senh@!#$%^&*()123';
      const hash = await HashSenha.criarHashSenha(senha);
      const resultado = await HashSenha.compararSenha(senha, hash);
      
      expect(resultado).toBe(true);
    });

    test('deve retornar false para senha vazia vs hash válido', async () => {
      const senha = 'MinhaSenh@123';
      const senhaVazia = '';
      const hash = await HashSenha.criarHashSenha(senha);
      const resultado = await HashSenha.compararSenha(senhaVazia, hash);
      
      expect(resultado).toBe(false);
    });

    test('deve funcionar corretamente com hash de senha vazia', async () => {
      const senhaVazia = '';
      const hash = await HashSenha.criarHashSenha(senhaVazia);
      const resultado = await HashSenha.compararSenha(senhaVazia, hash);
      
      expect(resultado).toBe(true);
    });
  });

  describe('integração criarHashSenha + compararSenha', () => {
    test('deve validar múltiplas senhas diferentes', async () => {
      const senhas = [
        'Password123@',
        'OutraSenha456!',
        'TerceiraSenha789#',
        'Senha$pecial&'
      ];
      
      for (const senha of senhas) {
        const hash = await HashSenha.criarHashSenha(senha);
        const resultado = await HashSenha.compararSenha(senha, hash);
        expect(resultado).toBe(true);
      }
    });

    test('deve rejeitar senhas incorretas para cada hash', async () => {
      const senhaCerta = 'SenhaCerta123@';
      const senhaErrada = 'SenhaErrada456!';
      
      const hash = await HashSenha.criarHashSenha(senhaCerta);
      const resultado = await HashSenha.compararSenha(senhaErrada, hash);
      
      expect(resultado).toBe(false);
    });
  });
});
