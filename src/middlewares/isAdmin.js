import { APIErro } from "../utils/ApiError.js";
import { sendError, sendResponse } from "../utils/messages.js";

/**
 * Middleware para verificar se o usuário logado é um administrador
 * Deve ser usado após o middleware de autenticação (isAuth)
 */
const isAdmin = (req, res, next) => {
  try {
    // Verificar se o usuário está autenticado (deve vir do middleware isAuth)
    if (!req.user) {
      return sendError(res, 401, [
        {
          path: 'user',
          message: 'Usuário não autenticado',
        }
      ]);
    }

    // Verificar se o usuário tem role de admin
    if (req.user.role !== 'admin') {
      return sendError(res, 403, [
        {
          path: 'role',
          message: 'Acesso negado. Apenas administradores podem acessar este recurso.',
        }
      ]);
    }

    // Se chegou até aqui, o usuário é admin
    next();
  } catch (error) {
    return sendError(res, 500, [
      {
        path: 'server',
        message: 'Erro interno na verificação de permissões',
      }
    ]);
  }
};

export default isAdmin;
