/**
 * 🔄 Documentação Swagger - Upgrade de Planos
 */

const planUpgrade = {
  "/plans/upgrade": {
    "post": {
      "summary": "Fazer upgrade do plano atual",
      "description": "Permite ao usuário fazer upgrade do seu plano atual para um plano superior (monthly ou lifetime).",
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
                  "enum": ["monthly", "lifetime"],
                  "description": "Plano de destino para upgrade"
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
          "description": "Upgrade realizado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpgradeResponse"
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos ou upgrade não permitido",
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

export default planUpgrade;
