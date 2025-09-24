const authLogin = {
  "/auth/login": {
    "post": {
      "summary": "Realizar login de usuário",
      "description": "Autentica um usuário e retorna um token JWT válido por 5 dias.",
      "tags": ["Autenticacao"],
      "security": [], // Esta rota não precisa de autenticação
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/LoginRequest"
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Login realizado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginResponse"
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos ou usuário não encontrado",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginError"
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

export default authLogin;