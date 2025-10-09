/**
 * 💳 Documentação Swagger - Rotas de Pagamento
 */

const payments = {
  "/payments/card": {
    "post": {
      "summary": "💳 Processar pagamento via cartão",
      "description": "Processa pagamento de plano utilizando cartão de crédito ou débito",
      "tags": ["💰 Pagamentos"],
      "security": [{"bearerAuth": []}],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["planType", "cardData"],
              "properties": {
                "planType": {
                  "type": "string",
                  "enum": ["free", "monthly", "lifetime"],
                  "description": "Tipo do plano a ser adquirido"
                },
                "cardData": {
                  "type": "object",
                  "required": ["number", "holderName", "expiryMonth", "expiryYear", "cvv", "type"],
                  "properties": {
                    "number": {
                      "type": "string",
                      "example": "4111111111111111",
                      "description": "Número do cartão (13-19 dígitos)"
                    },
                    "holderName": {
                      "type": "string",
                      "example": "João Silva",
                      "description": "Nome do portador do cartão"
                    },
                    "expiryMonth": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 12,
                      "example": 12,
                      "description": "Mês de expiração (1-12)"
                    },
                    "expiryYear": {
                      "type": "integer",
                      "example": 2025,
                      "description": "Ano de expiração"
                    },
                    "cvv": {
                      "type": "string",
                      "example": "123",
                      "description": "Código de segurança (3-4 dígitos)"
                    },
                    "type": {
                      "type": "string",
                      "enum": ["credit", "debit"],
                      "description": "Tipo do cartão"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Pagamento processado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PaymentResponse"
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos ou pagamento rejeitado",
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
  
  "/payments/pix": {
    "post": {
      "summary": "💰 Processar pagamento via PIX",
      "description": "Gera código PIX para pagamento de plano",
      "tags": ["💰 Pagamentos"],
      "security": [{"bearerAuth": []}],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["planType"],
              "properties": {
                "planType": {
                  "type": "string",
                  "enum": ["free", "monthly", "lifetime"],
                  "description": "Tipo do plano a ser adquirido"
                }
              },
              "example": {
                "planType": "monthly"
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "PIX gerado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PixPaymentResponse"
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos",
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
  
  "/payments/boleto": {
    "post": {
      "summary": "📄 Processar pagamento via boleto",
      "description": "Gera boleto bancário para pagamento de plano",
      "tags": ["💰 Pagamentos"],
      "security": [{"bearerAuth": []}],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["planType", "customerData"],
              "properties": {
                "planType": {
                  "type": "string",
                  "enum": ["free", "monthly", "lifetime"],
                  "description": "Tipo do plano a ser adquirido"
                },
                "customerData": {
                  "type": "object",
                  "required": ["name", "document", "email"],
                  "properties": {
                    "name": {
                      "type": "string",
                      "example": "João Silva",
                      "description": "Nome completo do cliente"
                    },
                    "document": {
                      "type": "string",
                      "example": "12345678901",
                      "description": "CPF (11 dígitos) ou CNPJ (14 dígitos)"
                    },
                    "email": {
                      "type": "string",
                      "format": "email",
                      "example": "joao@email.com",
                      "description": "Email válido para envio do boleto"
                    },
                    "phone": {
                      "type": "string",
                      "example": "(11) 99999-9999",
                      "description": "Telefone no formato (XX) XXXXX-XXXX"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Boleto gerado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BoletoPaymentResponse"
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos",
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
  
  "/payments": {
    "get": {
      "summary": "📊 Listar pagamentos do usuário",
      "description": "Lista todos os pagamentos realizados pelo usuário com filtros opcionais",
      "tags": ["💰 Pagamentos"],
      "security": [{"bearerAuth": []}],
      "parameters": [
        {
          "in": "query",
          "name": "status",
          "schema": {
            "type": "string",
            "enum": ["pending", "approved", "rejected", "cancelled"]
          },
          "description": "Filtrar por status do pagamento"
        },
        {
          "in": "query",
          "name": "paymentMethod",
          "schema": {
            "type": "string",
            "enum": ["card", "pix", "boleto"]
          },
          "description": "Filtrar por método de pagamento"
        },
        {
          "in": "query",
          "name": "limit",
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
            "default": 20
          },
          "description": "Número máximo de registros a retornar"
        },
        {
          "in": "query",
          "name": "page",
          "schema": {
            "type": "integer",
            "minimum": 1,
            "default": 1
          },
          "description": "Página para paginação"
        }
      ],
      "responses": {
        "200": {
          "description": "Lista de pagamentos obtida com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PaymentListResponse"
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
  
  "/payments/{id}": {
    "get": {
      "summary": "🔍 Obter detalhes de um pagamento",
      "description": "Obtém informações detalhadas de um pagamento específico",
      "tags": ["💰 Pagamentos"],
      "security": [{"bearerAuth": []}],
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "string"
          },
          "description": "ID único do pagamento"
        }
      ],
      "responses": {
        "200": {
          "description": "Detalhes do pagamento obtidos com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PaymentDetailsResponse"
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
          "description": "Pagamento não encontrado",
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
  
  "/payments/{id}/status": {
    "get": {
      "summary": "🔄 Verificar status de pagamento",
      "description": "Verifica o status atual de um pagamento específico",
      "tags": ["💰 Pagamentos"],
      "security": [{"bearerAuth": []}],
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "string"
          },
          "description": "ID único do pagamento"
        }
      ],
      "responses": {
        "200": {
          "description": "Status do pagamento verificado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PaymentStatusResponse"
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
          "description": "Pagamento não encontrado",
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
  
  "/payments/methods/available": {
    "get": {
      "summary": "📋 Obter métodos de pagamento disponíveis",
      "description": "Lista todos os métodos de pagamento disponíveis no sistema",
      "tags": ["💰 Pagamentos"],
      "responses": {
        "200": {
          "description": "Métodos de pagamento obtidos com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PaymentMethodsResponse"
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
  
  "/payments/webhook/{gateway}": {
    "post": {
      "summary": "🎯 Webhook para notificações de gateway",
      "description": "Recebe notificações dos gateways de pagamento sobre mudanças de status",
      "tags": ["💰 Pagamentos"],
      "parameters": [
        {
          "in": "path",
          "name": "gateway",
          "required": true,
          "schema": {
            "type": "string",
            "enum": ["mercadopago", "stripe", "pagseguro"]
          },
          "description": "Nome do gateway de pagamento"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "description": "Dados do webhook do gateway (formato varia por gateway)"
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Webhook processado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean"
                  },
                  "message": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Dados do webhook inválidos",
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

export default payments;
