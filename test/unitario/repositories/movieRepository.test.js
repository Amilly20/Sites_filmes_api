import { describe, beforeEach, afterEach, test, expect, jest } from '@jest/globals';

const mockMovie = jest.fn();
Object.assign(mockMovie, {
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  aggregate: jest.fn(),
  updateMany: jest.fn(),
  deleteMany: jest.fn()
});

// Mock modules before imports
jest.unstable_mockModule('../../../src/models/Movie.js', () => ({
  default: mockMovie
}));

const movieRepository = (await import('../../../src/repositories/movieRepository.js')).default;
const TestDatabase = (await import('../../helpers/testDatabase.js')).default;

describe('🎬 MovieRepository', () => {
  let testMovie;

  beforeEach(async () => {
    await TestDatabase.clearDatabase();
    
    // Reset mocks
    jest.clearAllMocks();

    // Sample movie data
    testMovie = {
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

    // Setup query chain mock
    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(testMovie)
    };

    // Setup default mock returns
    mockMovie.findById.mockReturnValue(mockQuery);
    mockMovie.findOne.mockReturnValue(mockQuery);
    mockMovie.find.mockReturnValue(mockQuery);
    mockMovie.findByIdAndUpdate.mockReturnValue(mockQuery);
    mockMovie.findByIdAndDelete.mockReturnValue(mockQuery);
    mockMovie.countDocuments.mockResolvedValue(1);
    mockMovie.aggregate.mockResolvedValue([testMovie]);
  });

  afterEach(async () => {
    await TestDatabase.clearDatabase();
  });

  describe('✅ create', () => {
    test('deve criar um novo filme', async () => {
      const movieData = { title: 'Novo Filme', genre: 'Action' };
      const savedMovie = { ...movieData, _id: 'newMovie123' };
      
      const mockSave = jest.fn().mockResolvedValue(savedMovie);
      mockMovie.mockImplementation(() => ({ save: mockSave }));

      const result = await movieRepository.create(movieData);
      expect(result).toEqual(savedMovie);
    });
  });

  describe('🔍 findById', () => {
    test('deve buscar filme por ID', async () => {
      const result = await movieRepository.findById('movie123');
      expect(mockMovie.findById).toHaveBeenCalledWith('movie123');
      // Repository methods return the result of the query chain
      expect(result).toBeDefined();
    });
  });

  describe('📋 findWithFilters', () => {
    test('deve buscar filmes com filtros', async () => {
      const result = await movieRepository.findWithFilters({ genre: 'Action' });
      expect(mockMovie.find).toHaveBeenCalledWith({ genre: 'Action' });
      expect(result).toBeDefined();
    });
  });

  describe('✏️ update', () => {
    test('deve atualizar filme por ID', async () => {
      const result = await movieRepository.update('movie123', { title: 'Novo Título' });
      expect(result).toBeDefined();
    });
  });

  describe('🗑️ delete', () => {
    test('deve deletar filme por ID', async () => {
      const result = await movieRepository.delete('movie123');
      expect(result).toBeDefined();
    });
  });

  describe('📊 countBy', () => {
    test('deve contar filmes por filtro', async () => {
      const result = await movieRepository.countBy({ status: 'published' });
      expect(result).toBe(1);
    });
  });
});
