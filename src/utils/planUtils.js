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
      offlineDownload: false,
      quality: ['720p'],
      support: 'community',
      downloadSpeed: 'normal',
      concurrentDownloads: 1
    },
    limits: {
      maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
      storageTime: 24 * 60 * 60 * 1000 // 24 horas
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
      offlineDownload: true,
      quality: ['720p', '1080p'],
      support: 'email',
      downloadSpeed: 'fast',
      concurrentDownloads: 3
    },
    limits: {
      maxFileSize: 8 * 1024 * 1024 * 1024, // 8GB
      storageTime: 7 * 24 * 60 * 60 * 1000 // 7 dias
    },
    duration: 30, // 30 dias
    description: 'Sem anúncios, downloads limitados e qualidade HD',
    benefits: [
      'Sem propagandas',
      'Qualidade até 1080p',
      'Suporte por email',
      'Velocidade aumentada',
      'Até 3 downloads simultâneos'
    ]
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
      offlineDownload: true,
      quality: ['720p', '1080p', '4K'],
      support: 'priority',
      downloadSpeed: 'ultra',
      concurrentDownloads: 10
    },
    limits: {
      maxFileSize: 50 * 1024 * 1024 * 1024, // 50GB
      storageTime: 30 * 24 * 60 * 60 * 1000 // 30 dias
    },
    duration: null, // vitalício
    description: 'Acesso completo e ilimitado para sempre',
    benefits: [
      'Downloads ilimitados',
      'Qualidade até 4K',
      'Sem propagandas',
      'Suporte prioritário',
      'Velocidade máxima',
      'Até 10 downloads simultâneos',
      'Armazenamento estendido'
    ]
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

/**
 * Hierarquia dos planos (menor para maior)
 */
export const PLAN_HIERARCHY = [
  PLAN_TYPES.FREE,
  PLAN_TYPES.MONTHLY,
  PLAN_TYPES.LIFETIME
];

/**
 * Verificar se é um upgrade válido
 */
export const isValidUpgrade = (currentPlan, targetPlan) => {
  const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan);
  const targetIndex = PLAN_HIERARCHY.indexOf(targetPlan);
  
  return targetIndex > currentIndex;
};

/**
 * Verificar se é um downgrade válido
 */
export const isValidDowngrade = (currentPlan, targetPlan) => {
  const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan);
  const targetIndex = PLAN_HIERARCHY.indexOf(targetPlan);
  
  return targetIndex < currentIndex;
};

/**
 * Calcular benefícios de upgrade
 */
export const calculateUpgradeBenefits = (currentPlan, targetPlan) => {
  const current = PLAN_CONFIGS[currentPlan];
  const target = PLAN_CONFIGS[targetPlan];
  
  if (!current || !target) {
    return { benefits: [], improvements: {} };
  }
  
  const improvements = {};
  const benefits = [];
  
  // Comparar downloads mensais
  if (target.features.monthlyDownloads === 0) {
    improvements.downloads = 'Ilimitados';
    benefits.push('Downloads ilimitados por mês');
  } else if (target.features.monthlyDownloads > current.features.monthlyDownloads) {
    improvements.downloads = `+${target.features.monthlyDownloads - current.features.monthlyDownloads}`;
    benefits.push(`Aumento para ${target.features.monthlyDownloads} downloads mensais`);
  }
  
  // Comparar qualidades
  if (target.features.quality.length > current.features.quality.length) {
    const newQualities = target.features.quality.filter(q => !current.features.quality.includes(q));
    improvements.quality = newQualities;
    benefits.push(`Novas qualidades: ${newQualities.join(', ')}`);
  }
  
  // Verificar remoção de ads
  if (current.features.showAds && !target.features.showAds) {
    improvements.ads = 'Removidas';
    benefits.push('Experiência sem propagandas');
  }
  
  return { benefits, improvements };
};

/**
 * Formatar preço para exibição
 */
export const formatPrice = (price, currency = 'BRL') => {
  if (price === 0) return 'Gratuito';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(price);
};

/**
 * Obter status do plano do usuário
 */
export const getPlanStatus = (userPlan) => {
  if (!userPlan || !userPlan.type) {
    return { 
      status: 'free', 
      active: true, 
      message: 'Plano gratuito ativo' 
    };
  }
  
  const now = new Date();
  
  // Plano gratuito não expira
  if (userPlan.type === PLAN_TYPES.FREE) {
    return { 
      status: 'active', 
      active: true, 
      message: 'Plano gratuito ativo' 
    };
  }
  
  // Plano vitalício não expira
  if (userPlan.type === PLAN_TYPES.LIFETIME) {
    return { 
      status: 'active', 
      active: true, 
      message: 'Plano vitalício ativo' 
    };
  }
  
  // Verificar se o plano pago expirou
  if (userPlan.endDate && now > userPlan.endDate) {
    return { 
      status: 'expired', 
      active: false, 
      message: 'Plano expirado', 
      expiredAt: userPlan.endDate 
    };
  }
  
  // Verificar se está próximo do vencimento (3 dias)
  if (userPlan.endDate) {
    const daysUntilExpiry = Math.ceil((userPlan.endDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 3) {
      return { 
        status: 'expiring', 
        active: true, 
        message: `Plano expira em ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'dia' : 'dias'}`,
        expiresAt: userPlan.endDate,
        daysLeft: daysUntilExpiry
      };
    }
  }
  
  return { 
    status: 'active', 
    active: true, 
    message: 'Plano ativo',
    expiresAt: userPlan.endDate
  };
};

export default {
  PLAN_TYPES,
  PLAN_CONFIGS,
  PLAN_HIERARCHY,
  hasFeature,
  isPlanActive,
  getRemainingDownloads,
  isValidUpgrade,
  isValidDowngrade,
  calculateUpgradeBenefits,
  formatPrice,
  getPlanStatus
};