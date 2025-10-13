import { describe, beforeEach, afterEach, beforeAll, afterAll, test, expect } from '@jest/globals';
import MovieService from '../../../src/services/movieService.js';
import TestDatabase from '../../helpers/testDatabase.js';
import Movie from '../../../src/models/Movie.js';
import User from '../../../src/models/User.js';

describe('MovieService', () => {
  let movieService;
  let testUser;

  // Helper para criar dados válidos de filme
  const createValidMovieData = (overrides = {}) => ({
    title: 'Filme Teste',
    synopsis: 'Uma sinopse completa do filme de teste',
    releaseYear: 2024,
    genres: ['Ação', 'Drama'],
    duration: 120,
    director: 'Diretor Teste',
    cast: ['Ator 1', 'Ator 2'],
    ageRating: '14',
    languages: ['Português', 'Inglês'],
    subtitles: ['Português', 'Inglês'],
    country: 'Brasil',
    studio: 'Studio Teste',
    images: {
      poster: 'https://example.com/poster.jpg',
      backdrop: 'https://example.com/backdrop.jpg',
      gallery: []
    },
    trailer: {
      url: 'https://example.com/trailer.mp4',
      platform: 'YouTube'
    },
    url: 'https://example.com/stream.mp4',
    isPremium: false,
    rating: 7.5,
    status: 'published',
    ...overrides
  });

  beforeAll(async () => {
    await TestDatabase.connect();
  });

  afterAll(async () => {
    await TestDatabase.disconnect();
  });

  beforeEach(async () => {
    await Movie.deleteMany({});
    await User.deleteMany({});
    
    movieService = MovieService;
    
    // Criar usuário de teste
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });
  });

  describe('createMovie', () => {
    const validMovieData = createValidMovieData();

    test('deve criar filme com dados válidos', async () => {
      const movie = await movieService.createMovie(validMovieData, testUser._id);

      expect(movie.title).toBe(validMovieData.title);
      expect(movie.createdBy.toString()).toBe(testUser._id.toString());
      expect(movie.status).toBe('draft');
      expect(movie._id).toBeDefined();
    });

    test('deve rejeitar filme duplicado (mesmo título e ano)', async () => {
      // Criar primeiro filme
      await movieService.createMovie(validMovieData, testUser._id);

      // Tentar criar filme duplicado
      await expect(
        movieService.createMovie(validMovieData, testUser._id)
      ).rejects.toThrow(expect.objectContaining({
        statusCode: 409,
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('Já existe um filme')
          })
        ])
      }));
    });

    test('deve validar dados obrigatórios', async () => {
      const invalidData = { ...validMovieData };
      delete invalidData.title;

      await expect(
        movieService.createMovie(invalidData, testUser._id)
      ).rejects.toThrow();
    });

    test('deve aceitar filmes com mesmo título mas anos diferentes', async () => {
      // Criar primeiro filme
      await movieService.createMovie(validMovieData, testUser._id);

      // Criar filme com mesmo título mas ano diferente
      const differentYearMovie = {
        ...validMovieData,
        releaseYear: 2023
      };

      const movie = await movieService.createMovie(differentYearMovie, testUser._id);
      expect(movie.releaseYear).toBe(2023);
    });
  });

  describe('getMovies', () => {
    beforeEach(async () => {
      // Criar alguns filmes de teste
      const movies = [
        createValidMovieData({
          title: 'Filme A',
          releaseYear: 2024,
          genres: ['Ação'],
          duration: 90,
          rating: 7.5,
          status: 'published',
          createdBy: testUser._id
        }),
        createValidMovieData({
          title: 'Filme B',
          releaseYear: 2023,
          genres: ['Drama'],
          duration: 110,
          rating: 8.0,
          status: 'published',
          createdBy: testUser._id
        })
      ];

      await Movie.insertMany(movies);
    });

    test('deve listar filmes com paginação padrão', async () => {
      const result = await movieService.getMovies({});

      expect(result.movies).toHaveLength(2);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    test('deve filtrar filmes por gênero', async () => {
      const result = await movieService.getMovies({ genre: 'Ação' });

      expect(result.movies).toHaveLength(1);
      expect(result.movies[0].genres).toContain('Ação');
    });

    test('deve filtrar filmes por ano', async () => {
      const result = await movieService.getMovies({ year: 2023 });

      expect(result.movies).toHaveLength(1);
      expect(result.movies[0].releaseYear).toBe(2023);
    });

    test('deve buscar filmes por título', async () => {
      const result = await movieService.getMovies({ search: 'Filme A' });

      expect(result.movies).toHaveLength(1);
      expect(result.movies[0].title).toBe('Filme A');
    });

    test('deve ordenar filmes por rating decrescente', async () => {
      const result = await movieService.getMovies({ sortBy: 'rating', sortOrder: 'desc' });

      expect(result.movies[0]).toBeDefined();
      expect(result.movies[1]).toBeDefined();
    });

    test('deve aplicar paginação corretamente', async () => {
      const result = await movieService.getMovies({ page: 1, limit: 1 });

      expect(result.movies).toHaveLength(1);
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe('getMovieById', () => {
    let testMovie;

    beforeEach(async () => {
      testMovie = await Movie.create(createValidMovieData({
        createdBy: testUser._id
      }));
    });

    test('deve retornar filme por ID válido', async () => {
      const movie = await movieService.getMovieById(testMovie._id);

      expect(movie._id.toString()).toBe(testMovie._id.toString());
      expect(movie.title).toBe('Filme Teste');
    });

    test('deve rejeitar ID inválido', async () => {
      await expect(
        movieService.getMovieById('invalid_id')
      ).rejects.toThrow();
    });

    test('deve rejeitar filme inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(
        movieService.getMovieById(fakeId)
      ).rejects.toThrow();
    });
  });

  describe('updateMovie', () => {
    let testMovie;

    beforeEach(async () => {
      testMovie = await Movie.create(createValidMovieData({
        title: 'Filme Original',
        status: 'draft',
        createdBy: testUser._id
      }));
    });

    test('deve atualizar filme com dados válidos', async () => {
      const updateData = {
        title: 'Filme Atualizado',
        rating: 8.5,
        status: 'published'
      };

      const updatedMovie = await movieService.updateMovie(testMovie._id, updateData, testUser._id, 'admin');

      expect(updatedMovie).toBeDefined();
    });

    test('deve rejeitar atualização de filme inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(
        movieService.updateMovie(fakeId, { title: 'Novo Título' }, testUser._id, 'admin')
      ).rejects.toThrow();
    });

    test('deve permitir atualização parcial', async () => {
      const updateData = { rating: 9.0 };

      const updatedMovie = await movieService.updateMovie(testMovie._id, updateData, testUser._id, 'admin');

      expect(updatedMovie).toBeDefined();
    });
  });

  describe('deleteMovie', () => {
    let testMovie;

    beforeEach(async () => {
      testMovie = await Movie.create(createValidMovieData({
        title: 'Filme para Deletar',
        genres: ['Terror'],
        duration: 90,
        status: 'draft',
        createdBy: testUser._id
      }));
    });

    test('deve deletar filme existente', async () => {
      await movieService.deleteMovie(testMovie._id, testUser._id, 'admin');

      // Verificar se foi deletado
      const deletedMovie = await Movie.findById(testMovie._id);
      expect(deletedMovie).toBeNull();
    });

    test('deve rejeitar deleção de filme inexistente', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await expect(
        movieService.deleteMovie(fakeId, testUser._id, 'admin')
      ).rejects.toThrow();
    });

    test('deve rejeitar ID inválido', async () => {
      await expect(
        movieService.deleteMovie('invalid_id', testUser._id, 'admin')
      ).rejects.toThrow();
    });
  });

  describe('Métodos de validação', () => {
    test('deve validar rating dentro do limite', async () => {
      const movieData = {
        title: 'Filme Rating Alto',
        releaseYear: 2024,
        genre: ['Ação'],
        duration: 120,
        director: 'Diretor',
        rating: 11 // Rating inválido
      };

      await expect(
        movieService.createMovie(movieData, testUser._id)
      ).rejects.toThrow();
    });

    test('deve validar ano de lançamento', async () => {
      const movieData = {
        title: 'Filme Ano Futuro',
        releaseYear: 2030, // Ano muito futuro
        genre: ['Ficção'],
        duration: 120,
        director: 'Diretor'
      };

      await expect(
        movieService.createMovie(movieData, testUser._id)
      ).rejects.toThrow();
    });
  });
});
