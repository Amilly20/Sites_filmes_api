import Jwt from "jsonwebtoken"
import { sendError, sendResponse } from "../utils/messages.js";

const authentication = (req, res, next) => {
  const authHeaders = req.headers.authorization
  if (!authHeaders || !authHeaders.startsWith('Bearer ')) {
    return sendError(res, 401,[
      {
        path: 'token',
        message: 'Token não informado. Por favor, faça login.',
      }
    ]);
  } else {
    const token = authHeaders.split(' ')[1]
    try {
      const decoded = Jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded; // Adiciona os dados do usuário ao request
      next();
    } catch (error) {
      return sendError(res, 401,[
        {
          path: 'token',
          message: 'Token informado não é válido. Por favor, faça login.',
        }
      ]);
    }
  }
}

export default authentication;
