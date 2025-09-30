const changePlan = {
  '/api/plans/change': {
    put: {
      summary: '🔄 Alterar plano de assinatura',
      description: 'Permite que o usuário altere seu plano atual para outro plano disponível',
      tags: ['💎 Planos'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ChangePlanRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Plano alterado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { $ref: '#/components/schemas/PlanInfo' },
                  error: { type: 'boolean', example: false },
                  code: { type: 'number', example: 200 },
                  message: { type: 'string', example: 'Plano alterado com sucesso' },
                  errors: { type: 'array', example: [] }
                }
              }
            }
          }
        },
        400: {
          description: 'Dados de entrada inválidos ou regras de negócio violadas',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' },
              examples: {
                invalidPlanType: {
                  summary: 'Tipo de plano inválido',
                  value: {
                    data: [],
                    error: true,
                    code: 400,
                    message: 'Dados inválidos',
                    errors: [
                      {
                        path: 'planType',
                        message: 'Plano deve ser: free, monthly ou lifetime'
                      }
                    ]
                  }
                },
                samePlan: {
                  summary: 'Tentativa de alteração para o mesmo plano',
                  value: {
                    data: [],
                    error: true,
                    code: 400,
                    message: 'Plano inválido',
                    errors: [
                      {
                        path: 'planType',
                        message: 'Você já possui o plano Mensal ativo. Escolha um plano diferente ou mantenha o atual.'
                      }
                    ]
                  }
                },
                planNotFound: {
                  summary: 'Plano solicitado não existe',
                  value: {
                    data: [],
                    error: true,
                    code: 400,
                    message: 'Plano não encontrado',
                    errors: [
                      {
                        path: 'planType',
                        message: 'O plano solicitado não está disponível no momento. Verifique os planos disponíveis em /api/plans.'
                      }
                    ]
                  }
                },
                missingData: {
                  summary: 'Campo obrigatório não fornecido',
                  value: {
                    data: [],
                    error: true,
                    code: 400,
                    message: 'Dados obrigatórios ausentes',
                    errors: [
                      {
                        path: 'planType',
                        message: 'É obrigatório informar o tipo de plano para alteração'
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
                        message: 'É necessário estar logado para alterar seu plano. Crie uma conta ou faça login primeiro.'
                      }
                    ]
                  }
                },
                invalidToken: {
                  summary: 'Token inválido',
                  value: {
                    data: [],
                    error: true,
                    code: 401,
                    message: 'Token inválido',
                    errors: [
                      {
                        path: 'authorization',
                        message: 'Seu token de acesso é inválido ou expirou. Faça login novamente para alterar seu plano.'
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
                        message: 'Erro ao alterar seu plano. Nossa equipe foi notificada. Tente novamente em alguns minutos.'
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

export default changePlan;