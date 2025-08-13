// Configuration de l'environnement
const isDevelopment = process.env.NODE_ENV === 'development';
const useMockData = false;

export const config = {
  // Utiliser les données mock en développement ou si explicitement demandé
  useMockData,
  
  // URL de l'API backend
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  
  // Configuration de l'environnement
  isDevelopment,
  isProduction: process.env.NODE_ENV === 'production',
  
  // Configuration des timeouts
  apiTimeout: 10000, // 10 secondes
  
  // Configuration de la pagination par défaut
  defaultPageSize: 10,
  
  // Configuration des notifications
  enableNotifications: true,
  
  // Configuration du cache
  enableCache: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
};

// Fonction pour obtenir les services appropriés selon l'environnement
export const getServices = () => {
  // Importer les services réels uniquement
  return import('../services/apiService').then(module => ({
    userService: module.userService,
    dashboardService: module.dashboardService,
    feedbackService: module.feedbackService,
    authService: module.authService,
    notificationService: module.notificationService,
  }));
};

// Fonction pour afficher des informations de debug
export const debug = {
  log: (message, data) => {
    if (config.isDevelopment) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  
  error: (message, error) => {
    if (config.isDevelopment) {
      console.error(`[ERROR] ${message}`, error);
    }
  },
  
  warn: (message, data) => {
    if (config.isDevelopment) {
      console.warn(`[WARN] ${message}`, data);
    }
  }
}; 