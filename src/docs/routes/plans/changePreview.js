/**
 * 🔄 Documentação Swagger - Preview de Mudanças
 */

const changePreview = {
  "/plans/change-preview": {
    "get": {
      "summary": "Preview das mudanças de plano",
      "description": "Mostra uma prévia das mudanças que ocorrerão ao trocar de plano, incluindo benefícios ganhos ou limitações impostas.",
      "tags": ["💎 Planos"],
      "security": [{"bearerAuth": []}],
      "parameters": [
        {
          "name": "targetPlan",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "enum": ["free", "monthly", "lifetime"]
          },
          "description": "Plano de destino para preview"
        }
      ],
      "responses": {
        "200": {
          "description": "Preview carregado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ChangePreviewResponse"
              }
            }
          }
        },
        "400": {
          "description": "Parâmetros inválidos",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ValidationError"
              }
            }
          }
        },
        "401": {
          "description": "Token de autenticação inválido",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UnauthorizedError"
              }
            }
          }
        },
        "404": {
          "description": "Usuário não encontrado",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              }
            }
          }
        },
        "500": {
          "description": "Erro interno do servidor",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              }
            }
          }
        }
      }
    }
  }
};

export default changePreview;