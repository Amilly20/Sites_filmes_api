import AuthService from '../services/authService.js';
import { z } from 'zod';
import { APIErro } from "../utils/ApiError.js";
import { sendError, sendResponse } from "../utils/messages.js";
import PasswordResetService from '../services/passwordResetService.js';

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

    static forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            
            if (!email) {
                return sendError(res, 400, [
                    { path: "email", message: "Email é obrigatório" }
                ]);
            }

            await PasswordResetService.requestPasswordReset(email);
            
            return sendResponse(res, 200, {
                message: "Se o email existir, um link de recuperação foi enviado"
            });
        } catch (error) {
            if (error instanceof APIErro) {
                const { code, errors } = error.toJson();
                return sendError(res, code, ...errors);
            }
            console.log("Erro no esqueci senha:", error);
            return sendError(res, 500, [{ path: "server", message: "Erro interno do servidor" }]);
        }
    }

    static resetPassword = async (req, res) => {
        try {
            const { token, newPassword } = req.body;
            
            if (!token || !newPassword) {
                return sendError(res, 400, [
                    { path: "token", message: "Token é obrigatório" },
                    { path: "newPassword", message: "Nova senha é obrigatória" }
                ]);
            }

            await PasswordResetService.resetPassword(token, newPassword);
            
            return sendResponse(res, 200, {
                message: "Senha alterada com sucesso"
            });
        } catch (error) {
            if (error instanceof APIErro) {
                const { code, errors } = error.toJson();
                return sendError(res, code, ...errors);
            }
            console.log("Erro no reset senha:", error);
            return sendError(res, 500, [{ path: "server", message: "Erro interno do servidor" }]);
        }
    }
}

export default Autenticacao;