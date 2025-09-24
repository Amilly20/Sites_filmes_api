const forgotPassword = {
  "/auth/forgot-password": {
    "post": {
      "summary": "Solicitar recuperação de senha",
      "description": "Envia um email com token para recuperação de senha (válido por 1 hora)",
      "tags": ["Autenticacao"],
      "security": [],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ForgotPasswordRequest"
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Email de recuperação enviado (se o email existir)",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ForgotPasswordResponse"
              }
            }
          }
        },
        "400": {
          "description": "Email não informado",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ForgotPasswordError"
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

const resetPassword = {
  "/auth/reset-password": {
    "post": {
      "summary": "Redefinir senha",
      "description": "Redefine a senha usando o token recebido por email",
      "tags": ["Autenticacao"],
      "security": [],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ResetPasswordRequest"
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Senha alterada com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ResetPasswordResponse"
              }
            }
          }
        },
        "400": {
          "description": "Token inválido/expirado ou senha inválida",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ResetPasswordError"
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

export { forgotPassword, resetPassword };