// Configuração Swagger principal para importar rotas e schemas
import usuarioCadastrar from '../routes/users/userRegister.js';
import userRegisterSchemas from '../schemas/users/userRegister.js';
import authLogin from '../routes/auth/authLogin.js';
import { forgotPassword, resetPassword } from '../routes/auth/passwordReset.js';
import authSchemas from '../schemas/auth/authSchemas.js';

// Importar documentação de planos
import planSchemas from '../schemas/plans/planSchemas.js';
import listPlans from '../routes/plans/listPlans.js';
import getMyPlan from '../routes/plans/getMyPlan.js';
import changePlan from '../routes/plans/changePlan.js';
import registerDownload from '../routes/plans/registerDownload.js';
import adsConfig from '../routes/plans/adsConfig.js';

const getSwaggerOptions = () => ({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sites Filmes',
      version: '1.0.0',
      description: 'Documentação da API para cadastro de usuários e outros recursos.'
    },
    servers: [
      { 
        url: process.env.SWAGGER_DEV_URL || 'http://localhost:3000/api',
        description: 'Servidor de desenvolvimento'
      }
    ],
    tags: [
      { name: 'Autenticacao', description: 'Operações de autenticação' },
      { name: 'Usuario', description: 'Operações de usuário' },
      { 
        name: '💎 Planos', 
        description: 'Sistema completo de planos de assinatura com 3 níveis: Gratuito (com anúncios), Mensal (sem anúncios, downloads limitados) e Vitalício (acesso completo)'
      }
    ],
    paths: {
      ...authLogin,
      ...forgotPassword,
      ...resetPassword,
      ...usuarioCadastrar,
      // Rotas de planos
      '/plans': listPlans['/api/plans'],
      '/plans/my-plan': getMyPlan['/api/plans/my-plan'],
      '/plans/change': changePlan['/api/plans/change'],
      '/plans/download': registerDownload['/api/plans/download'],
      '/plans/ads-config': adsConfig['/api/plans/ads-config']
    },
    components: {
      schemas: {
        ...userRegisterSchemas,
        ...authSchemas,
        ...planSchemas
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
