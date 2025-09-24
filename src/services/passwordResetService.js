import crypto from 'crypto';
import UserRepository from '../repositories/userRepository.js';
import PasswordReset from '../models/PasswordReset.js';
import EmailService from './emailService.js';
import HashSenha from '../utils/hashSenha.js';
import UserValidationSchema from '../validadores/userValidator.js';
import { APIErro } from "../utils/ApiError.js";

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
    
    // Salvar token no banco
    await PasswordReset.create({
      email,
      token: resetToken,
      expiresAt,
      used: false
    });
    
    // Enviar email
    await EmailService.sendPasswordResetEmail(email, resetToken);
    
    console.log(`Token de reset gerado para ${email}: ${resetToken}`);
  }

  static async resetPassword(token, newPassword) {
    // Buscar token válido
    const resetRecord = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      throw new APIErro(400, [{
        path: "token",
        message: "Token inválido ou expirado"
      }]);
    }

    // Validar nova senha
    try {
      const { password } = UserValidationSchema.registerSchema.pick({ password: true }).parse({ password: newPassword });
      
      // Buscar usuário
      const user = await UserRepository.findByEmail(resetRecord.email);
      if (!user) {
        throw new APIErro(400, [{
          path: "email",
          message: "Usuário não encontrado"
        }]);
      }

      // Hash da nova senha
      const hashedPassword = await HashSenha.criarHashSenha(password);
      
      // Atualizar senha do usuário
      await UserRepository.update(user._id, { password: hashedPassword });
      
      // Marcar token como usado
      await PasswordReset.findByIdAndUpdate(resetRecord._id, { used: true });
      
      console.log(`Senha redefinida com sucesso para: ${resetRecord.email}`);
      
    } catch (validationError) {
      if (validationError.issues) {
        throw new APIErro(400, validationError.issues.map(issue => ({
          path: issue.path[0],
          message: issue.message
        })));
      }
      throw validationError;
    }
  }
}

export default PasswordResetService;