import { describe, beforeEach, afterEach, test, expect, jest } from '@jest/globals';

const mockMovieService = {
  createMovie: jest.fn(),
  getMovies: jest.fn(),
  getMovieById: jest.fn(),
  updateMovie: jest.fn(),
  deleteMovie: jest.fn()
};

const mockValidationResult = jest.fn();

// Mock modules before imports
jest.unstable_mockModule('../../../src/services/movieService.js', () => ({
  default: mockMovieService
}));

jest.unstable_mockModule('express-validator', () => ({
  validationResult: mockValidationResult
}));

const MovieController = (await import('../../../src/controllers/movieController.js')).default;
const { APIError } = await import('../../../src/utils/ApiError.js');

describe('🎬 MovieController', () => {
  let req, res, next;
  let mockMovie;

  beforeEach(() => {
    // Setup request mock
    req = {
      body: {},
      query: {},
      params: {},
      user: { id: 'user123', role: 'admin' }
    };

    // Setup response mock
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    // Setup next mock
    next = jest.fn();

    // Sample movie data
    mockMovie = {
      _id: 'movie123',
      title: 'Filme Teste',
      synopsis: 'Sinopse do filme teste',
      duration: 120,
      releaseYear: 2023,
      genres: ['Drama', 'Ação'],
      ageRating: 'PG-13',
      status: 'published',
      rating: 8.5,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('📝 createMovie', () => {
    test('deve criar filme com sucesso', async () => {
      req.body = {
        title: 'Novo Filme',
        synopsis: 'Sinopse do novo filme',
        duration: 120,
        releaseYear: 2023,
        genres: ['Drama'],
        ageRating: 'PG-13'
      };

      mockValidationResult.mockReturnValue({ isEmpty: () => true });
      mockMovieService.createMovie.mockResolvedValue(mockMovie);

      await MovieController.createMovie(req, res, next);

      expect(mockMovieService.createMovie).toHaveBeenCalledWith(req.body, req.user.id);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.any(String),
        data: expect.objectContaining({
          movie: expect.objectContaining({
            title: mockMovie.title,
            synopsis: mockMovie.synopsis,
            duration: mockMovie.duration
          })
        })
      }));
    });

    test('deve retornar erro de validação', async () => {
      const validationErrors = [
        { msg: 'Título é obrigatório', param: 'title' },
        { msg: 'Sinopse é obrigatória', param: 'synopsis' }
      ];

      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => validationErrors
      });

      await MovieController.createMovie(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(APIError));
      expect(mockMovieService.createMovie).not.toHaveBeenCalled();
    });
  });

  describe('📋 getMovies', () => {
    test('deve listar filmes com sucesso', async () => {
      const moviesResponse = {
        movies: [mockMovie],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      mockMovieService.getMovies.mockResolvedValue(moviesResponse);

      await MovieController.getMovies(req, res, next);

      expect(mockMovieService.getMovies).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.any(String),
        data: moviesResponse
      }));
    });
  });

  describe('🔍 getMovieById', () => {
    test('deve retornar filme por ID com sucesso', async () => {
      req.params.id = 'movie123';
      mockMovieService.getMovieById.mockResolvedValue(mockMovie);

      await MovieController.getMovieById(req, res, next);

      expect(mockMovieService.getMovieById).toHaveBeenCalledWith('movie123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.any(String),
        data: expect.objectContaining({
          movie: expect.objectContaining({
            title: mockMovie.title,
            synopsis: mockMovie.synopsis
          })
        })
      }));
    });
  });
});
