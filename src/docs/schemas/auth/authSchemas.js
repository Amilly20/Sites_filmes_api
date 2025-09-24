const authSchemas = {
  LoginRequest: {
    type: "object",
    required: ["email", "senha"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "usuario@email.com"
      },
      senha: {
        type: "string",
        format: "password",
        minLength: 8,
        example: "SenhaForte123!",
        description: "Deve conter pelo menos 8 caracteres, uma letra minúscula, uma maiúscula, um número e um símbolo"
      }
    }
  },
  
  // Schemas para recuperação de senha
  ForgotPasswordRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "usuario@gmail.com",
        description: "Email cadastrado no sistema"
      }
    }
  },
  
  ForgotPasswordResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Se o email existir, um link de recuperação foi enviado"
      }
    }
  },
  
  ForgotPasswordError: {
    type: "object",
    properties: {
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: { type: "string", example: "email" },
            message: { type: "string", example: "Email é obrigatório" }
          }
        }
      }
    }
  },
  
  ResetPasswordRequest: {
    type: "object",
    required: ["token", "newPassword"],
    properties: {
      token: {
        type: "string",
        example: "a1b2c3d4e5f6...",
        description: "Token recebido por email (válido por 1 hora)"
      },
      newPassword: {
        type: "string",
        format: "password",
        minLength: 8,
        example: "NovaSenha123!",
        description: "Nova senha (mínimo 8 caracteres, 1 minúscula, 1 maiúscula, 1 número, 1 símbolo, sem espaços)"
      }
    }
  },
  
  ResetPasswordResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Senha alterada com sucesso"
      }
    }
  },
  
  ResetPasswordError: {
    type: "object",
    properties: {
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: { type: "string", example: "token" },
            message: { type: "string", example: "Token inválido ou expirado" }
          }
        }
      }
    }
  },
  LoginResponse: {
    type: "object",
    properties: {
      data: {
        type: "object",
        properties: {
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          },
          id: {
            type: "string",
            example: "507f1f77bcf86cd799439011"
          },
          name: {
            type: "string",
            example: "João Silva"
          },
          email: {
            type: "string",
            example: "joao@email.com"
          },
          role: {
            type: "string",
            example: "user",
            enum: ["user", "admin"]
          }
        }
      }
    }
  },
  LoginError: {
    type: "object",
    properties: {
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: {
              type: "string",
              example: "email"
            },
            message: {
              type: "string",
              example: "Usuário não existe por favor corrija o email ou crie uma nova conta"
            }
          }
        }
      }
    }
  }
};

export default authSchemas;