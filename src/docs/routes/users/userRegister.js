const usuarioCadastrar = {
  "/users/register": {
    "post": {
      "summary": "Cadastrar novo usuário",
      "description": "Registra um novo usuário no sistema.",
      "tags": ["👤 Usuários"],
      "security": [], // Não precisa autenticação
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/UserRegisterRequest"
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Usuário cadastrado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UserRegisterResponse"
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos ou usuário já existe",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UserRegisterError"
              }
            }
          }
        },
        "500": {
          "description": "Erro interno do servidor"
        }
      }
    }
  }
};

export default usuarioCadastrar;
