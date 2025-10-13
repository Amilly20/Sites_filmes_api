import express from 'express';
import MovieController from '../controllers/movieController.js';
import authentication from '../middlewares/authMiddlewares.js';
import isAdmin from '../middlewares/isAdmin.js';
import { movieValidations } from '../validadores/movieValidator.js';

const router = express.Router();

/**
 * 🎬 ROTAS DE GERENCIAMENTO DE FILMES - RF25
 * 
 * Sistema completo para administradores cadastrarem e gerenciarem filmes
 * Todas as rotas requerem autenticação de administrador
 */

// Middleware base: todas as rotas precisam de autenticação + permissão de admin
router.use(authentication, isAdmin);

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - title
 *         - synopsis
 *         - duration
 *         - releaseYear
 *         - cast
 *         - director
 *         - genres
 *         - ageRating
 *         - languages
 *         - subtitles
 *         - country
 *         - studio
 *         - images
 *         - trailer
 *         - url
 *       properties:
 *         title:
 *           type: string
 *           description: Título do filme
 *           maxLength: 200
 *         synopsis:
 *           type: string
 *           description: Sinopse do filme
 *           maxLength: 2000
 *         duration:
 *           type: integer
 *           description: Duração em minutos
 *           minimum: 1
 *         releaseYear:
 *           type: integer
 *           description: Ano de lançamento
 *           minimum: 1900
 *         cast:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista do elenco
 *         director:
 *           type: string
 *           description: Nome do diretor
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *             enum: [Ação, Aventura, Comédia, Drama, Terror, Ficção Científica, Romance, Thriller, Documentário, Animação, Fantasia, Crime, Mistério, Guerra, Western, Musical, Biografia, História, Esporte, Família]
 *         ageRating:
 *           type: string
 *           enum: [L, 10, 12, 14, 16, 18]
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *         subtitles:
 *           type: array
 *           items:
 *             type: string
 *         country:
 *           type: string
 *         studio:
 *           type: string
 *         images:
 *           type: object
 *           required: [poster, backdrop]
 *           properties:
 *             poster:
 *               type: string
 *               format: url
 *             backdrop:
 *               type: string
 *               format: url
 *             gallery:
 *               type: array
 *               items:
 *                 type: string
 *                 format: url
 *         trailer:
 *           type: object
 *           required: [url]
 *           properties:
 *             url:
 *               type: string
 *               format: url
 *             platform:
 *               type: string
 *               enum: [YouTube, Vimeo, Local]
 *         url:
 *           type: string
 *           format: url
 *         downloadUrl:
 *           type: string
 *           format: url
 *         isPremium:
 *           type: boolean
 *           default: false
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           default: draft
 */

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Cadastrar novo filme
 *     description: Permite que administradores cadastrem novos filmes no sistema
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       201:
 *         description: Filme cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado - apenas administradores
 *       409:
 *         description: Filme já existe
 */
router.post('/', 
  movieValidations.create,
  MovieController.createMovie
);

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Listar filmes com filtros
 *     description: Obtém lista de filmes com filtros e paginação
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: ageRating
 *         schema:
 *           type: string
 *           enum: [L, 10, 12, 14, 16, 18]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, releaseYear, createdAt, updatedAt, duration]
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Lista de filmes obtida com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/', 
  movieValidations.list,
  MovieController.getMovies
);

/**
 * @swagger
 * /api/movies/stats:
 *   get:
 *     summary: Obter estatísticas de filmes
 *     description: Retorna estatísticas gerais sobre os filmes cadastrados
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/stats', 
  MovieController.getMovieStats
);

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Obter filme específico
 *     description: Retorna detalhes completos de um filme
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filme obtido com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Filme não encontrado
 */
router.get('/:id', 
  movieValidations.getById,
  MovieController.getMovieById
);

/**
 * @swagger
 * /api/movies/{id}:
 *   put:
 *     summary: Atualizar filme
 *     description: Atualiza dados de um filme existente
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       200:
 *         description: Filme atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para editar
 *       404:
 *         description: Filme não encontrado
 */
router.put('/:id', 
  movieValidations.update,
  MovieController.updateMovie
);

/**
 * @swagger
 * /api/movies/{id}:
 *   delete:
 *     summary: Excluir filme
 *     description: Remove um filme do sistema
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filme excluído com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para excluir
 *       404:
 *         description: Filme não encontrado
 */
router.delete('/:id', 
  movieValidations.delete,
  MovieController.deleteMovie
);

/**
 * @swagger
 * /api/movies/{id}/status:
 *   patch:
 *     summary: Alterar status do filme
 *     description: Altera o status de publicação de um filme
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: Status alterado com sucesso
 *       400:
 *         description: Status inválido
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Filme não encontrado
 */
router.patch('/:id/status', 
  movieValidations.changeStatus,
  MovieController.changeMovieStatus
);

export default router;
