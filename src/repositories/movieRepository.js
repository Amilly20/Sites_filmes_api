import Movie from '../models/Movie.js';

/**
 * 🎬 Repository de Filmes - RF25
 * Responsável por toda interação com o banco de dados relacionada a filmes
 */
class MovieRepository {

  /**
   * 📝 Criar novo filme
   */
  async create(movieData) {
    const movie = new Movie(movieData);
    return await movie.save();
  }

  /**
   * 🔍 Buscar filme por ID
   */
  async findById(id) {
    return await Movie.findById(id)
      .populate('createdBy', 'name username role')
      .populate('lastModifiedBy', 'name username role');
  }

  /**
   * 🔍 Buscar filme por título e ano (para verificar duplicatas)
   */
  async findByTitleAndYear(title, year) {
    return await Movie.findOne({ 
      title: { $regex: new RegExp(`^${title}$`, 'i') }, 
      releaseYear: year 
    });
  }

  /**
   * 📋 Listar filmes com filtros e paginação
   */
  async findWithFilters(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sortBy]: sortOrder };

    const movies = await Movie.find(filters)
      .populate('createdBy', 'name username')
      .populate('lastModifiedBy', 'name username')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Movie.countDocuments(filters);

    return {
      movies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    };
  }

  /**
   * ✏️ Atualizar filme
   */
  async update(id, updateData) {
    return await Movie.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('createdBy', 'name username role')
     .populate('lastModifiedBy', 'name username role');
  }

  /**
   * 🗑️ Deletar filme
   */
  async delete(id) {
    return await Movie.findByIdAndDelete(id);
  }

  /**
   * 📊 Obter estatísticas gerais
   */
  async getStats() {
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
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    return stats[0] || {
      totalMovies: 0,
      publishedMovies: 0,
      draftMovies: 0,
      archivedMovies: 0,
      avgDuration: 0
    };
  }

  /**
   * 📊 Obter estatísticas por gênero
   */
  async getGenreStats(limit = 10) {
    return await Movie.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
  }

  /**
   * 📊 Obter estatísticas por ano
   */
  async getYearStats(limit = 10) {
    return await Movie.aggregate([
      { $group: { _id: '$releaseYear', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: limit }
    ]);
  }

  /**
   * 🔍 Buscar filmes por gênero
   */
  async findByGenre(genre, options = {}) {
    const filters = { genres: { $in: [genre] } };
    return await this.findWithFilters(filters, options);
  }

  /**
   * 🔍 Buscar filmes por ano
   */
  async findByYear(year, options = {}) {
    const filters = { releaseYear: year };
    return await this.findWithFilters(filters, options);
  }

  /**
   * 🔍 Buscar filmes por status
   */
  async findByStatus(status, options = {}) {
    const filters = { status };
    return await this.findWithFilters(filters, options);
  }

  /**
   * 🔍 Buscar filmes por diretor
   */
  async findByDirector(director, options = {}) {
    const filters = { 
      director: { $regex: new RegExp(director, 'i') }
    };
    return await this.findWithFilters(filters, options);
  }

  /**
   * 🔍 Buscar filmes por classificação etária
   */
  async findByAgeRating(ageRating, options = {}) {
    const filters = { ageRating };
    return await this.findWithFilters(filters, options);
  }

  /**
   * 🔍 Buscar filmes criados por usuário específico
   */
  async findByCreator(userId, options = {}) {
    const filters = { createdBy: userId };
    return await this.findWithFilters(filters, options);
  }

  /**
   * 🔍 Pesquisa textual (título, sinopse, diretor, elenco)
   */
  async searchMovies(searchTerm, options = {}) {
    const filters = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { synopsis: { $regex: searchTerm, $options: 'i' } },
        { director: { $regex: searchTerm, $options: 'i' } },
        { cast: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    };
    return await this.findWithFilters(filters, options);
  }

  /**
   * 📊 Contar filmes por critério
   */
  async countBy(filters = {}) {
    return await Movie.countDocuments(filters);
  }

  /**
   * 🔄 Alterar status de múltiplos filmes
   */
  async updateManyStatus(ids, status, userId) {
    return await Movie.updateMany(
      { _id: { $in: ids } },
      { 
        status, 
        lastModifiedBy: userId,
        updatedAt: new Date()
      }
    );
  }

  /**
   * 🗑️ Deletar múltiplos filmes
   */
  async deleteMany(ids) {
    return await Movie.deleteMany({ _id: { $in: ids } });
  }

  /**
   * 📋 Obter filmes recentes
   */
  async findRecent(limit = 10, status = null) {
    const filters = status ? { status } : {};
    return await Movie.find(filters)
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * 📋 Obter filmes populares (baseado em algum critério futuro)
   */
  async findPopular(limit = 10) {
    return await Movie.find({ status: 'published' })
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 }) // Por enquanto ordenar por mais recente
      .limit(limit)
      .lean();
  }

  /**
   * 🔍 Verificar se usuário pode editar filme
   */
  async canUserEdit(movieId, userId, userRole) {
    if (userRole === 'admin') return true;
    
    const movie = await Movie.findById(movieId).select('createdBy');
    return movie && movie.createdBy.toString() === userId.toString();
  }
}

export default new MovieRepository();
