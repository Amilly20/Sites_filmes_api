import bcrypt from 'bcryptjs';

/**
 * 🚀 Hash otimizado para testes
 * Usa salt rounds menor para performance
 */
class FastHash {
  static async criarHashSenha(senha) {
    // Salt rounds baixo (4) para testes - muito mais rápido que 10
    return await bcrypt.hash(senha, 4);
  }

  static async compararSenha(senha, hash) {
    return await bcrypt.compare(senha, hash);
  }
}

export default FastHash;