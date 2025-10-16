/**
 * 🎬 Documentação das Rotas - RF25 Sistema de Filmes
 * 
 * Documentação Swagger para todas as rotas de gerenciamento de filmes
 */

export default {
  '/movies': {
    get: {
      tags: ['🎬 Filmes'],
      summary: '📝 Listar filmes com filtros avançados',
      description: 'Obtém lista paginada de filmes com filtros por gênero, ano, status, idioma e busca textual.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Número da página',
          schema: { type: 'integer', minimum: 1, default: 1 },
          example: 1
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Items por página',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          example: 10
        },
        {
          name: 'genre',
          in: 'query',
          description: 'Filtrar por gênero',
          schema: { 
            type: 'string',
            enum: [
              'Ação', 'Aventura', 'Comédia', 'Drama', 'Terror', 'Ficção Científica',
              'Romance', 'Thriller', 'Documentário', 'Animação', 'Fantasia',
              'Crime', 'Mistério', 'Guerra', 'Western', 'Musical', 'Biografia',
              'História', 'Esporte', 'Família'
            ]
          },
          example: 'Ação'
        },
        {
          name: 'year',
          in: 'query',
          description: 'Filtrar por ano de lançamento',
          schema: { type: 'integer', minimum: 1900, maximum: 2030 },
          example: 2023
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filtrar por status',
          schema: {
            type: 'string',
            enum: ['draft', 'published', 'archived']
          },
          example: 'published'
        },
        {
          name: 'language',
          in: 'query',
          description: 'Filtrar por idioma disponível',
          schema: { type: 'string' },
          example: 'Português'
        },
        {
          name: 'search',
          in: 'query',
          description: 'Busca textual em título e sinopse',
          schema: { type: 'string' },
          example: 'Avatar'
        },
        {
          name: 'sortBy',
          in: 'query',
          description: 'Campo para ordenação',
          schema: {
            type: 'string',
            enum: ['title', 'releaseYear', 'duration', 'createdAt'],
            default: 'createdAt'
          },
          example: 'releaseYear'
        },
        {
          name: 'sortOrder',
          in: 'query',
          description: 'Ordem da ordenação',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc'
          },
          example: 'desc'
        }
      ],
      responses: {
        '200': {
          description: '✅ Lista de filmes obtida com sucesso',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MovieListResponse' }
            }
          }
        },
        '401': { $ref: '#/components/responses/UnauthorizedError' },
        '403': { $ref: '#/components/responses/ForbiddenError' },
        '400': { $ref: '#/components/responses/ValidationError' }
      }
    },

    post: {
      tags: ['🎬 Filmes'],
      summary: '➕ Cadastrar novo filme',
      description: 'Cadastra um novo filme com todos os campos obrigatórios do RF25. Apenas administradores podem cadastrar filmes.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MovieInput' }
          }
        }
      },
      responses: {
        '201': {
          description: '✅ Filme cadastrado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Filme cadastrado com sucesso' },
                  data: {
                    type: 'object',
                    properties: {
                      movie: { $ref: '#/components/schemas/MovieResponse' }
                    }
                  }
                }
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/ValidationError' },
        '401': { $ref: '#/components/responses/UnauthorizedError' },
        '403': { $ref: '#/components/responses/ForbiddenError' },
        '409': {
          description: 'Conflito - Filme já existe',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Já existe um filme com este título' }
                }
              }
            }
          }
        }
      }
    }
  },

  '/movies/{id}': {
    get: {
      tags: ['🎬 Filmes'],
      summary: '🔍 Obter filme específico',
      description: 'Obtém detalhes completos de um filme específico pelo ID.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID único do filme',
          schema: { type: 'string' },
          example: '507f1f77bcf86cd799439011'
        }
      ],
      responses: {
        '200': {
          description: '✅ Filme encontrado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Filme obtido com sucesso' },
                  data: {
                    type: 'object',
                    properties: {
                      movie: { $ref: '#/components/schemas/MovieResponse' }
                    }
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'ID inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'ID do filme inválido' }
                }
              }
            }
          }
        },
        '401': { $ref: '#/components/responses/UnauthorizedError' },
        '403': { $ref: '#/components/responses/ForbiddenError' },
        '404': { $ref: '#/components/responses/NotFoundError' }
      }
    },

    put: {
      tags: ['🎬 Filmes'],
      summary: '✏️ Atualizar filme completo',
      description: 'Atualiza todos os dados de um filme. Usuários só podem editar próprios filmes, administradores podem editar qualquer filme.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID único do filme',
          schema: { type: 'string' },
          example: '507f1f77bcf86cd799439011'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MovieInput' }
          }
        }
      },
      responses: {
        '200': {
          description: '✅ Filme atualizado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Filme atualizado com sucesso' },
                  data: {
                    type: 'object',
                    properties: {
                      movie: { $ref: '#/components/schemas/MovieResponse' }
                    }
                  }
                }
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/ValidationError' },
        '401': { $ref: '#/components/responses/UnauthorizedError' },
        '403': { $ref: '#/components/responses/ForbiddenError' },
        '404': { $ref: '#/components/responses/NotFoundError' }
      }
    },

    delete: {
      tags: ['🎬 Filmes'],
      summary: '🗑️ Deletar filme',
      description: 'Remove completamente um filme do sistema. Usuários só podem deletar próprios filmes, administradores podem deletar qualquer filme.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID único do filme',
          schema: { type: 'string' },
          example: '507f1f77bcf86cd799439011'
        }
      ],
      responses: {
        '200': {
          description: '✅ Filme deletado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Filme excluído com sucesso' },
                  data: {
                    type: 'object',
                    properties: {
                      deletedMovie: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                          title: { type: 'string', example: 'Avatar: O Caminho da Água' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'ID inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'ID do filme inválido' }
                }
              }
            }
          }
        },
        '401': { $ref: '#/components/responses/UnauthorizedError' },
        '403': { $ref: '#/components/responses/ForbiddenError' },
        '404': { $ref: '#/components/responses/NotFoundError' }
      }
    }
  },

  '/movies/{id}/status': {
    patch: {
      tags: ['🎬 Filmes'],
      summary: '🔄 Alterar status do filme',
      description: 'Altera apenas o status de um filme (ativo, inativo, rascunho, arquivado). Útil para publicar ou despublicar filmes.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID único do filme',
          schema: { type: 'string' },
          example: '507f1f77bcf86cd799439011'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/StatusUpdateRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: '✅ Status alterado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Status do filme alterado para "published" com sucesso' },
                  data: {
                    type: 'object',
                    properties: {
                      movie: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          title: { type: 'string' },
                          status: { type: 'string' },
                          updatedAt: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/ValidationError' },
        '401': { $ref: '#/components/responses/UnauthorizedError' },
        '403': { $ref: '#/components/responses/ForbiddenError' },
        '404': { $ref: '#/components/responses/NotFoundError' }
      }
    }
  }
};
