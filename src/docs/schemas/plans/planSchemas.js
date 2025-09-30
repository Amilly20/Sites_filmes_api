const planSchemas = {
  Plan: {
    type: 'object',
    required: ['name', 'displayName', 'price', 'currency', 'features', 'active'],
    properties: {
      name: {
        type: 'string',
        enum: ['free', 'monthly', 'lifetime'],
        description: 'Identificador único do plano',
        example: 'free'
      },
      displayName: {
        type: 'string',
        description: 'Nome amigável do plano para exibição',
        example: 'Gratuito'
      },
      price: {
        type: 'number',
        minimum: 0,
        description: 'Preço do plano em reais',
        example: 0
      },
      currency: {
        type: 'string',
        description: 'Moeda do preço',
        example: 'BRL'
      },
      features: {
        type: 'object',
        description: 'Características e limitações do plano',
        properties: {
          showAds: {
            type: 'boolean',
            description: 'Se deve exibir anúncios',
            example: true
          },
          monthlyDownloads: {
            type: 'number',
            minimum: 0,
            description: 'Limite de downloads por mês (0 = ilimitado)',
            example: 10
          },
          unlimitedAccess: {
            type: 'boolean',
            description: 'Acesso ilimitado ao catálogo',
            example: false
          },
          hdQuality: {
            type: 'boolean',
            description: 'Qualidade HD disponível',
            example: false
          },
          simultaneousDevices: {
            type: 'number',
            minimum: 1,
            description: 'Dispositivos simultâneos permitidos',
            example: 1
          },
          offlineDownload: {
            type: 'boolean',
            description: 'Downloads offline permitidos',
            example: false
          }
        }
      },
      duration: {
        type: 'number',
        nullable: true,
        description: 'Duração do plano em dias (null = vitalício)',
        example: 30
      },
      active: {
        type: 'boolean',
        description: 'Se o plano está disponível para assinatura',
        example: true
      }
    }
  },

  UserPlan: {
    type: 'object',
    required: ['type', 'startDate', 'downloadsUsed', 'monthlyDownloadsReset'],
    properties: {
      type: {
        type: 'string',
        enum: ['free', 'monthly', 'lifetime'],
        description: 'Tipo do plano atual do usuário',
        example: 'free'
      },
      startDate: {
        type: 'string',
        format: 'date-time',
        description: 'Data de início do plano',
        example: '2024-01-15T10:30:00.000Z'
      },
      endDate: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Data de expiração do plano (null = não expira)',
        example: '2024-02-15T10:30:00.000Z'
      },
      downloadsUsed: {
        type: 'number',
        minimum: 0,
        description: 'Downloads utilizados no período atual',
        example: 3
      },
      monthlyDownloadsReset: {
        type: 'string',
        format: 'date-time',
        description: 'Data do próximo reset dos downloads',
        example: '2024-02-01T00:00:00.000Z'
      }
    }
  },

  PlanInfo: {
    type: 'object',
    required: ['currentPlan', 'planDetails', 'usage'],
    properties: {
      currentPlan: {
        $ref: '#/components/schemas/UserPlan'
      },
      planDetails: {
        $ref: '#/components/schemas/Plan'
      },
      usage: {
        type: 'object',
        description: 'Informações de uso e limitações atuais',
        properties: {
          downloadsUsed: {
            type: 'number',
            description: 'Downloads utilizados no mês',
            example: 3
          },
          downloadsRemaining: {
            type: 'number',
            description: 'Downloads restantes (-1 = ilimitado)',
            example: 7
          },
          showAds: {
            type: 'boolean',
            description: 'Se deve mostrar anúncios',
            example: true
          },
          hasHdQuality: {
            type: 'boolean',
            description: 'Se tem acesso à qualidade HD',
            example: false
          },
          hasOfflineDownload: {
            type: 'boolean',
            description: 'Se pode fazer downloads offline',
            example: false
          },
          simultaneousDevices: {
            type: 'number',
            description: 'Número de dispositivos simultâneos',
            example: 1
          }
        }
      }
    }
  },

  ChangePlanRequest: {
    type: 'object',
    required: ['planType'],
    properties: {
      planType: {
        type: 'string',
        enum: ['free', 'monthly', 'lifetime'],
        description: 'Tipo do plano para o qual deseja alterar',
        example: 'monthly'
      }
    }
  },

  RegisterDownloadRequest: {
    type: 'object',
    required: ['movieId'],
    properties: {
      movieId: {
        type: 'string',
        description: 'ID do filme a ser baixado',
        example: '507f1f77bcf86cd799439011'
      }
    }
  },

  DownloadResponse: {
    type: 'object',
    required: ['downloadRegistered', 'downloadsUsed', 'downloadsRemaining', 'monthlyLimit'],
    properties: {
      downloadRegistered: {
        type: 'boolean',
        description: 'Se o download foi registrado com sucesso',
        example: true
      },
      downloadsUsed: {
        type: 'number',
        description: 'Total de downloads utilizados no mês',
        example: 4
      },
      downloadsRemaining: {
        type: 'number',
        description: 'Downloads restantes no mês (-1 = ilimitado)',
        example: 6
      },
      monthlyLimit: {
        type: 'number',
        description: 'Limite mensal de downloads (0 = ilimitado)',
        example: 10
      },
      resetDate: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Data do próximo reset (null = não se aplica)',
        example: '2024-03-01T00:00:00.000Z'
      }
    }
  },

  AdsResponse: {
    type: 'object',
    required: ['showAds', 'planType', 'planDisplayName', 'adFrequency', 'adTypes'],
    properties: {
      showAds: {
        type: 'boolean',
        description: 'Se deve mostrar anúncios para o usuário',
        example: false
      },
      planType: {
        type: 'string',
        enum: ['free', 'monthly', 'lifetime'],
        description: 'Tipo do plano atual',
        example: 'monthly'
      },
      planDisplayName: {
        type: 'string',
        description: 'Nome do plano para exibição',
        example: 'Mensal'
      },
      adFrequency: {
        type: 'string',
        enum: ['none', 'low', 'medium', 'high'],
        description: 'Frequência de anúncios',
        example: 'none'
      },
      adTypes: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['preroll', 'midroll', 'banner', 'overlay']
        },
        description: 'Tipos de anúncios a serem exibidos',
        example: []
      }
    }
  },

  // 🚨 SCHEMAS DE ERRO - Respostas padronizadas para todos os erros
  ErrorResponse: {
    type: 'object',
    required: ['data', 'error', 'code', 'message', 'errors'],
    properties: {
      data: {
        type: 'array',
        description: 'Array vazio em caso de erro',
        example: []
      },
      error: {
        type: 'boolean',
        description: 'Indica se houve erro (sempre true em respostas de erro)',
        example: true
      },
      code: {
        type: 'number',
        description: 'Código HTTP do erro',
        example: 400
      },
      message: {
        type: 'string',
        description: 'Mensagem descritiva do erro',
        example: 'Dados inválidos fornecidos'
      },
      errors: {
        type: 'array',
        description: 'Lista detalhada dos erros encontrados',
        items: {
          type: 'object',
          required: ['path', 'message'],
          properties: {
            path: {
              type: 'string',
              description: 'Campo ou contexto onde ocorreu o erro',
              example: 'planType'
            },
            message: {
              type: 'string',
              description: 'Descrição específica do erro',
              example: 'Plano deve ser: free, monthly ou lifetime'
            }
          }
        }
      }
    }
  },

  // 🔐 ERROS DE AUTENTICAÇÃO
  UnauthorizedError: {
    type: 'object',
    required: ['data', 'error', 'code', 'message', 'errors'],
    properties: {
      data: {
        type: 'array',
        example: []
      },
      error: {
        type: 'boolean',
        example: true
      },
      code: {
        type: 'number',
        example: 401
      },
      message: {
        type: 'string',
        example: 'Token de acesso requerido'
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              example: 'authorization'
            },
            message: {
              type: 'string',
              example: 'É necessário estar logado para acessar esta funcionalidade. Crie uma conta ou faça login primeiro.'
            }
          }
        },
        example: [
          {
            path: 'authorization',
            message: 'É necessário estar logado para acessar esta funcionalidade. Crie uma conta ou faça login primeiro.'
          }
        ]
      }
    }
  },

  // 🚫 ERROS DE PERMISSÃO
  ForbiddenError: {
    type: 'object',
    required: ['data', 'error', 'code', 'message', 'errors'],
    properties: {
      data: {
        type: 'array',
        example: []
      },
      error: {
        type: 'boolean',
        example: true
      },
      code: {
        type: 'number',
        example: 403
      },
      message: {
        type: 'string',
        example: 'Funcionalidade não disponível no seu plano atual'
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              example: 'plan'
            },
            message: {
              type: 'string',
              example: 'Seu plano não permite esta funcionalidade. Faça upgrade para acessar.'
            }
          }
        },
        example: [
          {
            path: 'plan',
            message: 'Seu plano Gratuito não permite downloads offline. Faça upgrade para Mensal ou Vitalício para acessar esta funcionalidade.'
          }
        ]
      }
    }
  },

  // 📊 ERROS DE VALIDAÇÃO
  ValidationError: {
    type: 'object',
    required: ['data', 'error', 'code', 'message', 'errors'],
    properties: {
      data: {
        type: 'array',
        example: []
      },
      error: {
        type: 'boolean',
        example: true
      },
      code: {
        type: 'number',
        example: 400
      },
      message: {
        type: 'string',
        example: 'Dados inválidos'
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              example: 'planType'
            },
            message: {
              type: 'string',
              example: 'Campo obrigatório'
            }
          }
        },
        example: [
          {
            path: 'planType',
            message: 'Plano deve ser: free, monthly ou lifetime'
          }
        ]
      }
    }
  },

  // 🔄 ERROS DE LIMITE
  LimitExceededError: {
    type: 'object',
    required: ['data', 'error', 'code', 'message', 'errors'],
    properties: {
      data: {
        type: 'array',
        example: []
      },
      error: {
        type: 'boolean',
        example: true
      },
      code: {
        type: 'number',
        example: 400
      },
      message: {
        type: 'string',
        example: 'Limite de downloads excedido'
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              example: 'downloads'
            },
            message: {
              type: 'string',
              example: 'Você atingiu o limite mensal de downloads'
            }
          }
        },
        example: [
          {
            path: 'downloads',
            message: 'Você atingiu o limite mensal de downloads (10/10). Faça upgrade do seu plano para continuar baixando filmes.'
          }
        ]
      }
    }
  },

  // 🔍 ERROS DE RECURSO NÃO ENCONTRADO
  NotFoundError: {
    type: 'object',
    required: ['data', 'error', 'code', 'message', 'errors'],
    properties: {
      data: {
        type: 'array',
        example: []
      },
      error: {
        type: 'boolean',
        example: true
      },
      code: {
        type: 'number',
        example: 404
      },
      message: {
        type: 'string',
        example: 'Recurso não encontrado'
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              example: 'movieId'
            },
            message: {
              type: 'string',
              example: 'O filme solicitado não foi encontrado'
            }
          }
        },
        example: [
          {
            path: 'movieId',
            message: 'O filme solicitado não foi encontrado em nosso catálogo'
          }
        ]
      }
    }
  },

  // ⚠️ ERROS DE SERVIDOR
  ServerError: {
    type: 'object',
    required: ['data', 'error', 'code', 'message', 'errors'],
    properties: {
      data: {
        type: 'array',
        example: []
      },
      error: {
        type: 'boolean',
        example: true
      },
      code: {
        type: 'number',
        example: 500
      },
      message: {
        type: 'string',
        example: 'Erro interno do servidor'
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              example: 'server'
            },
            message: {
              type: 'string',
              example: 'Ocorreu um erro interno. Tente novamente em alguns minutos.'
            }
          }
        },
        example: [
          {
            path: 'server',
            message: 'Erro interno do servidor. Nossa equipe foi notificada e está trabalhando para resolver o problema.'
          }
        ]
      }
    }
  }
};

export default planSchemas;