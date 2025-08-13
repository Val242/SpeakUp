import { API_ENDPOINTS, apiCall } from '../config/api';

// Service pour les données utilisateur
export const userService = {
  // Récupérer le profil utilisateur
  getProfile: async () => {
    return await apiCall(API_ENDPOINTS.USER_PROFILE);
  },

  // Mettre à jour le profil utilisateur
  updateProfile: async (profileData) => {
    return await apiCall(API_ENDPOINTS.USER_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Service pour les statistiques du tableau de bord
export const dashboardService = {
  // Récupérer les statistiques du tableau de bord
  getStats: async () => {
    return await apiCall(API_ENDPOINTS.DASHBOARD_STATS);
  },
};

// Service pour les feedbacks
export const feedbackService = {
  // Récupérer la liste des feedbacks avec pagination
  getFeedbackList: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    
    return await apiCall(`${API_ENDPOINTS.FEEDBACK_LIST}?${params}`);
  },

  // Récupérer un feedback spécifique
  getFeedbackById: async (id) => {
    return await apiCall(`${API_ENDPOINTS.FEEDBACK_LIST}/${id}`);
  },

  // Mettre à jour le statut d'un feedback
  updateFeedbackStatus: async (id, status) => {
    return await apiCall(API_ENDPOINTS.FEEDBACK_STATUS(id), {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Mettre à jour la date d'exécution d'un feedback
  updateDueDate: async (id, dueDate) => {
    return await apiCall(API_ENDPOINTS.FEEDBACK_DUE_DATE(id), {
      method: 'PUT',
      body: JSON.stringify({ dueDate }),
    });
  },

  // Mettre à jour la progression d'un feedback
  updateProgress: async (id, progress) => {
    return await apiCall(API_ENDPOINTS.FEEDBACK_PROGRESS(id), {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  },

  // Créer un nouveau feedback
  createFeedback: async (feedbackData) => {
    return await apiCall(API_ENDPOINTS.FEEDBACK_LIST, {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },

  // Supprimer un feedback
  deleteFeedback: async (id) => {
    return await apiCall(`${API_ENDPOINTS.FEEDBACK_LIST}/${id}`, {
      method: 'DELETE',
    });
  },

  // Ajouter un commentaire à un feedback
  addComment: async (feedbackId, comment) => {
    return await apiCall(`${API_ENDPOINTS.FEEDBACK_LIST}/${feedbackId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  // Récupérer les statistiques détaillées des feedbacks
  getFeedbackStats: async () => {
    return await apiCall(`${API_ENDPOINTS.FEEDBACK_LIST}/stats`);
  },
};

// Service d'authentification (pour future utilisation)
export const authService = {
  // Se connecter
  login: async (credentials) => {
    const response = await apiCall(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Stocker le token d'authentification
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  // Se déconnecter
  logout: async () => {
    try {
      await apiCall(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer le token localement
      localStorage.removeItem('authToken');
    }
  },

  // Rafraîchir le token
  refreshToken: async () => {
    const response = await apiCall(API_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

// Service pour les notifications (pour future utilisation)
export const notificationService = {
  // Récupérer les notifications
  getNotifications: async () => {
    return await apiCall(`${API_ENDPOINTS.API_BASE_URL}/api/notifications`);
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId) => {
    return await apiCall(`${API_ENDPOINTS.API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },
}; 