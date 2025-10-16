/**
 * 🎬 Schemas Swagger - RF25 Sistema de Filmes
 * 
 * Definições de tipos de dados para as APIs de filmes
 */

export default {
  MovieInput: {
    type: 'object',
    required: [
      'title', 'synopsis', 'duration', 'releaseYear', 'cast', 'director',
      'genres', 'ageRating', 'languages', 'subtitles', 'country', 'studio',
      'images', 'trailer', 'url'
    ],
    properties: {
      title: {
        type: 'string',
        description: 'Título do filme',
        example: 'Avatar: O Caminho da Água',
        maxLength: 200
      },
      synopsis: {
        type: 'string',
        description: 'Sinopse completa do filme',
        example: 'Jake Sully vive com sua nova família formada no planeta Pandora. Quando uma ameaça familiar retorna...',
        maxLength: 2000
      },
      duration: {
        type: 'integer',
        description: 'Duração do filme em minutos',
        example: 192,
        minimum: 1
      },
      releaseYear: {
        type: 'integer',
        description: 'Ano de lançamento',
        example: 2022,
        minimum: 1900,
        maximum: 2030
      },
      cast: {
        type: 'array',
        description: 'Lista do elenco principal',
        items: {
          type: 'string'
        },
        example: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Kate Winslet']
      },
      director: {
        type: 'string',
        description: 'Nome do diretor',
        example: 'James Cameron'
      },
      genres: {
        type: 'array',
        description: 'Gêneros do filme',
        items: {
          type: 'string',
          enum: [
            'Ação', 'Aventura', 'Comédia', 'Drama', 'Terror', 'Ficção Científica',
            'Romance', 'Thriller', 'Documentário', 'Animação', 'Fantasia',
            'Crime', 'Mistério', 'Guerra', 'Western', 'Musical', 'Biografia',
            'História', 'Esporte', 'Família'
          ]
        },
        example: ['Ficção Científica', 'Aventura', 'Ação']
      },
      ageRating: {
        type: 'string',
        description: 'Classificação etária',
        enum: ['L', '10', '12', '14', '16', '18'],
        example: '12'
      },
      languages: {
        type: 'array',
        description: 'Idiomas disponíveis',
        items: {
          type: 'string'
        },
        example: ['Português', 'Inglês', 'Espanhol']
      },
      subtitles: {
        type: 'array',
        description: 'Legendas disponíveis',
        items: {
          type: 'string'
        },
        example: ['Português', 'Inglês', 'Espanhol', 'Francês']
      },
      country: {
        type: 'string',
        description: 'País de origem',
        example: 'Estados Unidos'
      },
      studio: {
        type: 'string',
        description: 'Estúdio/Produtora',
        example: '20th Century Studios'
      },
      images: {
        type: 'object',
        description: 'Imagens do filme',
        required: ['poster', 'backdrop'],
        properties: {
          poster: {
            type: 'string',
            format: 'url',
            description: 'URL do poster principal',
            example: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg'
          },
          backdrop: {
            type: 'string',
            format: 'url',
            description: 'URL da imagem de fundo',
            example: 'https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg'
          },
          gallery: {
            type: 'array',
            description: 'URLs de imagens adicionais',
            items: {
              type: 'string',
              format: 'url'
            }
          }
        }
      },
      trailer: {
        type: 'object',
        description: 'Trailer do filme',
        required: ['url'],
        properties: {
          url: {
            type: 'string',
            format: 'url',
            description: 'URL do trailer',
            example: 'https://www.youtube.com/watch?v=d9MyW72ELq0'
          },
          platform: {
            type: 'string',
            enum: ['YouTube', 'Vimeo', 'Local'],
            default: 'YouTube',
            description: 'Plataforma do trailer'
          }
        }
      },
      url: {
        type: 'string',
        format: 'url',
        description: 'URL para assistir o filme',
        example: 'https://streaming.example.com/movies/avatar-2'
      },
      downloadUrl: {
        type: 'string',
        format: 'url',
        description: 'URL para download (opcional)',
        example: 'https://cdn.example.com/downloads/avatar-2.mp4'
      },
      isPremium: {
        type: 'boolean',
        description: 'Se o filme é premium',
        default: false,
        example: true
      }
    }
  },

  MovieResponse: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'ID único do filme'
      },
      title: {
        type: 'string',
        description: 'Título do filme'
      },
      synopsis: {
        type: 'string',
        description: 'Sinopse do filme'
      },
      duration: {
        type: 'integer',
        description: 'Duração em minutos'
      },
      formattedDuration: {
        type: 'string',
        description: 'Duração formatada',
        example: '3h 12min'
      },
      releaseYear: {
        type: 'integer',
        description: 'Ano de lançamento'
      },
      cast: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      director: {
        type: 'string',
        description: 'Diretor'
      },
      genres: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      ageRating: {
        type: 'string',
        enum: ['L', '10', '12', '14', '16', '18']
      },
      languages: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      subtitles: {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      country: {
        type: 'string'
      },
      studio: {
        type: 'string'
      },
      images: {
        type: 'object',
        properties: {
          poster: { type: 'string', format: 'url' },
          backdrop: { type: 'string', format: 'url' },
          gallery: {
            type: 'array',
            items: { type: 'string', format: 'url' }
          }
        }
      },
      trailer: {
        type: 'object',
        properties: {
          url: { type: 'string', format: 'url' },
          platform: { type: 'string', enum: ['YouTube', 'Vimeo', 'Local'] }
        }
      },
      url: {
        type: 'string',
        format: 'url'
      },
      downloadUrl: {
        type: 'string',
        format: 'url'
      },
      isPremium: {
        type: 'boolean'
      },
      status: {
        type: 'string',
        enum: ['draft', 'published', 'archived']
      },
      createdBy: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          username: { type: 'string' }
        }
      },
      createdAt: {
        type: 'string',
        format: 'date-time'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time'
      }
    }
  },

  MovieListResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Filmes obtidos com sucesso'
      },
      data: {
        type: 'object',
        properties: {
          movies: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/MovieResponse'
            }
          },
          pagination: {
            type: 'object',
            properties: {
              currentPage: {
                type: 'integer',
                example: 1
              },
              totalPages: {
                type: 'integer',
                example: 5
              },
              totalItems: {
                type: 'integer',
                example: 45
              },
              itemsPerPage: {
                type: 'integer',
                example: 10
              },
              hasNextPage: {
                type: 'boolean',
                example: true
              },
              hasPrevPage: {
                type: 'boolean',
                example: false
              }
            }
          }
        }
      }
    }
  },

  StatusUpdateRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['draft', 'published', 'archived'],
        description: 'Novo status do filme',
        example: 'published'
      }
    }
  },

  // Schemas de erro
  ValidationError: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
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
              example: 'title'
            },
            message: {
              type: 'string',
              example: 'Título é obrigatório'
            }
          }
        }
      }
    }
  },

  UnauthorizedError: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        example: 'Token não fornecido ou inválido'
      }
    }
  },

  ForbiddenError: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        example: 'Acesso negado. Apenas administradores podem acessar este recurso.'
      }
    }
  },

  NotFoundError: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        example: 'Filme não encontrado'
      }
    }
  }
};
