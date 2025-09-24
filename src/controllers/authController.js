import AuthService from '../services/authService.js';
import { z } from 'zod';
import { APIErro } from "../utils/ApiError.js";
import { sendError, sendResponse } from "../utils/messages.js";

class Autenticacao {
    static login = async (req, res) => {
        try {
            const response = await AuthService.login(req.body)

            return sendResponse(res, 200, {
                data: response
            });
        } catch (error) {
            if (error instanceof APIErro) {
                const { code, errors } = error.toJson()
                return sendError(res, code, ...errors)
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

            console.log("Erro no login:", error); // Log temporário para debug
            return sendError(res, 500, [])
        }
    }
}

export default Autenticacao;