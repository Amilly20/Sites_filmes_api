/**
 * 🔄 Documentação Swagger - Mudança Inteligente de Planos
 */

const planChangeIntelligent = {
  "/plans/change-intelligent": {
    "put": {
      "summary": "Mudança inteligente de plano",
      "description": "Detecta automaticamente se a mudança é um upgrade ou downgrade e processa adequadamente. Recomendado para interfaces simplificadas.",
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
                  "enum": ["free", "monthly", "lifetime"],
                  "description": "Plano de destino"
                }
              },
              "required": ["targetPlan"],
              "example": {
                "targetPlan": "monthly"
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Mudança de plano realizada com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PlanChangeResponse"
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos ou mudança não permitida",
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

export default planChangeIntelligent;