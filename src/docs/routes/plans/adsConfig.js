const adsConfig = {
  '/api/plans/ads-config': {
    get: {
      summary: '📺 Verificar configuração de anúncios',
      description: 'Verifica se o usuário deve visualizar anúncios baseado no seu plano atual',
      tags: ['💎 Planos'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Configuração de anúncios obtida com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { $ref: '#/components/schemas/AdsResponse' },
                  error: { type: 'boolean', example: false },
                  code: { type: 'number', example: 200 },
                  message: { type: 'string', example: 'Configuração de anúncios carregada' },
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
                        message: 'É necessário estar logado para ver configuração de anúncios. Crie uma conta ou faça login primeiro.'
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
                        message: 'Erro ao carregar configuração de anúncios. Nossa equipe foi notificada. Tente novamente em alguns minutos.'
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

export default adsConfig;