// Configuração Swagger principal para importar rotas e schemas
import usuarioCadastrar from '../routes/users/userRegister.js';
import userRegisterSchemas from '../schemas/users/userRegister.js';
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
      },
      { 
        name: '💳 Pagamentos', 
        description: 'Sistema completo de pagamentos com suporte a Cartão de Crédito/Débito, PIX e Boleto Bancário'
      },
      { 
        name: '💰 Pagamentos', 
        description: 'Sistema brasileiro completo de pagamentos: Cartão (Crédito/Débito), PIX instantâneo e Boleto bancário. Processamento seguro com gateways nacionais.'
      },
      { 
        name: '🚫 Restrições de Planos', 
        description: 'Exibição transparente das restrições de cada plano antes da compra. Comparações, avisos críticos e recomendações personalizadas.'
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
      '/plans/restrictions/{planType}/warnings': planRestrictions['/plans/restrictions/{planType}/warnings']
    },
    components: {
      schemas: {
        ...userRegisterSchemas,
        ...authSchemas,
        ...planSchemas,
        ...planUpgradeSchemas,
        ...paymentSchemas,
        ...planRestrictionsSchemas
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
