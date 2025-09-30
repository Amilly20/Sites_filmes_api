/**
 * 💎 Configurações dos Planos de Assinatura
 * Define as regras e limites de cada plano
 */

export const PLAN_TYPES = {
  FREE: 'free',
  MONTHLY: 'monthly', 
  LIFETIME: 'lifetime'
};

export const PLAN_CONFIGS = {
  [PLAN_TYPES.FREE]: {
    name: 'free',
    displayName: 'Gratuito',
    price: 0,
    currency: 'BRL',
    features: {
      showAds: true,
      monthlyDownloads: 10,
      unlimitedAccess: false,
      hdQuality: false,
      simultaneousDevices: 1,
      offlineDownload: false
    },
    duration: null, // permanente
    description: 'Plano gratuito com anúncios e acesso limitado'
  },

  [PLAN_TYPES.MONTHLY]: {
    name: 'monthly',
    displayName: 'Mensal',
    price: 19.90,
    currency: 'BRL',
    features: {
      showAds: false,
      monthlyDownloads: 100,
      unlimitedAccess: false,
      hdQuality: true,
      simultaneousDevices: 2,
      offlineDownload: true
    },
    duration: 30, // 30 dias
    description: 'Sem anúncios, downloads limitados e qualidade HD'
  },

  [PLAN_TYPES.LIFETIME]: {
    name: 'lifetime',
    displayName: 'Vitalício',
    price: 299.90,
    currency: 'BRL',
    features: {
      showAds: false,
      monthlyDownloads: 0, // 0 = ilimitado
      unlimitedAccess: true,
      hdQuality: true,
      simultaneousDevices: 5,
      offlineDownload: true
    },
    duration: null, // vitalício
    description: 'Acesso completo e ilimitado para sempre'
  }
};

/**
 * Verifica se o usuário tem acesso a uma feature específica
 */
export const hasFeature = (userPlan, featureName) => {
  const planConfig = PLAN_CONFIGS[userPlan];
  if (!planConfig) return false;
  
  return planConfig.features[featureName] || false;
};

/**
 * Verifica se o plano do usuário está ativo
 */
export const isPlanActive = (user) => {
  if (!user.plan) return false;
  
  // Plano gratuito e vitalício são sempre ativos
  if (user.plan.type === PLAN_TYPES.FREE || user.plan.type === PLAN_TYPES.LIFETIME) {
    return true;
  }
  
  // Plano mensal precisa verificar data de expiração
  if (user.plan.type === PLAN_TYPES.MONTHLY) {
    if (!user.plan.endDate) return false;
    return new Date() <= new Date(user.plan.endDate);
  }
  
  return false;
};

/**
 * Calcula quantos downloads restam no mês atual
 */
export const getRemainingDownloads = (user) => {
  if (!user.plan) return 0;
  
  const planConfig = PLAN_CONFIGS[user.plan.type];
  if (!planConfig) return 0;
  
  // Planos com downloads ilimitados
  if (planConfig.features.monthlyDownloads === 0) {
    return Infinity;
  }
  
  // Verificar se precisa resetar o contador mensal
  const now = new Date();
  const resetDate = new Date(user.plan.monthlyDownloadsReset);
  const monthsDiff = (now.getFullYear() - resetDate.getFullYear()) * 12 + (now.getMonth() - resetDate.getMonth());
  
  // Se passou um mês ou mais, resetar contador
  if (monthsDiff >= 1) {
    return planConfig.features.monthlyDownloads;
  }
  
  // Calcular downloads restantes
  const used = user.plan.downloadsUsed || 0;
  const limit = planConfig.features.monthlyDownloads;
  
  return Math.max(0, limit - used);
};

export default {
  PLAN_TYPES,
  PLAN_CONFIGS,
  hasFeature,
  isPlanActive,
  getRemainingDownloads
};