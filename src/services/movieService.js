import MovieRepository from '../repositories/movieRepository.js';
import { APIErro } from '../utils/ApiError.js';

/**
 * 🎬 Service de Filmes - RF25
 * Contém toda a lógica de negócio relacionada a filmes
 */
class MovieService {

  /**
   * 📝 Criar novo filme
   */
  async createMovie(movieData, userId) {
    try {
      // Verificar se já existe filme com mesmo título e ano
      const existingMovie = await MovieRepository.findByTitleAndYear(
        movieData.title, 
        movieData.releaseYear
      );

      if (existingMovie) {
        throw new APIErro(409, [{
          path: 'title',
          message: `Já existe um filme com o título "${movieData.title}" do ano ${movieData.releaseYear}`
        }]);
      }

      // Validar dados específicos do negócio
      this._validateMovieBusinessRules(movieData);

      // Preparar dados para criação
      const movieToCreate = {
        ...movieData,
        createdBy: userId,
        status: 'draft' // Todo filme inicia como rascunho
      };

      // Criar filme
      const movie = await MovieRepository.create(movieToCreate);
      return movie;

    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      throw new APIErro(500, [{
        path: 'server',
        message: 'Erro interno ao criar filme'
      }]);
    }
  }

  /**
   * 📋 Listar filmes com filtros avançados
   */
  async getMovies(queryParams = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        genre,
        year,
        ageRating,
        search,
        sortBy = 'createdAt',
        order = 'desc',
        director,
        createdBy
      } = queryParams;

      // Construir filtros
      const filters = {};
      
      if (status) filters.status = status;
      if (genre) filters.genres = { $in: [genre] };
      if (year) filters.releaseYear = parseInt(year);
      if (ageRating) filters.ageRating = ageRating;
      if (director) filters.director = { $regex: new RegExp(director, 'i') };
      if (createdBy) filters.createdBy = createdBy;
      
      // Filtro de pesquisa textual
      if (search) {
        filters.$or = [
          { title: { $regex: search, $options: 'i' } },
          { synopsis: { $regex: search, $options: 'i' } },
          { director: { $regex: search, $options: 'i' } },
          { cast: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Opções de paginação e ordenação
      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 100), // Máximo 100 por página
        sortBy,
        order
      };

      const result = await MovieRepository.findWithFilters(filters, options);
      
      // Formattar resposta
      return {
        movies: result.movies.map(movie => this._formatMovieForList(movie)),
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalItems: result.total,
          itemsPerPage: result.limit,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage
        }
      };

    } catch (error) {
      throw new APIErro(500, [{
        path: 'server',
        message: 'Erro ao buscar filmes'
      }]);
    }
  }

  /**
   * 🔍 Obter filme específico por ID
   */
  async getMovieById(id) {
    try {
      const movie = await MovieRepository.findById(id);

      if (!movie) {
        throw new APIErro(404, [{
          path: 'id',
          message: 'Filme não encontrado'
        }]);
      }

      return this._formatMovieForDetail(movie);

    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      throw new APIErro(500, [{
        path: 'server',
        message: 'Erro ao buscar filme'
      }]);
    }
  }

  /**
   * ✏️ Atualizar filme
   */
  async updateMovie(id, updateData, userId, userRole) {
    try {
      // Verificar se filme existe
      const movie = await MovieRepository.findById(id);

      if (!movie) {
        throw new APIErro(404, [{
          path: 'id',
          message: 'Filme não encontrado'
        }]);
      }

      // Verificar permissões
      if (!movie.canBeEditedBy(userId, userRole)) {
        throw new APIErro(403, [{
          path: 'permission',
          message: 'Você não tem permissão para editar este filme'
        }]);
      }

      // Validar regras de negócio se título ou ano mudaram
      if (updateData.title || updateData.releaseYear) {
        const titleToCheck = updateData.title || movie.title;
        const yearToCheck = updateData.releaseYear || movie.releaseYear;
        
        if (titleToCheck !== movie.title || yearToCheck !== movie.releaseYear) {
          const existingMovie = await MovieRepository.findByTitleAndYear(titleToCheck, yearToCheck);
          
          if (existingMovie && existingMovie._id.toString() !== id) {
            throw new APIErro(409, [{
              path: 'title',
              message: `Já existe outro filme com o título "${titleToCheck}" do ano ${yearToCheck}`
            }]);
          }
        }
      }

      // Validar dados de negócio
      if (updateData.title || updateData.synopsis || updateData.duration) {
        this._validateMovieBusinessRules(updateData, true);
      }

      // Preparar dados para atualização
      const dataToUpdate = {
        ...updateData,
        lastModifiedBy: userId
      };

      // Atualizar filme
      const updatedMovie = await MovieRepository.update(id, dataToUpdate);
      return this._formatMovieForDetail(updatedMovie);

    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      throw new APIErro(500, [{
        path: 'server',
        message: 'Erro ao atualizar filme'
      }]);
    }
  }

  /**
   * 🗑️ Deletar filme
   */
  async deleteMovie(id, userId, userRole) {
    try {
      const movie = await MovieRepository.findById(id);

      if (!movie) {
        throw new APIErro(404, [{
          path: 'id',
          message: 'Filme não encontrado'
        }]);
      }

      // Verificar permissões
      if (!movie.canBeEditedBy(userId, userRole)) {
        throw new APIErro(403, [{
          path: 'permission',
          message: 'Você não tem permissão para excluir este filme'
        }]);
      }

      await MovieRepository.delete(id);
      
      return {
        id: movie._id,
        title: movie.title
      };

    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      throw new APIErro(500, [{
        path: 'server',
        message: 'Erro ao excluir filme'
      }]);
    }
  }

  /**
   * 🔄 Alterar status do filme
   */
  async changeMovieStatus(id, newStatus, userId, userRole) {
    try {
      const movie = await MovieRepository.findById(id);

      if (!movie) {
        throw new APIErro(404, [{
          path: 'id',
          message: 'Filme não encontrado'
        }]);
      }

      // Verificar permissões
      if (!movie.canBeEditedBy(userId, userRole)) {
        throw new APIErro(403, [{
          path: 'permission',
          message: 'Você não tem permissão para alterar o status deste filme'
        }]);
      }

      // Validar mudança de status
      this._validateStatusChange(movie.status, newStatus);

      // Atualizar status
      const updatedMovie = await MovieRepository.update(id, {
        status: newStatus,
        lastModifiedBy: userId
      });

      return {
        id: updatedMovie._id,
        title: updatedMovie.title,
        previousStatus: movie.status,
        newStatus: newStatus,
        updatedAt: updatedMovie.updatedAt
      };

    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      throw new APIErro(500, [{
        path: 'server',
        message: 'Erro ao alterar status do filme'
      }]);
    }
  }

  /**
   * 📊 Obter estatísticas completas
   */
  async getMovieStatistics() {
    try {
      const [overviewStats, genreStats, yearStats] = await Promise.all([
        MovieRepository.getStats(),
        MovieRepository.getGenreStats(10),
        MovieRepository.getYearStats(10)
      ]);

      return {
        overview: overviewStats,
        topGenres: genreStats,
        recentYears: yearStats
      };

    } catch (error) {
      throw new APIErro(500, [{
        path: 'server',
        message: 'Erro ao obter estatísticas'
      }]);
    }
  }

  /**
   * 🔍 Pesquisar filmes avançada
   */
  async searchMovies(searchParams) {
    try {
      const { term, filters = {}, options = {} } = searchParams;
      
      if (!term || term.length < 2) {
        throw new APIErro(400, [{
          path: 'term',
          message: 'Termo de busca deve ter pelo menos 2 caracteres'
        }]);
      }

      return await MovieRepository.searchMovies(term, { ...filters, ...options });

    } catch (error) {
      if (error instanceof APIErro) {
        throw error;
      }
      throw new APIErro(500, [{
        path: 'server',
        message: 'Erro na pesquisa de filmes'
      }]);
    }
  }

  // ========================
  // MÉTODOS PRIVADOS
  // ========================

  /**
   * Validar regras específicas de negócio
   */
  _validateMovieBusinessRules(movieData, isUpdate = false) {
    // Validar duração mínima e máxima
    if (movieData.duration) {
      if (movieData.duration < 1) {
        throw new APIErro(400, [{
          path: 'duration',
          message: 'Duração deve ser pelo menos 1 minuto'
        }]);
      }
      if (movieData.duration > 600) { // 10 horas
        throw new APIErro(400, [{
          path: 'duration',
          message: 'Duração não pode exceder 600 minutos (10 horas)'
        }]);
      }
    }

    // Validar ano de lançamento
    if (movieData.releaseYear) {
      const currentYear = new Date().getFullYear();
      if (movieData.releaseYear > currentYear + 5) {
        throw new APIErro(400, [{
          path: 'releaseYear',
          message: `Ano de lançamento não pode ser superior a ${currentYear + 5}`
        }]);
      }
    }

    // Validar URLs obrigatórias
    if (!isUpdate) {
      if (!movieData.url) {
        throw new APIErro(400, [{
          path: 'url',
          message: 'URL do filme é obrigatória'
        }]);
      }
      if (!movieData.images?.poster) {
        throw new APIErro(400, [{
          path: 'images.poster',
          message: 'URL do poster é obrigatória'
        }]);
      }
      if (!movieData.trailer?.url) {
        throw new APIErro(400, [{
          path: 'trailer.url',
          message: 'URL do trailer é obrigatória'
        }]);
      }
    }

    // Validar elenco mínimo
    if (movieData.cast && movieData.cast.length === 0) {
      throw new APIErro(400, [{
        path: 'cast',
        message: 'Filme deve ter pelo menos 1 ator no elenco'
      }]);
    }

    // Validar gêneros mínimos
    if (movieData.genres && movieData.genres.length === 0) {
      throw new APIErro(400, [{
        path: 'genres',
        message: 'Filme deve ter pelo menos 1 gênero'
      }]);
    }
  }

  /**
   * Validar mudanças de status
   */
  _validateStatusChange(currentStatus, newStatus) {
    // Regras de transição de status
    const allowedTransitions = {
      'draft': ['published', 'archived'],
      'published': ['archived', 'draft'],
      'archived': ['draft']
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new APIErro(400, [{
        path: 'status',
        message: `Não é possível alterar status de "${currentStatus}" para "${newStatus}"`
      }]);
    }
  }

  /**
   * Formatar filme para listagem (resumido)
   */
  _formatMovieForList(movie) {
    return {
      id: movie._id,
      title: movie.title,
      synopsis: movie.synopsis?.substring(0, 200) + (movie.synopsis?.length > 200 ? '...' : ''),
      duration: movie.duration,
      releaseYear: movie.releaseYear,
      director: movie.director,
      genres: movie.genres,
      ageRating: movie.ageRating,
      status: movie.status,
      images: {
        poster: movie.images?.poster,
        backdrop: movie.images?.backdrop
      },
      createdBy: movie.createdBy,
      createdAt: movie.createdAt
    };
  }

  /**
   * Formatar filme para detalhes (completo)
   */
  _formatMovieForDetail(movie) {
    return {
      ...movie.toObject(),
      formattedDuration: movie.formattedDuration
    };
  }
}

export default new MovieService();