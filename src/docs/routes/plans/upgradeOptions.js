/**
 * 🔄 Documentação Swagger - Opções de Upgrade
 */

const upgradeOptions = {
  "/plans/upgrade-options": {
    "get": {
      "summary": "Obter opções de upgrade/downgrade disponíveis",
      "description": "Lista todas as opções de mudança de plano disponíveis para o usuário atual, incluindo benefícios, limitações e avisos.",
      "tags": ["💎 Planos"],
      "security": [{"bearerAuth": []}],
      "responses": {
        "200": {
          "description": "Opções carregadas com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpgradeOptionsResponse"
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

export default upgradeOptions;