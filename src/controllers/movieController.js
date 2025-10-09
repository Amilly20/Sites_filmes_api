import MovieService from '../services/movieService.js';
import { APIErro } from '../utils/ApiError.js';
import { validationResult } from 'express-validator';

/**
 * 🎬 Controller de Filmes - RF25
 * Gerencia o cadastro e manutenção de filmes por administradores
 */
class MovieController {

  /**
   * 📝 Criar novo filme
   */
  static async createMovie(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new APIErro(400, errors.array());
      }

      const movie = await MovieService.createMovie(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Filme cadastrado com sucesso',
        data: {
          movie: {
            id: movie._id,
            title: movie.title,
            synopsis: movie.synopsis,
            duration: movie.duration,
            formattedDuration: movie.formattedDuration,
            releaseYear: movie.releaseYear,
            genres: movie.genres,
            ageRating: movie.ageRating,
            status: movie.status,
            createdAt: movie.createdAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 📋 Listar filmes com filtros
   */
  static async getMovies(req, res, next) {
    try {
      const result = await MovieService.getMovies(req.query);

      res.status(200).json({
        success: true,
        message: 'Filmes obtidos com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔍 Obter filme específico
   */
  static async getMovieById(req, res, next) {
    try {
      const { id } = req.params;
      const movie = await MovieService.getMovieById(id);

      res.status(200).json({
        success: true,
        message: 'Filme obtido com sucesso',
        data: { movie }
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return next(new APIErro(400, [{
          path: 'id',
          message: 'ID do filme inválido'
        }]));
      }
      next(error);
    }
  }

  /**
   * ✏️ Atualizar filme
   */
  static async updateMovie(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new APIErro(400, errors.array());
      }

      const { id } = req.params;
      const movie = await MovieService.updateMovie(id, req.body, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        message: 'Filme atualizado com sucesso',
        data: { movie }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🗑️ Deletar filme
   */
  static async deleteMovie(req, res, next) {
    try {
      const { id } = req.params;
      const deletedMovie = await MovieService.deleteMovie(id, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        message: 'Filme excluído com sucesso',
        data: { deletedMovie }
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return next(new APIErro(400, [{
          path: 'id',
          message: 'ID do filme inválido'
        }]));
      }
      next(error);
    }
  }

  /**
   * 📊 Obter estatísticas de filmes
   */
  static async getMovieStats(req, res, next) {
    try {
      const stats = await Movie.aggregate([
        {
          $group: {
            _id: null,
            totalMovies: { $sum: 1 },
            publishedMovies: {
              $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
            },
            draftMovies: {
              $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
            },
            archivedMovies: {
              $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
            },
            avgDuration: { $avg: '$duration' },
            totalGenres: { $addToSet: '$genres' }
          }
        }
      ]);

      const genreStats = await Movie.aggregate([
        { $unwind: '$genres' },
        { $group: { _id: '$genres', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      const yearStats = await Movie.aggregate([
        { $group: { _id: '$releaseYear', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 10 }
      ]);

      res.status(200).json({
        success: true,
        message: 'Estatísticas de filmes obtidas com sucesso',
        data: {
          overview: stats[0] || {
            totalMovies: 0,
            publishedMovies: 0,
            draftMovies: 0,
            archivedMovies: 0,
            avgDuration: 0
          },
          topGenres: genreStats,
          recentYears: yearStats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 🔄 Alterar status do filme
   */
  static async changeMovieStatus(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new APIErro(400, errors.array());
      }

      const { id } = req.params;
      const { status } = req.body;
      
      const updatedMovie = await MovieService.changeMovieStatus(id, status, req.user.id, req.user.role);

      res.status(200).json({
        success: true,
        message: `Status do filme alterado para "${status}" com sucesso`,
        data: { movie: updatedMovie }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MovieController;