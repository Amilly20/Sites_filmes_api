import crypto from 'crypto';
import UserRepository from '../repositories/userRepository.js';
import HashSenha from '../utils/hashSenha.js';
import UserValidationSchema from '../validadores/userValidator.js';
import { APIError } from "../utils/ApiError.js";

class PasswordResetService {
  static async requestPasswordReset(email) {
    // Verificar se o usuário existe
    const user = await UserRepository.findByEmail(email);
    
    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      console.log(`Tentativa de reset para email não existente: ${email}`);
      return; // Retorna sucesso mesmo que o email não exista
    }

    // Gerar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Definir expiração (1 hora)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    
    // Salvar token diretamente no usuário
    await UserRepository.update(user._id, {
      resetToken: resetToken,
      resetTokenExpires: expiresAt
    });
    
    // Por enquanto, apenas log (sem envio real de email)
    console.log(`Token de reset gerado para ${email}: ${resetToken}`);
    console.log(`Link de reset: /reset-password?token=${resetToken}`);
  }

  static async resetPassword(token, newPassword) {
    // Buscar usuário com token válido e não expirado
    const user = await UserRepository.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new APIError(400, [{
        path: "token",
        message: "Token inválido ou expirado"
      }]);
    }

    // Validar nova senha
    try {
      const { password } = UserValidationSchema.registerSchema.pick({ password: true }).parse({ password: newPassword });
      
      // Hash da nova senha
      const hashedPassword = await HashSenha.criarHashSenha(password);
      
      // Atualizar senha e limpar token
      await UserRepository.update(user._id, { 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      });
      
      console.log(`Senha redefinida com sucesso para: ${user.email}`);
      
    } catch (validationError) {
      if (validationError.issues) {
        throw new APIError(400, validationError.issues.map(issue => ({
          path: issue.path[0],
          message: issue.message
        })));
      }
      throw validationError;
    }
  }
}

export default PasswordResetService;
