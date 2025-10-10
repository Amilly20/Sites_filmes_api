import UserRepository from "../repositories/userRepository.js";
import { APIError } from "../utils/ApiError.js";
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
      
      // Configurar plano gratuito inicial
      const freePlan = {
        type: 'free',
        startDate: new Date(),
        endDate: null, // Plano gratuito não expira
        downloadsUsed: 0,
        monthlyDownloadsReset: new Date() // Próximo reset será no primeiro dia do próximo mês
      };
      
      // Cria usuário com plano gratuito
      const user = await UserRepository.create({ 
        name, 
        email, 
        password: hashedPassword,
        plan: freePlan,
        devices: [],
        history: [],
        downloads: []
      });
      
      return sendResponse(res, 201, {
        message: "Usuário cadastrado com sucesso! Você recebeu um plano gratuito para começar a explorar nossa plataforma.",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: {
            type: user.plan.type,
            features: "10 downloads/mês, anúncios, 1 dispositivo"
          }
        }
      });
    } catch (error) {
      if (error instanceof APIError) {
        const { statusCode, errors } = error.toJson();
        return sendError(res, statusCode, ...errors);
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
