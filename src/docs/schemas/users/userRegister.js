const userRegisterSchemas = {
  UserRegisterRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: {
        type: "string",
        minLength: 2,
        pattern: "^[A-Za-zÀ-ÿ\\s]+$",
        example: "João Silva",
        description: "Nome deve conter apenas letras e espaços, sem números ou símbolos"
      },
      email: {
        type: "string",
        format: "email",
        example: "joao@gmail.com",
        description: "Email deve ser de um provedor válido (Gmail, Hotmail, Outlook, Yahoo, iCloud, Live, UOL, Bol, Terra, IG, Globo, R7)"
      },
      password: {
        type: "string",
        format: "password",
        minLength: 8,
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d\\s])\\S+$",
        example: "SenhaForte123!",
        description: "Mínimo 8 caracteres, deve conter: 1 letra minúscula, 1 maiúscula, 1 número, 1 caractere especial. Não deve conter espaços."
      }
    }
  },
  UserRegisterResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Usuário cadastrado com sucesso"
      },
      data: {
        type: "object",
        properties: {
          id: { type: "string", example: "507f1f77bcf86cd799439011" },
          name: { type: "string", example: "João Silva" },
          email: { type: "string", example: "joao@email.com" }
        }
      }
    }
  },
  UserRegisterError: {
    type: "object",
    properties: {
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: { type: "string", example: "email" },
            message: { type: "string", example: "Email já cadastrado" }
          }
        }
      }
    }
  }
};

export default userRegisterSchemas;
