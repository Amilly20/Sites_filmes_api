const getMyPlan = {
  '/api/plans/my-plan': {
    get: {
      summary: '👤 Obter informações do plano atual',
      description: 'Retorna as informações detalhadas do plano ativo do usuário logado, incluindo limitações e status de uso',
      tags: ['💎 Planos'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Informações do plano carregadas com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { $ref: '#/components/schemas/PlanInfo' },
                  error: { type: 'boolean', example: false },
                  code: { type: 'number', example: 200 },
                  message: { type: 'string', example: 'Informações do plano carregadas com sucesso' },
                  errors: { type: 'array', example: [] }
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
                        message: 'É necessário estar logado para ver informações do seu plano. Crie uma conta ou faça login primeiro.'
                      }
                    ]
                  }
                },
                invalidToken: {
                  summary: 'Token inválido ou expirado',
                  value: {
                    data: [],
                    error: true,
                    code: 401,
                    message: 'Token inválido',
                    errors: [
                      {
                        path: 'authorization',
                        message: 'Seu token de acesso é inválido ou expirou. Faça login novamente para continuar.'
                      }
                    ]
                  }
                },
                userNotFound: {
                  summary: 'Usuário não encontrado',
                  value: {
                    data: [],
                    error: true,
                    code: 401,
                    message: 'Usuário não encontrado',
                    errors: [
                      {
                        path: 'user',
                        message: 'Sua conta não foi encontrada. Verifique se ela ainda existe ou crie uma nova conta.'
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
                        message: 'Erro ao carregar informações do seu plano. Nossa equipe foi notificada. Tente novamente em alguns minutos.'
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

export default getMyPlan;