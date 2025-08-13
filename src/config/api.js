// Configuration des URLs de l'API backend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Endpoints utilisateur
  USER_PROFILE: `${API_BASE_URL}/api/user/profile`,
  
  // Endpoints du tableau de bord
  DASHBOARD_STATS: `${API_BASE_URL}/api/dashboard/stats`,
  
  // Endpoints des feedbacks
  FEEDBACK_LIST: `${API_BASE_URL}/api/feedback`,
  FEEDBACK_STATUS: (id) => `${API_BASE_URL}/api/feedback/${id}/status`,
  FEEDBACK_DUE_DATE: (id) => `${API_BASE_URL}/api/feedback/${id}/due-date`,
  FEEDBACK_PROGRESS: (id) => `${API_BASE_URL}/api/feedback/${id}/progress`,
  
  // Endpoints d'authentification (pour future utilisation)
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh`,
};

// Configuration des headers par défaut
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Fonction pour ajouter le token d'authentification aux headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    ...DEFAULT_HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Fonction utilitaire pour les appels API
export const apiCall = async (url, options = {}) => {
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Gestion des erreurs HTTP
      if (response.status === 401) {
        // Token expiré ou invalide
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}; 