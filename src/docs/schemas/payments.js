/**
 * 💰 Schemas para Pagamentos
 */

const paymentSchemas = {
  PaymentResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Pagamento processado com sucesso"
      },
      data: {
        type: "object",
        properties: {
          payment: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "pay_123456789"
              },
              status: {
                type: "string",
                enum: ["pending", "approved", "rejected", "cancelled"],
                example: "approved"
              },
              amount: {
                type: "number",
                example: 29.90
              },
              paymentMethod: {
                type: "string",
                example: "card"
              },
              planType: {
                type: "string",
                example: "monthly"
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2024-01-15T10:30:00Z"
              }
            }
          }
        }
      }
    }
  },

  PixPaymentResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "PIX gerado com sucesso"
      },
      data: {
        type: "object",
        properties: {
          payment: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "pix_123456789"
              },
              status: {
                type: "string",
                example: "pending"
              },
              pixCode: {
                type: "string",
                example: "00020126580014br.gov.bcb.pix013632..."
              },
              qrCode: {
                type: "string",
                example: "data:image/png;base64,iVBORw0KGgoAAAANSU..."
              },
              expiresAt: {
                type: "string",
                format: "date-time",
                example: "2024-01-15T11:30:00Z"
              }
            }
          }
        }
      }
    }
  },

  BoletoPaymentResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Boleto gerado com sucesso"
      },
      data: {
        type: "object",
        properties: {
          payment: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "bol_123456789"
              },
              status: {
                type: "string",
                example: "pending"
              },
              boletoUrl: {
                type: "string",
                example: "https://gateway.com/boleto/123456789.pdf"
              },
              barCode: {
                type: "string",
                example: "23790001234567890123456789012345678901"
              },
              dueDate: {
                type: "string",
                format: "date",
                example: "2024-01-20"
              }
            }
          }
        }
      }
    }
  },

  PaymentListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "object",
        properties: {
          payments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string"
                },
                status: {
                  type: "string"
                },
                amount: {
                  type: "number"
                },
                paymentMethod: {
                  type: "string"
                },
                planType: {
                  type: "string"
                },
                createdAt: {
                  type: "string",
                  format: "date-time"
                }
              }
            }
          },
          pagination: {
            type: "object",
            properties: {
              page: {
                type: "integer"
              },
              limit: {
                type: "integer"
              },
              total: {
                type: "integer"
              },
              pages: {
                type: "integer"
              }
            }
          }
        }
      }
    }
  },

  PaymentDetailsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "object",
        properties: {
          payment: {
            type: "object",
            properties: {
              id: {
                type: "string"
              },
              status: {
                type: "string"
              },
              amount: {
                type: "number"
              },
              paymentMethod: {
                type: "string"
              },
              planType: {
                type: "string"
              },
              gatewayResponse: {
                type: "object"
              },
              createdAt: {
                type: "string",
                format: "date-time"
              },
              updatedAt: {
                type: "string",
                format: "date-time"
              }
            }
          }
        }
      }
    }
  },

  PaymentStatusResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["pending", "approved", "rejected", "cancelled"]
          },
          lastUpdate: {
            type: "string",
            format: "date-time"
          },
          statusHistory: {
            type: "array",
            items: {
              type: "object",
              properties: {
                status: {
                  type: "string"
                },
                timestamp: {
                  type: "string",
                  format: "date-time"
                },
                reason: {
                  type: "string"
                }
              }
            }
          }
        }
      }
    }
  },

  PaymentMethodsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "object",
        properties: {
          methods: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["card", "pix", "boleto"]
                },
                name: {
                  type: "string"
                },
                icon: {
                  type: "string"
                },
                processingTime: {
                  type: "string"
                },
                fees: {
                  type: "object"
                },
                available: {
                  type: "boolean"
                }
              }
            }
          }
        }
      }
    }
  }
};

export default paymentSchemas;
