/**
 * 🚫 RF22 - Documentação do Cancelamento de Assinatura
 * Permite que usuários cancelem suas assinaturas pagas
 */

const userCancelSubscription = {
  "/users/cancel-subscription": {
    "post": {
      "summary": "🚫 Cancelar assinatura mensal",
      "description": "RF22 - Permite que usuários com plano MENSAL cancelem sua assinatura e voltem para o plano gratuito. ⚠️ IMPORTANTE: Planos vitalícios NÃO podem ser cancelados (pagamento é permanente). Usuários gratuitos receberão erro.",
      "tags": ["👤 Usuários"],
      "security": [{ "bearerAuth": [] }],
      "requestBody": {
        "required": false,
        "description": "Nenhum dado adicional necessário - o cancelamento é baseado no usuário autenticado"
      },
      "responses": {
        "200": {
          "description": "✅ Assinatura cancelada com sucesso",
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
                    "example": "Assinatura mensal cancelada com sucesso. Você agora está no plano gratuito."
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "user": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "example": "507f1f77bcf86cd799439011"
                          },
                          "name": {
                            "type": "string",
                            "example": "João Silva"
                          },
                          "email": {
                            "type": "string",
                            "example": "joao.silva@email.com"
                          },
                          "plan": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "example": "free"
                              },
                              "startDate": {
                                "type": "string",
                                "format": "date-time",
                                "example": "2024-01-15T10:30:00.000Z"
                              },
                              "features": {
                                "type": "object",
                                "properties": {
                                  "monthlyDownloads": {
                                    "type": "number",
                                    "example": 10
                                  },
                                  "showAds": {
                                    "type": "boolean",
                                    "example": true
                                  },
                                  "simultaneousDevices": {
                                    "type": "number",
                                    "example": 1
                                  },
                                  "hdQuality": {
                                    "type": "boolean",
                                    "example": false
                                  },
                                  "offlineDownload": {
                                    "type": "boolean",
                                    "example": false
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      "canceledPlan": {
                        "type": "object",
                        "description": "Informações sobre o plano que foi cancelado",
                        "properties": {
                          "type": {
                            "type": "string",
                            "enum": ["monthly"],
                            "example": "monthly"
                          },
                          "wasActive": {
                            "type": "string",
                            "format": "date-time",
                            "description": "Data de início do plano cancelado",
                            "example": "2024-01-01T00:00:00.000Z"
                          },
                          "canceledAt": {
                            "type": "string",
                            "format": "date-time",
                            "description": "Data e hora do cancelamento",
                            "example": "2024-01-15T10:30:00.000Z"
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
          "description": "❌ Erro - Plano não pode ser cancelado (gratuito ou vitalício)",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "error": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Requisição com dados inválidos"
                  },
                  "errors": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "path": {
                          "type": "string",
                          "example": "plan"
                        },
                        "message": {
                          "type": "string",
                          "oneOf": [
                            {
                              "example": "Você já está no plano gratuito. Não há assinatura para cancelar."
                            },
                            {
                              "example": "Planos vitalícios não podem ser cancelados. Você pagou pelo acesso permanente e ele é válido para sempre."
                            }
                          ]
                        }
                      }
                    },
                    "example": [
                      {
                        "path": "plan",
                        "message": "Você já está no plano gratuito. Não há assinatura para cancelar."
                      },
                      {
                        "path": "plan", 
                        "message": "Planos vitalícios não podem ser cancelados. Você pagou pelo acesso permanente e ele é válido para sempre."
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        "401": {
          "description": "🔒 Não autorizado - Token inválido ou não fornecido",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "error": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Cliente sem credenciais para acessar o recurso solicitado."
                  },
                  "errors": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "path": {
                          "type": "string",
                          "example": "token"
                        },
                        "message": {
                          "type": "string",
                          "example": "Token não informado. Por favor, faça login."
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "👤 Usuário não encontrado",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "error": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Usuário não encontrado"
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "🔥 Erro interno do servidor",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "error": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Erro interno do servidor"
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

export default userCancelSubscription;