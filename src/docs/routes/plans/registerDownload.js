const registerDownload = {
  '/api/plans/download': {
    post: {
      summary: '⬇️ Registrar download de filme',
      description: 'Registra um download de filme para o usuário, validando se ele possui limite disponível',
      tags: ['💎 Planos'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RegisterDownloadRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Download registrado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { $ref: '#/components/schemas/DownloadResponse' },
                  error: { type: 'boolean', example: false },
                  code: { type: 'number', example: 200 },
                  message: { type: 'string', example: 'Download registrado com sucesso' },
                  errors: { type: 'array', example: [] }
                }
              }
            }
          }
        },
        400: {
          description: 'Dados de entrada inválidos ou limite excedido',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
              examples: {
                invalidMovieId: {
                  summary: 'ID do filme inválido',
                  value: {
                    data: [],
                    error: true,
                    code: 400,
                    message: 'Dados inválidos',
                    errors: [
                      {
                        path: 'movieId',
                        message: 'ID do filme é obrigatório e deve ser um ID válido'
                      }
                    ]
                  }
                },
                movieNotFound: {
                  summary: 'Filme não encontrado',
                  value: {
                    data: [],
                    error: true,
                    code: 400,
                    message: 'Filme não encontrado',
                    errors: [
                      {
                        path: 'movieId',
                        message: 'O filme solicitado não foi encontrado em nosso catálogo'
                      }
                    ]
                  }
                },
                downloadLimitExceeded: {
                  summary: 'Limite de downloads excedido',
                  value: {
                    data: [],
                    error: true,
                    code: 400,
                    message: 'Limite de downloads excedido',
                    errors: [
                      {
                        path: 'downloads',
                        message: 'Você atingiu o limite mensal de downloads (10/10). Faça upgrade do seu plano para Mensal ou Vitalício para continuar baixando filmes.'
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Token de autenticação inválido ou ausente',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UnauthorizedError' },
              examples: {
                noToken: {
                  summary: 'Token não fornecido',
                  value: {
                    data: [],
                    error: true,
                    code: 401,
                    message: 'Token de acesso requerido',
                    errors: [
                      {
                        path: 'authorization',
                        message: 'É necessário estar logado para registrar downloads. Crie uma conta ou faça login primeiro.'
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        403: {
          description: 'Plano não permite downloads offline',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForbiddenError' },
              examples: {
                noDownloadFeature: {
                  summary: 'Plano não permite downloads',
                  value: {
                    data: [],
                    error: true,
                    code: 403,
                    message: 'Funcionalidade não disponível no seu plano',
                    errors: [
                      {
                        path: 'plan',
                        message: 'Seu plano Gratuito não permite downloads offline. Faça upgrade para Mensal (R$ 19,90/mês) ou Vitalício (R$ 299,90) para acessar esta funcionalidade.'
                      }
                    ]
                  }
                },
                planExpired: {
                  summary: 'Plano expirado',
                  value: {
                    data: [],
                    error: true,
                    code: 403,
                    message: 'Plano expirado',
                    errors: [
                      {
                        path: 'plan',
                        message: 'Seu plano Mensal expirou. Renove sua assinatura para continuar baixando filmes.'
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ServerError' },
              examples: {
                serverError: {
                  summary: 'Erro do servidor',
                  value: {
                    data: [],
                    error: true,
                    code: 500,
                    message: 'Erro interno do servidor',
                    errors: [
                      {
                        path: 'server',
                        message: 'Erro ao registrar download. Nossa equipe foi notificada. Tente novamente em alguns minutos.'
                      }
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
};

export default registerDownload;