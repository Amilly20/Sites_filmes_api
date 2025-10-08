/**
 * 🔄 Schemas Swagger - Upgrade/Downgrade de Planos
 */

const planUpgradeSchemas = {
  // Resposta de Upgrade
  UpgradeResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      operation: {
        type: "string",
        example: "upgrade"
      },
      previousPlan: {
        type: "object",
        properties: {
          type: { type: "string", example: "free" },
          displayName: { type: "string", example: "Gratuito" }
        }
      },
      newPlan: {
        type: "object",
        properties: {
          type: { type: "string", example: "monthly" },
          displayName: { type: "string", example: "Mensal" }
        }
      },
      benefits: {
        type: "array",
        items: { type: "string" },
        example: [
          "Remoção de anúncios",
          "Aumento de downloads mensais: 10 → 100",
          "Qualidade HD",
          "Mais dispositivos simultâneos: 1 → 2"
        ]
      },
      effectiveDate: {
        type: "string",
        format: "date-time",
        example: "2025-09-29T15:30:00.000Z"
      },
      user: {
        $ref: "#/components/schemas/UserPlan"
      },
      planDetails: {
        $ref: "#/components/schemas/PlanInfo"
      }
    }
  },

  // Resposta de Downgrade
  DowngradeResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      operation: {
        type: "string",
        example: "downgrade"
      },
      previousPlan: {
        type: "object",
        properties: {
          type: { type: "string", example: "monthly" },
          displayName: { type: "string", example: "Mensal" }
        }
      },
      newPlan: {
        type: "object",
        properties: {
          type: { type: "string", example: "free" },
          displayName: { type: "string", example: "Gratuito" }
        }
      },
      limitations: {
        type: "array",
        items: { type: "string" },
        example: [
          "Anúncios serão exibidos",
          "Redução de downloads mensais: 100 → 10",
          "Perda da qualidade HD",
          "Menos dispositivos simultâneos: 2 → 1"
        ]
      },
      warnings: {
        type: "array",
        items: { type: "string" },
        example: [
          "Você verá anúncios durante a reprodução",
          "Downloads em excesso serão bloqueados"
        ]
      },
      effectiveDate: {
        type: "string",
        format: "date-time",
        example: "2025-09-29T15:30:00.000Z"
      },
      user: {
        $ref: "#/components/schemas/UserPlan"
      },
      planDetails: {
        $ref: "#/components/schemas/PlanInfo"
      }
    }
  },

  // Resposta de Mudança Inteligente
  PlanChangeResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      operation: {
        type: "string",
        enum: ["upgrade", "downgrade"],
        example: "upgrade"
      },
      previousPlan: {
        type: "object",
        properties: {
          type: { type: "string", example: "free" },
          displayName: { type: "string", example: "Gratuito" }
        }
      },
      newPlan: {
        type: "object",
        properties: {
          type: { type: "string", example: "monthly" },
          displayName: { type: "string", example: "Mensal" }
        }
      },
      benefits: {
        type: "array",
        items: { type: "string" },
        description: "Benefícios (para upgrade)"
      },
      limitations: {
        type: "array",
        items: { type: "string" },
        description: "Limitações (para downgrade)"
      },
      warnings: {
        type: "array",
        items: { type: "string" },
        description: "Avisos (para downgrade)"
      },
      effectiveDate: {
        type: "string",
        format: "date-time"
      },
      user: {
        $ref: "#/components/schemas/UserPlan"
      },
      planDetails: {
        $ref: "#/components/schemas/PlanInfo"
      }
    }
  },

  // Opções de Upgrade/Downgrade
  UpgradeOptionsResponse: {
    type: "object",
    properties: {
      currentPlan: {
        type: "object",
        properties: {
          type: { type: "string", example: "free" },
          config: { $ref: "#/components/schemas/PlanInfo" }
        }
      },
      options: {
        type: "array",
        items: {
          type: "object",
          properties: {
            planType: {
              type: "string",
              example: "monthly"
            },
            planConfig: {
              $ref: "#/components/schemas/PlanInfo"
            },
            operationType: {
              type: "string",
              enum: ["upgrade", "downgrade"],
              example: "upgrade"
            },
            isAvailable: {
              type: "boolean",
              example: true
            },
            reason: {
              type: "string",
              example: "Upgrade válido"
            },
            benefits: {
              type: "array",
              items: { type: "string" },
              example: ["Remoção de anúncios", "Mais downloads"]
            },
            limitations: {
              type: "array",
              items: { type: "string" },
              example: []
            },
            warnings: {
              type: "array",
              items: { type: "string" },
              example: []
            }
          }
        }
      }
    }
  },

  // Preview de Mudanças
  ChangePreviewResponse: {
    type: "object",
    properties: {
      currentPlan: {
        type: "object",
        properties: {
          type: { type: "string", example: "free" },
          config: { $ref: "#/components/schemas/PlanInfo" }
        }
      },
      targetPlan: {
        type: "object",
        properties: {
          type: { type: "string", example: "monthly" },
          config: { $ref: "#/components/schemas/PlanInfo" }
        }
      },
      operationType: {
        type: "string",
        enum: ["upgrade", "downgrade"],
        example: "upgrade"
      },
      changes: {
        type: "object",
        properties: {
          benefits: {
            type: "array",
            items: { type: "string" },
            example: ["Remoção de anúncios", "Qualidade HD"]
          },
          limitations: {
            type: "array",
            items: { type: "string" },
            example: []
          },
          warnings: {
            type: "array",
            items: { type: "string" },
            example: []
          }
        }
      },
      isAvailable: {
        type: "boolean",
        example: true
      },
      reason: {
        type: "string",
        example: "Upgrade válido"
      }
    }
  }
};

export default planUpgradeSchemas;