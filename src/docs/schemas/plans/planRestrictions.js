/**
 * 🚫 Schemas para Restrições de Planos
 */

const planRestrictionsSchemas = {
  PlanRestrictions: {
    type: "object",
    properties: {
      planType: {
        type: "string",
        enum: ["free", "monthly", "lifetime"],
        example: "free"
      },
      planName: {
        type: "string",
        example: "Gratuito"
      },
      planPrice: {
        type: "object",
        properties: {
          value: {
            type: "number",
            example: 0
          },
          currency: {
            type: "string",
            example: "BRL"
          }
        }
      },
      downloadRestrictions: {
        type: "object",
        properties: {
          monthlyLimit: {
            type: "number",
            example: 10
          },
          isUnlimited: {
            type: "boolean",
            example: false
          },
          warningMessage: {
            type: "string",
            example: "MUITO RESTRITIVO: Ideal apenas para uso esporádico"
          },
          restrictionLevel: {
            type: "string",
            enum: ["none", "low", "medium", "high"],
            example: "high"
          }
        }
      },
      advertisingRestrictions: {
        type: "object",
        properties: {
          hasAds: {
            type: "boolean",
            example: true
          },
          adFrequency: {
            type: "string",
            example: "A cada 15 minutos"
          },
          experienceImpact: {
            type: "string",
            example: "IMPACTO ALTO: Interrupções frequentes prejudicam a experiência"
          },
          canSkip: {
            type: "boolean",
            example: false
          }
        }
      },
      qualityRestrictions: {
        type: "object",
        properties: {
          maxQuality: {
            type: "string",
            example: "720p"
          },
          availableQualities: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["480p", "720p"]
          },
          limitationSeverity: {
            type: "string",
            example: "IMPACTO MÉDIO: Qualidade limitada mas aceitável"
          }
        }
      },
      deviceRestrictions: {
        type: "object",
        properties: {
          simultaneousDevices: {
            type: "number",
            example: 1
          },
          maxDevicesRegistered: {
            type: "number",
            example: 3
          },
          supportedPlatforms: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["web", "mobile"]
          }
        }
      },
      supportRestrictions: {
        type: "object",
        properties: {
          level: {
            type: "string",
            enum: ["none", "basic", "standard", "premium"],
            example: "basic"
          },
          responseTime: {
            type: "string",
            example: "48h úteis"
          },
          channels: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["email"]
          }
        }
      },
      contentRestrictions: {
        type: "object",
        properties: {
          excludedCategories: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["premium_movies", "exclusive_series"]
          },
          accessPercentage: {
            type: "number",
            example: 60
          },
          restrictionDetails: {
            type: "string",
            example: "Acesso limitado a 60% do catálogo"
          }
        }
      },
      offlineRestrictions: {
        type: "object",
        properties: {
          allowOfflineAccess: {
            type: "boolean",
            example: false
          },
          maxOfflineItems: {
            type: "number",
            example: 0
          },
          offlineDuration: {
            type: "string",
            example: "Não disponível"
          }
        }
      },
      criticalLimitations: {
        type: "array",
        items: {
          type: "string"
        },
        example: [
          "🚫 Anúncios obrigatórios durante a reprodução",
          "🚫 Apenas 10 downloads por mês",
          "🚫 Qualidade limitada a 720p",
          "🚫 Suporte apenas por email"
        ]
      },
      benefitsComparedToPrevious: {
        type: "array",
        items: {
          type: "string"
        },
        example: [
          "✅ Acesso ao catálogo básico",
          "✅ Streaming em qualidade HD"
        ]
      },
      upgradeRecommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            targetPlan: {
              type: "string"
            },
            reason: {
              type: "string"
            },
            keyBenefits: {
              type: "array",
              items: {
                type: "string"
              }
            }
          }
        },
        example: [
          {
            "targetPlan": "monthly",
            "reason": "Para experiência sem anúncios",
            "keyBenefits": ["Sem interrupções", "Mais downloads", "Melhor qualidade"]
          }
        ]
      }
    }
  },

  PlanComparisonResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Comparação de restrições gerada com sucesso"
      },
      data: {
        type: "object",
        properties: {
          comparison: {
            type: "object",
            properties: {
              plans: {
                type: "array",
                items: {
                  "$ref": "#/components/schemas/PlanRestrictions"
                }
              },
              comparisonMatrix: {
                type: "object",
                properties: {
                  downloads: {
                    type: "object",
                    additionalProperties: {
                      oneOf: [
                        {
                          type: "number"
                        },
                        {
                          type: "string"
                        }
                      ]
                    }
                  },
                  ads: {
                    type: "object",
                    additionalProperties: {
                      type: "string"
                    }
                  },
                  quality: {
                    type: "object",
                    additionalProperties: {
                      type: "string"
                    }
                  },
                  devices: {
                    type: "object",
                    additionalProperties: {
                      type: "number"
                    }
                  },
                  support: {
                    type: "object",
                    additionalProperties: {
                      type: "string"
                    }
                  }
                }
              },
              recommendationsByUsage: {
                type: "object",
                properties: {
                  uso_esporadico: {
                    type: "string",
                    example: "free"
                  },
                  uso_regular: {
                    type: "string",
                    example: "monthly"
                  },
                  uso_intensivo: {
                    type: "string",
                    example: "lifetime"
                  },
                  uso_familiar: {
                    type: "string",
                    example: "lifetime"
                  }
                }
              },
              summary: {
                type: "object",
                properties: {
                  mostRestrictive: {
                    type: "string"
                  },
                  leastRestrictive: {
                    type: "string"
                  },
                  bestValue: {
                    type: "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  RestrictionWarning: {
    type: "object",
    properties: {
      type: {
        type: "string",
        example: "advertisements"
      },
      severity: {
        type: "string",
        enum: ["critical", "important", "informational"],
        example: "critical"
      },
      message: {
        type: "string",
        example: "📺 ATENÇÃO: Este plano inclui anúncios obrigatórios"
      },
      impact: {
        type: "string",
        example: "Sua experiência será interrompida por publicidade"
      },
      recommendation: {
        type: "string",
        example: "Considere upgrade para plano sem anúncios"
      }
    }
  },

  PurchaseWarningsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "object",
        properties: {
          warnings: {
            type: "object",
            properties: {
              critical: {
                type: "array",
                items: {
                  "$ref": "#/components/schemas/RestrictionWarning"
                }
              },
              important: {
                type: "array",
                items: {
                  "$ref": "#/components/schemas/RestrictionWarning"
                }
              },
              informational: {
                type: "array",
                items: {
                  "$ref": "#/components/schemas/RestrictionWarning"
                }
              }
            }
          },
          riskLevel: {
            type: "string",
            enum: ["minimal", "low", "medium", "high"],
            example: "high"
          },
          recommendProceed: {
            type: "boolean",
            example: false
          },
          alternativeSuggestions: {
            type: "array",
            items: {
              type: "string"
            },
            example: [
              "Considere o plano Monthly para experiência sem anúncios",
              "Teste gratuito disponível para avaliar restrições"
            ]
          },
          userSpecificAnalysis: {
            type: "object",
            properties: {
              compatibilityScore: {
                type: "number",
                minimum: 0,
                maximum: 1,
                example: 0.3
              },
              personalizedWarnings: {
                type: "array",
                items: {
                  type: "string"
                }
              }
            }
          }
        }
      }
    }
  },

  PersonalizedRecommendationResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "object",
        properties: {
          recommendation: {
            type: "object",
            properties: {
              recommendedPlan: {
                type: "string",
                example: "monthly"
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 1,
                example: 0.85
              },
              matchReasons: {
                type: "array",
                items: {
                  type: "string"
                },
                example: [
                  "Orçamento compatível com plano monthly",
                  "Uso regular se beneficia de downloads ilimitados",
                  "Prioridade por experiência sem anúncios atendida"
                ]
              },
              keyBenefits: {
                type: "array",
                items: {
                  type: "string"
                },
                example: [
                  "✅ Sem anúncios durante reprodução",
                  "✅ 100 downloads por mês",
                  "✅ Qualidade HD disponível",
                  "✅ Suporte prioritário"
                ]
              },
              potentialLimitations: {
                type: "array",
                items: {
                  type: "string"
                },
                example: [
                  "⚠️ Limite de 3 dispositivos simultâneos",
                  "⚠️ Renovação mensal necessária"
                ]
              },
              alternatives: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    plan: {
                      type: "string"
                    },
                    reason: {
                      type: "string"
                    },
                    confidence: {
                      type: "number"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  RestrictionStatsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "object",
        properties: {
          stats: {
            type: "object",
            properties: {
              totalPlans: {
                type: "number",
                example: 3
              },
              mostRestrictive: {
                type: "object",
                properties: {
                  plan: {
                    type: "string",
                    example: "free"
                  },
                  restrictionCount: {
                    type: "number",
                    example: 7
                  },
                  severity: {
                    type: "string",
                    example: "high"
                  }
                }
              },
              leastRestrictive: {
                type: "object",
                properties: {
                  plan: {
                    type: "string",
                    example: "lifetime"
                  },
                  restrictionCount: {
                    type: "number",
                    example: 0
                  },
                  severity: {
                    type: "string",
                    example: "none"
                  }
                }
              },
              commonRestrictions: {
                type: "array",
                items: {
                  type: "string"
                },
                example: ["device_limit", "support_level"]
              },
              categoryBreakdown: {
                type: "object",
                properties: {
                  download: {
                    type: "number",
                    example: 2
                  },
                  advertising: {
                    type: "number",
                    example: 1
                  },
                  quality: {
                    type: "number",
                    example: 2
                  },
                  device: {
                    type: "number",
                    example: 3
                  },
                  support: {
                    type: "number",
                    example: 3
                  },
                  content: {
                    type: "number",
                    example: 2
                  },
                  offline: {
                    type: "number",
                    example: 2
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export default planRestrictionsSchemas;
