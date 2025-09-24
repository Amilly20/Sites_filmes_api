// Configuração Swagger principal para importar rotas e schemas
import usuarioCadastrar from '../routes/users/userRegister.js';
import userRegisterSchemas from '../schemas/users/userRegister.js';
import authLogin from '../routes/auth/authLogin.js';
import authSchemas from '../schemas/auth/authSchemas.js';

const getSwaggerOptions = () => ({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sites Filmes',
      version: '1.0.0',
      description: 'Documentação da API para cadastro de usuários e outros recursos.'
    },
    servers: [
      { url: process.env.SWAGGER_DEV_URL || 'http://localhost:3000/api' }
    ],
    tags: [
      { name: 'Autenticacao', description: 'Operações de autenticação' },
      { name: 'Usuario', description: 'Operações de usuário' }
    ],
    paths: {
      ...authLogin,
      ...usuarioCadastrar
    },
    components: {
      schemas: {
        ...userRegisterSchemas,
        ...authSchemas
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [] // Não precisamos de arquivos adicionais pois já temos tudo definido
});

export default getSwaggerOptions;
