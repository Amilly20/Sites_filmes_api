import UserRepository from "../repositories/userRepository.js";
import { APIErro } from "../utils/ApiError.js";
import { sendError, sendResponse } from "../utils/messages.js";
import UserValidationSchema from "../validadores/userValidator.js";
import { z } from 'zod';
import HashSenha from '../utils/hashSenha.js';

class UserController {
  static async register(req, res) {
    try {
      // Validar dados com Zod
      const { name, email, password } = UserValidationSchema.registerSchema.parse(req.body);
      
      // Verifica se já existe usuário com o email
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return sendError(res, 400, [
          { path: "email", message: "Email já cadastrado" }
        ]);
      }
      
      // Hash da senha antes de salvar
      const hashedPassword = await HashSenha.criarHashSenha(password);
      
      // Cria usuário
      const user = await UserRepository.create({ name, email, password: hashedPassword });
      
      return sendResponse(res, 201, {
        message: "Usuário cadastrado com sucesso",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      });
    } catch (error) {
      if (error instanceof APIErro) {
        const { code, errors } = error.toJson();
        return sendError(res, code, ...errors);
      }

      if (error instanceof z.ZodError) {
        let errors = []
        error.issues.map((issue) => (
          errors.push({
            path: issue.path[0],
            message: issue.message
          })))
        return sendError(res, 400, errors)
      }

      console.log("Erro no cadastro:", error); // Log temporário para debug
      return sendError(res, 500, [{ path: "server", message: "Erro interno ao cadastrar usuário" }]);
    }
  }
}

export default UserController;
