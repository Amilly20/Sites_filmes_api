// Configuração Swagger principal para importar rotas e schemas

// Importar documentação de usuários
import usuarioCadastrar from '../routes/users/userRegister.js';
import userRegisterSchemas from '../schemas/users/userRegister.js';

// Importar documentação de autenticação
import authLogin from '../routes/auth/authLogin.js';
import { forgotPassword, resetPassword } from '../routes/auth/passwordReset.js';
import authSchemas from '../schemas/auth/authSchemas.js';

// Importar documentação de planos
import planSchemas from '../schemas/plans/planSchemas.js';
import planUpgradeSchemas from '../schemas/plans/planUpgradeSchemas.js';
import listPlans from '../routes/plans/listPlans.js';
import getMyPlan from '../routes/plans/getMyPlan.js';
import changePlan from '../routes/plans/changePlan.js';
import registerDownload from '../routes/plans/registerDownload.js';
import adsConfig from '../routes/plans/adsConfig.js';

// Importar documentação de upgrade/downgrade
import planUpgrade from '../routes/plans/planUpgrade.js';
import planDowngrade from '../routes/plans/planDowngrade.js';
import planChangeIntelligent from '../routes/plans/planChangeIntelligent.js';
import upgradeOptions from '../routes/plans/upgradeOptions.js';
import changePreview from '../routes/plans/changePreview.js';

// Importar documentação de pagamentos - RF07
import payments from '../routes/payments.js';
import paymentSchemas from '../schemas/payments.js';

// Importar documentação de restrições de planos - RF08
import planRestrictions from '../routes/plans/planRestrictions.js';
import planRestrictionsSchemas from '../schemas/plans/planRestrictions.js';

// Importar documentação de filmes - RF25
import movieRoutes from '../routes/movies/movieRoutes.js';
import movieSchemas from '../schemas/movies/movieSchemas.js';

const getSwaggerOptions = () => ({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sites Filmes',
      version: '1.0.0',
      description: 'API para gerenciamento de filmes e planos de assinatura com todos os requisitos funcionais implementados.'
    },
    servers: [
      { 
        url: process.env.SWAGGER_DEV_URL || 'http://localhost:3000/api',
        description: 'Servidor de desenvolvimento'
      }
    ],
    tags: [
      // RF01, RF02, RF03, RF04, RF21 - Autenticação e Usuários
      { 
        name: 'Autenticacao', 
        description: 'RF01, RF02, RF03, RF04, RF21 - Cadastro, login, recuperação de senha e autenticação JWT'
      },
      { 
        name: 'Usuario', 
        description: 'Gerenciamento de usuários e perfis'
      },
      
      // RF05, RF06 - Planos de Assinatura  
      { 
        name: '💎 Planos', 
        description: 'RF05, RF06 - Sistema completo de planos: Gratuito (com anúncios), Mensal (sem anúncios, limite downloads) e Vitalício (acesso completo). Inclui upgrade/downgrade.'
      },
      
      // RF07 - Sistema de Pagamentos (ÚNICO - SEM DUPLICAÇÃO)
      { 
        name: '💰 Pagamentos', 
        description: 'RF07 - Sistema completo de pagamentos: Cartão de Crédito/Débito, PIX e Boleto Bancário. Processamento seguro via gateway.'
      },
      
      // RF08 - Restrições de Planos
      { 
        name: '🚫 Restrições de Planos', 
        description: 'RF08 - Exibição transparente das restrições de cada plano. Comparações, avisos críticos e recomendações personalizadas.'
      },
      
      // RF25 - Gerenciamento de Filmes
      { 
        name: '🎬 Filmes', 
        description: 'RF25 - Sistema de cadastro e gerenciamento de filmes por administradores. Campos obrigatórios: título, sinopse, duração, ano, elenco, diretor, gêneros, idiomas, legendas, classificação etária, país, estúdio, imagens e trailer.'
      }
    ],
    paths: {
      ...authLogin,
      ...forgotPassword,
      ...resetPassword,
      ...usuarioCadastrar,
      // Rotas de planos básicas
      '/plans': listPlans['/api/plans'],
      '/plans/my-plan': getMyPlan['/api/plans/my-plan'],
      '/plans/change': changePlan['/api/plans/change'],
      '/plans/download': registerDownload['/api/plans/download'],
      '/plans/ads-config': adsConfig['/api/plans/ads-config'],
      // Rotas de upgrade/downgrade - RF06
      '/plans/upgrade': planUpgrade['/plans/upgrade'],
      '/plans/downgrade': planDowngrade['/plans/downgrade'],
      '/plans/change-intelligent': planChangeIntelligent['/plans/change-intelligent'],
      '/plans/upgrade-options': upgradeOptions['/plans/upgrade-options'],
      '/plans/change-preview': changePreview['/plans/change-preview'],
      // Rotas de pagamentos - RF07
      '/payments/card': payments['/payments/card'],
      '/payments/pix': payments['/payments/pix'],
      '/payments/boleto': payments['/payments/boleto'],
      '/payments': payments['/payments'],
      '/payments/{id}': payments['/payments/{id}'],
      '/payments/{id}/status': payments['/payments/{id}/status'],
      '/payments/methods/available': payments['/payments/methods/available'],
      '/payments/webhook/{gateway}': payments['/payments/webhook/{gateway}'],
      // Rotas de restrições de planos - RF08
      '/plans/restrictions/compare': planRestrictions['/plans/restrictions/compare'],
      '/plans/restrictions/stats': planRestrictions['/plans/restrictions/stats'],
      '/plans/restrictions/recommendation': planRestrictions['/plans/restrictions/recommendation'],
      '/plans/restrictions/{planType}': planRestrictions['/plans/restrictions/{planType}'],
      '/plans/restrictions/{planType}/warnings': planRestrictions['/plans/restrictions/{planType}/warnings'],
      // Rotas de filmes - RF25
      ...movieRoutes
    },
    components: {
      schemas: {
        ...userRegisterSchemas,
        ...authSchemas,
        ...planSchemas,
        ...planUpgradeSchemas,
        ...paymentSchemas,
        ...planRestrictionsSchemas,
        ...movieSchemas
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