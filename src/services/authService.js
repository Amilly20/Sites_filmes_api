import UserRepository from '../repositories/userRepository.js'
import Jwt from "jsonwebtoken";
import HashSenha from '../utils/hashSenha.js';
import AutenticacaoSchema from '../validadores/authValidator.js';
import { APIError } from "../utils/ApiError.js";

class AuthService {
    static login = async (data) => {

        const { email, senha } = AutenticacaoSchema.loginSchema.parse(data)
        const user = await UserRepository.findByEmail(email)

        if (!user) {
            throw new APIError(400, [{
                path: "email",
                message: "Usuário não existe por favor corrija o email ou crie uma nova conta"
            }])
        }

        const response = await HashSenha.compararSenha(senha, user.password)
        if (!response) {
            throw new APIError(400, [{
                path: "senha",
                message: "Senha incorreta por favor corrija a senha"
            }])
        }

        const token = Jwt.sign({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'user'
        }, process.env.JWT_SECRET, { expiresIn: '24h'})

        return{
            token: token,
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role:  user.role || 'user',
        }
    }
}

export default AuthService
