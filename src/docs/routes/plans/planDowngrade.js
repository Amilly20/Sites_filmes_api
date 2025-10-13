/**
 * 🔄 Documentação Swagger - Downgrade de Planos
 */

const planDowngrade = {
  "/plans/downgrade": {
    "post": {
      "summary": "Fazer downgrade do plano atual",
      "description": "Permite ao usuário fazer downgrade do seu plano atual para um plano inferior. Requer confirmação explícita devido às limitações.",
      "tags": ["💎 Planos"],
      "security": [{"bearerAuth": []}],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "targetPlan": {
                  "type": "string",
                  "enum": ["free", "monthly"],
                  "description": "Plano de destino para downgrade"
                },
                "confirmDowngrade": {
                  "type": "boolean",
                  "description": "Confirmação obrigatória do downgrade (deve ser true)"
                }
              },
              "required": ["targetPlan", "confirmDowngrade"],
              "example": {
                "targetPlan": "free",
                "confirmDowngrade": true
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Downgrade realizado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DowngradeResponse"
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos ou downgrade não permitido",
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

export default planDowngrade;
