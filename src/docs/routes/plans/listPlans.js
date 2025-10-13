const listPlans = {
  '/api/plans': {
    get: {
      summary: '📋 Listar todos os planos disponíveis',
      description: 'Retorna a lista de todos os planos de assinatura disponíveis com suas características e preços',
      tags: ['💎 Planos'],
      responses: {
        200: {
          description: 'Lista de planos carregada com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Plan' }
                  },
                  error: { type: 'boolean', example: false },
                  code: { type: 'number', example: 200 },
                  message: { type: 'string', example: 'Planos carregados com sucesso' },
                  errors: { type: 'array', example: [] }
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
                  summary: 'Erro do servidor ao carregar planos',
                  value: {
                    data: [],
                    error: true,
                    code: 500,
                    message: 'Erro interno do servidor',
                    errors: [
                      {
                        path: 'plans',
                        message: 'Erro ao carregar planos disponíveis. Nossa equipe foi notificada. Tente novamente em alguns minutos.'
                      }
                    ]
                  }
                },
                databaseError: {
                  summary: 'Erro de conexão com banco de dados',
                  value: {
                    data: [],
                    error: true,
                    code: 500,
                    message: 'Serviço temporariamente indisponível',
                    errors: [
                      {
                        path: 'database',
                        message: 'Problemas de conectividade com o banco de dados. Tente novamente em alguns minutos.'
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

export default listPlans;
