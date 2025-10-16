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

  /**
   * RF22 - Cancelar assinatura do usuário
   * Permite que o usuário cancele sua assinatura paga, voltando para o plano gratuito
   */
  static async cancelSubscription(req, res) {
    try {
      const userId = req.user.id;
      
      // Buscar usuário atual
      const user = await UserRepository.findById(userId);
      if (!user) {
        return sendError(res, 404, [
          { path: "user", message: "Usuário não encontrado" }
        ]);
      }

      // Verificar se o usuário tem uma assinatura para cancelar
      if (user.plan.type === 'free') {
        return sendError(res, 400, [
          { path: "plan", message: "Você já está no plano gratuito. Não há assinatura para cancelar." }
        ]);
      }

      // REGRA DE NEGÓCIO: Apenas usuários mensais podem cancelar
      // Usuários com plano vitalício não podem cancelar (pagaram para vida toda)
      if (user.plan.type === 'lifetime') {
        return sendError(res, 400, [
          { path: "plan", message: "Planos vitalícios não podem ser cancelados. Você pagou pelo acesso permanente e ele é válido para sempre." }
        ]);
      }

      // Verificar se é um plano mensal válido
      if (user.plan.type !== 'monthly') {
        return sendError(res, 400, [
          { path: "plan", message: "Apenas assinaturas mensais podem ser canceladas." }
        ]);
      }

      // Preparar dados do plano anterior para log
      const previousPlan = {
        type: user.plan.type,
        startDate: user.plan.startDate,
        endDate: user.plan.endDate
      };

      // Cancelar assinatura - voltar para plano free
      const canceledPlan = {
        type: 'free',
        startDate: new Date(), // Nova data de início do plano gratuito
        endDate: null, // Plano gratuito não expira
        downloadsUsed: 0, // Reset dos downloads
        monthlyDownloadsReset: new Date() // Próximo reset
      };

      // Atualizar usuário
      const updatedUser = await UserRepository.update(userId, {
        plan: canceledPlan
      });

      return sendResponse(res, 200, {
        message: "Assinatura mensal cancelada com sucesso. Você agora está no plano gratuito.",
        data: {
          user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            plan: {
              type: updatedUser.plan.type,
              startDate: updatedUser.plan.startDate,
              features: {
                monthlyDownloads: 10,
                showAds: true,
                simultaneousDevices: 1,
                hdQuality: false,
                offlineDownload: false
              }
            }
          },
          canceledPlan: {
            type: previousPlan.type,
            wasActive: previousPlan.startDate,
            canceledAt: new Date()
          }
        }
      });

    } catch (error) {
      if (error instanceof APIError) {
        const { statusCode, errors } = error.toJson();
        return sendError(res, statusCode, ...errors);
      }

      console.log("Erro no cancelamento de assinatura:", error);
      return sendError(res, 500, [
        { path: "server", message: "Erro interno ao cancelar assinatura" }
      ]);
    }
  }
}

export default UserController;
