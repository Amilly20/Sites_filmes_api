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