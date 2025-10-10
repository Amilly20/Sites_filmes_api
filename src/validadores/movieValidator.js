import { body, param, query } from 'express-validator';

/**
 * 🎬 Validadores para RF25 - Sistema de Cadastro de Filmes
 * Validações completas para todos os campos obrigatórios
 */

/**
 * Validação para criação de filme
 */
export const validateCreateMovie = [
  // Título
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres')
    .trim(),

  // Sinopse
  body('synopsis')
    .notEmpty()
    .withMessage('Sinopse é obrigatória')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Sinopse deve ter entre 10 e 2000 caracteres')
    .trim(),

  // Duração
  body('duration')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Duração deve ser um número inteiro entre 1 e 1000 minutos'),

  // Ano de lançamento
  body('releaseYear')
    .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
    .withMessage(`Ano deve estar entre 1900 e ${new Date().getFullYear() + 5}`),

  // Elenco
  body('cast')
    .isArray({ min: 1 })
    .withMessage('Elenco deve ser um array com pelo menos 1 ator'),
  body('cast.*')
    .notEmpty()
    .withMessage('Nome do ator não pode estar vazio')
    .isLength({ max: 100 })
    .withMessage('Nome do ator deve ter no máximo 100 caracteres')
    .trim(),

  // Diretor
  body('director')
    .notEmpty()
    .withMessage('Diretor é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do diretor deve ter entre 2 e 100 caracteres')
    .trim(),

  // Gêneros
  body('genres')
    .isArray({ min: 1 })
    .withMessage('Gêneros devem ser um array com pelo menos 1 gênero'),
  body('genres.*')
    .isIn([
      'Ação', 'Aventura', 'Comédia', 'Drama', 'Terror', 'Ficção Científica',
      'Romance', 'Thriller', 'Documentário', 'Animação', 'Fantasia',
      'Crime', 'Mistério', 'Guerra', 'Western', 'Musical', 'Biografia',
      'História', 'Esporte', 'Família'
    ])
    .withMessage('Gênero inválido'),

  // Classificação etária
  body('ageRating')
    .isIn(['L', '10', '12', '14', '16', '18'])
    .withMessage('Classificação etária deve ser: L, 10, 12, 14, 16 ou 18'),

  // Idiomas
  body('languages')
    .isArray({ min: 1 })
    .withMessage('Idiomas devem ser um array com pelo menos 1 idioma'),
  body('languages.*')
    .notEmpty()
    .withMessage('Idioma não pode estar vazio')
    .isLength({ min: 2, max: 50 })
    .withMessage('Idioma deve ter entre 2 e 50 caracteres')
    .trim(),

  // Legendas
  body('subtitles')
    .isArray({ min: 1 })
    .withMessage('Legendas devem ser um array com pelo menos 1 opção'),
  body('subtitles.*')
    .notEmpty()
    .withMessage('Legenda não pode estar vazia')
    .isLength({ min: 2, max: 50 })
    .withMessage('Legenda deve ter entre 2 e 50 caracteres')
    .trim(),

  // País
  body('country')
    .notEmpty()
    .withMessage('País é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('País deve ter entre 2 e 100 caracteres')
    .trim(),

  // Estúdio
  body('studio')
    .notEmpty()
    .withMessage('Estúdio é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Estúdio deve ter entre 2 e 100 caracteres')
    .trim(),

  // Imagens
  body('images')
    .isObject()
    .withMessage('Imagens devem ser um objeto'),
  body('images.poster')
    .notEmpty()
    .withMessage('URL do poster é obrigatória')
    .isURL()
    .withMessage('URL do poster deve ser válida'),
  body('images.backdrop')
    .notEmpty()
    .withMessage('URL do backdrop é obrigatória')
    .isURL()
    .withMessage('URL do backdrop deve ser válida'),
  body('images.gallery')
    .optional()
    .isArray()
    .withMessage('Galeria deve ser um array de URLs'),
  body('images.gallery.*')
    .optional()
    .isURL()
    .withMessage('Cada URL da galeria deve ser válida'),

  // Trailer
  body('trailer')
    .isObject()
    .withMessage('Trailer deve ser um objeto'),
  body('trailer.url')
    .notEmpty()
    .withMessage('URL do trailer é obrigatória')
    .isURL()
    .withMessage('URL do trailer deve ser válida'),
  body('trailer.platform')
    .optional()
    .isIn(['YouTube', 'Vimeo', 'Local'])
    .withMessage('Plataforma do trailer deve ser: YouTube, Vimeo ou Local'),

  // URL do filme
  body('url')
    .notEmpty()
    .withMessage('URL do filme é obrigatória')
    .isURL()
    .withMessage('URL do filme deve ser válida'),

  // URL de download (opcional)
  body('downloadUrl')
    .optional()
    .isURL()
    .withMessage('URL de download deve ser válida'),

  // Premium (opcional)
  body('isPremium')
    .optional()
    .isBoolean()
    .withMessage('isPremium deve ser true ou false')
];

/**
 * Validação para atualização de filme
 */
export const validateUpdateMovie = [
  // Título (opcional na atualização)
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres')
    .trim(),

  // Sinopse (opcional na atualização)
  body('synopsis')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Sinopse deve ter entre 10 e 2000 caracteres')
    .trim(),

  // Duração
  body('duration')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Duração deve ser um número inteiro entre 1 e 1000 minutos'),

  // Ano de lançamento
  body('releaseYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
    .withMessage(`Ano deve estar entre 1900 e ${new Date().getFullYear() + 5}`),

  // Elenco
  body('cast')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Elenco deve ser um array com pelo menos 1 ator'),
  body('cast.*')
    .optional()
    .notEmpty()
    .withMessage('Nome do ator não pode estar vazio')
    .isLength({ max: 100 })
    .withMessage('Nome do ator deve ter no máximo 100 caracteres')
    .trim(),

  // Diretor
  body('director')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do diretor deve ter entre 2 e 100 caracteres')
    .trim(),

  // Gêneros
  body('genres')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Gêneros devem ser um array com pelo menos 1 gênero'),
  body('genres.*')
    .optional()
    .isIn([
      'Ação', 'Aventura', 'Comédia', 'Drama', 'Terror', 'Ficção Científica',
      'Romance', 'Thriller', 'Documentário', 'Animação', 'Fantasia',
      'Crime', 'Mistério', 'Guerra', 'Western', 'Musical', 'Biografia',
      'História', 'Esporte', 'Família'
    ])
    .withMessage('Gênero inválido'),

  // Classificação etária
  body('ageRating')
    .optional()
    .isIn(['L', '10', '12', '14', '16', '18'])
    .withMessage('Classificação etária deve ser: L, 10, 12, 14, 16 ou 18'),

  // Status
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status deve ser: draft, published ou archived'),

  // Outros campos opcionais seguem o mesmo padrão...
];

/**
 * Validação para mudança de status
 */
export const validateChangeStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status é obrigatório')
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status deve ser: draft, published ou archived')
];

/**
 * Validação de parâmetros de rota
 */
export const validateMovieId = [
  param('id')
    .isMongoId()
    .withMessage('ID do filme deve ser um ObjectId válido')
];

/**
 * Validação de query parameters para listagem
 */
export const validateMovieQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
  
  query('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status deve ser: draft, published ou archived'),
  
  query('genre')
    .optional()
    .isIn([
      'Ação', 'Aventura', 'Comédia', 'Drama', 'Terror', 'Ficção Científica',
      'Romance', 'Thriller', 'Documentário', 'Animação', 'Fantasia',
      'Crime', 'Mistério', 'Guerra', 'Western', 'Musical', 'Biografia',
      'História', 'Esporte', 'Família'
    ])
    .withMessage('Gênero inválido'),
  
  query('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
    .withMessage('Ano deve ser válido'),
  
  query('ageRating')
    .optional()
    .isIn(['L', '10', '12', '14', '16', '18'])
    .withMessage('Classificação etária inválida'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres')
    .trim(),
  
  query('sortBy')
    .optional()
    .isIn(['title', 'releaseYear', 'createdAt', 'updatedAt', 'duration'])
    .withMessage('Campo de ordenação inválido'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordem deve ser: asc ou desc')
];

/**
 * Conjunto de validações para diferentes operações
 */
export const movieValidations = {
  create: validateCreateMovie,
  update: [...validateMovieId, ...validateUpdateMovie],
  delete: validateMovieId,
  getById: validateMovieId,
  list: validateMovieQuery,
  changeStatus: [...validateMovieId, ...validateChangeStatus]
};
