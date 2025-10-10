/**
 * 🚫 Documentação Swagger - Restrições de Planos
 */

const planRestrictions = {
  "/plans/restrictions/compare": {
    "get": {
      "summary": "📊 Comparar restrições entre planos",
      "description": "Compara limitações e restrições entre todos os planos disponíveis ou planos específicos para auxiliar na decisão de compra",
      "tags": ["🚫 Restrições de Planos"],
      "parameters": [
        {
          "in": "query",
          "name": "plans",
          "schema": {
            "type": "string",
            "example": "free,monthly,lifetime"
          },
          "description": "Lista de planos para comparar (separados por vírgula). Mínimo 2 planos."
        }
      ],
      "responses": {
        "200": {
          "description": "Comparação de restrições gerada com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Comparação de restrições gerada com sucesso"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "comparison": {
                        "type": "object",
                        "properties": {
                          "plans": {
                            "type": "array",
                            "items": {
                              "$ref": "#/components/schemas/PlanRestrictions"
                            }
                          },
                          "comparisonMatrix": {
                            "type": "object",
                            "example": {
                              "downloads": {
                                "free": 10,
                                "monthly": 100,
                                "lifetime": "Ilimitado"
                              },
                              "ads": {
                                "free": "Com anúncios",
                                "monthly": "Sem anúncios",
                                "lifetime": "Sem anúncios"
                              }
                            }
                          },
                          "recommendationsByUsage": {
                            "type": "object",
                            "example": {
                              "uso_esporadico": "free",
                              "uso_regular": "monthly",
                              "uso_intensivo": "lifetime"
                            }
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
        "400": {
          "description": "Parâmetros inválidos para comparação",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ValidationError"
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
  },
  
  "/plans/restrictions/stats": {
    "get": {
      "summary": "📊 Estatísticas de restrições",
      "description": "Obtém estatísticas gerais sobre restrições de todos os planos disponíveis",
      "tags": ["🚫 Restrições de Planos"],
      "parameters": [
        {
          "in": "query",
          "name": "includeDetails",
          "schema": {
            "type": "boolean",
            "default": false
          },
          "description": "Incluir detalhes das restrições nas estatísticas"
        },
        {
          "in": "query",
          "name": "category",
          "schema": {
            "type": "string",
            "enum": ["download", "advertising", "quality", "device", "support", "content", "offline"]
          },
          "description": "Filtrar estatísticas por categoria específica"
        }
      ],
      "responses": {
        "200": {
          "description": "Estatísticas calculadas com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "stats": {
                        "type": "object",
                        "properties": {
                          "totalPlans": {
                            "type": "number",
                            "example": 3
                          },
                          "mostRestrictive": {
                            "type": "array",
                            "items": {
                              "oneOf": [
                                {
                                  "type": "string"
                                },
                                {
                                  "type": "object"
                                }
                              ]
                            },
                            "example": ["free", {"restrictionCount": 4}]
                          },
                          "leastRestrictive": {
                            "type": "array",
                            "items": {
                              "oneOf": [
                                {
                                  "type": "string"
                                },
                                {
                                  "type": "object"
                                }
                              ]
                            },
                            "example": ["lifetime", {"restrictionCount": 0}]
                          },
                          "commonRestrictions": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            },
                            "example": ["device_limit", "support_level"]
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
        "400": {
          "description": "Parâmetros de filtro inválidos",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ValidationError"
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
  },
  
  "/plans/restrictions/recommendation": {
    "get": {
      "summary": "🎯 Recomendação personalizada",
      "description": "Gera recomendação de plano baseada no perfil e necessidades específicas do usuário",
      "tags": ["🚫 Restrições de Planos"],
      "security": [{"bearerAuth": []}],
      "parameters": [
        {
          "in": "query",
          "name": "usage",
          "schema": {
            "type": "string",
            "enum": ["uso_esporadico", "uso_regular", "uso_intensivo", "uso_familiar"],
            "default": "uso_regular"
          },
          "description": "Padrão de uso esperado pelo usuário"
        },
        {
          "in": "query",
          "name": "budget",
          "schema": {
            "type": "string",
            "enum": ["low", "medium", "high"],
            "default": "medium"
          },
          "description": "Faixa de orçamento disponível"
        },
        {
          "in": "query",
          "name": "priorities",
          "schema": {
            "type": "string",
            "example": "no_ads,quality,unlimited_downloads"
          },
          "description": "Prioridades do usuário separadas por vírgula (máx. 5)"
        },
        {
          "in": "query",
          "name": "currentPlan",
          "schema": {
            "type": "string",
            "enum": ["free", "monthly", "lifetime"]
          },
          "description": "Plano atual do usuário (para recomendações de upgrade)"
        }
      ],
      "responses": {
        "200": {
          "description": "Recomendação personalizada gerada com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "recommendation": {
                        "type": "object",
                        "properties": {
                          "recommendedPlan": {
                            "type": "string",
                            "example": "monthly"
                          },
                          "confidence": {
                            "type": "number",
                            "minimum": 0,
                            "maximum": 1,
                            "example": 0.85
                          },
                          "matchReasons": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            },
                            "example": [
                              "Orçamento compatível com plano monthly",
                              "Uso regular se beneficia de downloads ilimitados"
                            ]
                          },
                          "keyBenefits": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            },
                            "example": [
                              "Sem anúncios durante reprodução",
                              "100 downloads por mês",
                              "Qualidade HD disponível"
                            ]
                          },
                          "potentialLimitations": {
                            "type": "array",
                            "items": {
                              "type": "string"
                            },
                            "example": [
                              "Limite de 3 dispositivos simultâneos"
                            ]
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
        "400": {
          "description": "Parâmetros de perfil inválidos",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ValidationError"
              }
            }
          }
        },
        "401": {
          "description": "Token de autenticação necessário",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UnauthorizedError"
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
  },
  
  "/plans/restrictions/{planType}": {
    "get": {
      "summary": "📋 Restrições detalhadas do plano",
      "description": "Obtém todas as restrições e limitações detalhadas de um plano específico antes da compra",
      "tags": ["🚫 Restrições de Planos"],
      "parameters": [
        {
          "in": "path",
          "name": "planType",
          "required": true,
          "schema": {
            "type": "string",
            "enum": ["free", "monthly", "lifetime"]
          },
          "description": "Tipo do plano para obter restrições"
        }
      ],
      "responses": {
        "200": {
          "description": "Restrições do plano carregadas com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Restrições do plano Gratuito carregadas com sucesso"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "restrictions": {
                        "$ref": "#/components/schemas/PlanRestrictions"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Tipo de plano inválido",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ValidationError"
              }
            }
          }
        },
        "404": {
          "description": "Plano não encontrado",
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
  },
  
  "/plans/restrictions/{planType}/warnings": {
    "get": {
      "summary": "⚠️ Avisos antes da compra",
      "description": "Obtém avisos críticos e importantes sobre limitações antes de comprar um plano específico",
      "tags": ["🚫 Restrições de Planos"],
      "security": [{"bearerAuth": []}],
      "parameters": [
        {
          "in": "path",
          "name": "planType",
          "required": true,
          "schema": {
            "type": "string",
            "enum": ["free", "monthly", "lifetime"]
          },
          "description": "Tipo do plano para análise de avisos"
        },
        {
          "in": "query",
          "name": "userProfile",
          "schema": {
            "type": "string"
          },
          "description": "Perfil do usuário em JSON para análise personalizada"
        }
      ],
      "responses": {
        "200": {
          "description": "Avisos de compra gerados com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "warnings": {
                        "type": "object",
                        "properties": {
                          "critical": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string",
                                  "example": "advertisements"
                                },
                                "message": {
                                  "type": "string",
                                  "example": "📺 ATENÇÃO: Este plano inclui anúncios obrigatórios"
                                },
                                "impact": {
                                  "type": "string",
                                  "example": "Sua experiência será interrompida por publicidade"
                                }
                              }
                            }
                          },
                          "important": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string"
                                },
                                "message": {
                                  "type": "string"
                                },
                                "impact": {
                                  "type": "string"
                                }
                              }
                            }
                          },
                          "informational": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "type": {
                                  "type": "string"
                                },
                                "message": {
                                  "type": "string"
                                },
                                "impact": {
                                  "type": "string"
                                }
                              }
                            }
                          }
                        }
                      },
                      "riskLevel": {
                        "type": "string",
                        "enum": ["minimal", "low", "medium", "high"],
                        "example": "high"
                      },
                      "recommendProceed": {
                        "type": "boolean",
                        "example": false
                      },
                      "alternativeSuggestions": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "example": [
                          "Considere o plano Monthly para experiência sem anúncios"
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Tipo de plano inválido ou perfil malformado",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ValidationError"
              }
            }
          }
        },
        "401": {
          "description": "Token de autenticação necessário para análise personalizada",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UnauthorizedError"
              }
            }
          }
        },
        "404": {
          "description": "Plano não encontrado",
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

export default planRestrictions;
