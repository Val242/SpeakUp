import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { userService, dashboardService, feedbackService, authService } from './services/apiService';

function App() {
  // Mapping d'affichage des statuts (UI)
  const statusConfig = {
    'Assigned': { label: 'Assigné', color: '#2196F3', bgColor: '#E3F2FD', borderColor: '#2196F3' },
    'In Progress': { label: 'En cours', color: '#FF9800', bgColor: '#FFF3E0', borderColor: '#FF9800' },
    'Completed': { label: 'Terminé', color: '#4CAF50', bgColor: '#E8F5E8', borderColor: '#4CAF50' },
    'On Hold': { label: 'En attente', color: '#9E9E9E', bgColor: '#F5F5F5', borderColor: '#9E9E9E' },
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // États pour les données récupérées du backend
  const [userData, setUserData] = useState({
    name: 'Alice Johnson',
    role: 'Frontend Developer'
  });
  
  const [summaryStats, setSummaryStats] = useState({
    assignedTasks: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    dueThisWeek: 0
  });
  
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [feedbackDates, setFeedbackDates] = useState({});
  const [feedbackProgress, setFeedbackProgress] = useState({});

  // États pour gérer les alertes et notifications
  const [alertedIds, setAlertedIds] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const didInitialLoadRef = useRef(false);
  const notificationsRef = useRef(null);
  const unreadCount = notifications.length;

  // Fonction pour récupérer les données utilisateur
  const fetchUserData = async () => {
    try {
      const data = await userService.getProfile();
      setUserData(data);
    } catch (error) {
      console.error('Erreur fetchUserData:', error);
      setError('Impossible de charger les données utilisateur');
    }
  };

  // Fonction pour récupérer les statistiques
  const fetchSummaryStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setSummaryStats(data);
    } catch (error) {
      console.error('Erreur fetchSummaryStats:', error);
      setError('Impossible de charger les statistiques');
    }
  };

  // Fonction pour récupérer la liste des feedbacks
  const fetchFeedbackList = async (page = 1, overrideFilters = null) => {
    try {
      setLoading(true);
      const filters = {};
      const effectiveStatus = overrideFilters?.status ?? statusFilter;
      if (effectiveStatus !== 'all') filters.status = effectiveStatus;
      
      const data = await feedbackService.getFeedbackList(page, 10, filters);
      const newList = (data.feedbacks || data.items || data);

      // Détecter les nouveaux feedbacks assignés (après le premier chargement)
      if (didInitialLoadRef.current) {
        const previousIds = new Set(feedbackList.map(f => f.id));
        newList.forEach(item => {
          if (!previousIds.has(item.id) && item.status === 'Assigned') {
            addNotification(`Nouveau feedback: #${item.id} - ${item.title}`);
          }
        });
      }

      setFeedbackList(newList);
      
      // Initialiser les statuts, dates et progression des feedbacks
      const statusMap = {};
      const datesMap = {};
      const progressMap = {};
      newList.forEach(feedback => {
        statusMap[feedback.id] = feedback.status;
        datesMap[feedback.id] = feedback.dueDate || '';
        progressMap[feedback.id] = feedback.progress || 0;
      });
      setFeedbackStatus(statusMap);
      setFeedbackDates(datesMap);
      setFeedbackProgress(progressMap);
      if (!didInitialLoadRef.current) {
        didInitialLoadRef.current = true;
      }
    } catch (error) {
      console.error('Erreur fetchFeedbackList:', error);
      setError('Impossible de charger les feedbacks');
    } finally {
      setLoading(false);
    }
  };

  

  // Fonction pour mettre à jour le statut d'un feedback
  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      await feedbackService.updateFeedbackStatus(feedbackId, newStatus);
      
      // Mettre à jour l'état local
      setFeedbackStatus(prev => ({
        ...prev,
        [feedbackId]: newStatus
      }));
      
      // Recharger les statistiques car elles ont pu changer
      await fetchSummaryStats();
      
    } catch (error) {
      console.error('Erreur updateFeedbackStatus:', error);
      setError('Impossible de mettre à jour le statut');
    }
  };

  // Fonction pour mettre à jour la date d'exécution
  const updateDueDate = async (feedbackId, dueDate) => {
    try {
      await feedbackService.updateDueDate(feedbackId, dueDate);
      
      // Mettre à jour l'état local
      setFeedbackDates(prev => ({
        ...prev,
        [feedbackId]: dueDate
      }));
      
      // Vérifier immédiatement si la date est atteinte et le statut non terminé
      triggerOverdueAlertForSingle(feedbackId, dueDate);
      
    } catch (error) {
      console.error('Erreur updateDueDate:', error);
      setError('Impossible de mettre à jour la date d\'exécution');
    }
  };

  // Fonction pour mettre à jour la progression
  const updateProgress = async (feedbackId, progress) => {
    try {
      await feedbackService.updateProgress(feedbackId, progress);
      // Mettre à jour la progression localement
      setFeedbackProgress(prev => ({
        ...prev,
        [feedbackId]: progress
      }));
      // Mettre à jour le statut localement selon la règle existante du service
      setFeedbackStatus(prev => {
        const next = { ...prev };
        if (progress >= 100) {
          next[feedbackId] = 'Completed';
        } else if (progress > 0) {
          next[feedbackId] = 'In Progress';
        } else {
          next[feedbackId] = next[feedbackId] || 'Assigned';
        }
        return next;
      });
    } catch (error) {
      console.error('Erreur updateProgress:', error);
      setError('Impossible de mettre à jour la progression');
    }
  };

  // Fonction pour se déconnecter
  const handleLogout = async () => {
    try {
      await authService.logout();
      // Redirection vers la page de connexion
      window.location.href = '/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer la déconnexion même en cas d'erreur
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  };

  // Fonction pour changer de page
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchFeedbackList(newPage);
  };

  // Fonction pour changer le filtre de statut
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    fetchFeedbackList(1, { status: newStatus });
  };

  
  // Fonction utilitaire pour comparer les dates (au jour près)
  const isDueDateReachedOrPast = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    if (Number.isNaN(due.getTime())) return false;
    due.setHours(0, 0, 0, 0);
    return due.getTime() <= today.getTime();
  };

  // Déclencher une alerte pour un feedback précis si nécessaire
  const triggerOverdueAlertForSingle = (feedbackId, dueDate) => {
    if (!dueDate) return;
    const alreadyAlerted = alertedIds.has(feedbackId);
    const status = feedbackStatus[feedbackId] || feedbackList.find(f => f.id === feedbackId)?.status;
    if (!alreadyAlerted && status !== 'Completed' && isDueDateReachedOrPast(dueDate)) {
      const item = feedbackList.find(f => f.id === feedbackId);
      addNotification(`Échéance atteinte: #${feedbackId} - ${item?.title || ''}`.trim());
      setAlertedIds(prev => new Set(prev).add(feedbackId));
    }
  };

  // Vérifier les échéances atteintes pour l'ensemble des feedbacks
  const checkOverdueAndAlert = () => {
    if (!Array.isArray(feedbackList) || feedbackList.length === 0) return;
    const newAlerts = [];
    const nextAlerted = new Set(alertedIds);

    feedbackList.forEach((feedback) => {
      const effectiveStatus = feedbackStatus[feedback.id] || feedback.status;
      const dueDate = feedbackDates[feedback.id] || feedback.dueDate || '';
      if (effectiveStatus !== 'Completed' && isDueDateReachedOrPast(dueDate) && !nextAlerted.has(feedback.id)) {
        newAlerts.push({ id: feedback.id, title: feedback.title, dueDate });
        nextAlerted.add(feedback.id);
      }
    });

    if (newAlerts.length > 0) {
      newAlerts.forEach(a => addNotification(`Échéance atteinte: #${a.id} - ${a.title}`));
      setAlertedIds(nextAlerted);
    }
  };

  // Lancer une vérification à chaque changement de liste/statuts/dates
  useEffect(() => {
    checkOverdueAndAlert();
  }, [feedbackList, feedbackStatus, feedbackDates]);

  // Vérification périodique (au cas où l'appli reste ouverte jusqu'à l'échéance)
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkOverdueAndAlert();
    }, 60000); // toutes les 60s
    return () => clearInterval(intervalId);
  }, [feedbackList, feedbackStatus, feedbackDates]);

  // Notifications helpers (simples: tableau de chaînes affiché via badge uniquement)
  const addNotification = (message) => {
    setNotifications(prev => [
      `${new Date().toLocaleTimeString()} • ${message}`,
      ...prev
    ]);
  };

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  // Fermer la liste des notifications en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Charger les données au montage du composant
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Charger toutes les données en parallèle
        await Promise.all([
          fetchUserData(),
          fetchSummaryStats(),
          fetchFeedbackList(1)
        ]);
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement du tableau de bord');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Gestionnaire de changement de statut
  const handleStatusChange = (feedbackId, newStatus) => {
    updateFeedbackStatus(feedbackId, newStatus);
  };

  // Gestionnaire de changement de date
  const handleDateChange = (feedbackId, newDate) => {
    updateDueDate(feedbackId, newDate);
  };

  // Gestionnaire de changement de progression
  const handleProgressChange = (feedbackId, newProgress) => {
    updateProgress(feedbackId, newProgress);
  };

  // Composant pour l'étiquette de statut
  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig['Assigned'];
    return (
      <span 
        className="status-badge"
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          borderColor: config.borderColor
        }}
      >
        {config.label}
      </span>
    );
  };

  

  // Composant pour la barre de progression
  const ProgressBar = ({ progress, feedbackId }) => {
    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-controls">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => handleProgressChange(feedbackId, parseInt(e.target.value))}
            className="progress-slider"
          />
          <span className="progress-text">{progress}%</span>
        </div>
      </div>
    );
  };

  // Affichage de chargement
  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Developer Dashboard</h1>
          <p className="welcome-message">Welcome back, {userData?.name || ''}</p>
        </div>
        <div className="user-profile">
          <div ref={notificationsRef} className="notification-bell" onClick={toggleNotifications} style={{ position: 'relative', marginRight: '16px', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6V9a6 6 0 10-12 0v7l-2 2v1h16v-1l-2-2z"/>
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#F44336',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '10px',
                padding: '2px 6px'
              }}>{unreadCount}</span>
            )}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '28px',
                width: '300px',
                maxHeight: '320px',
                overflowY: 'auto',
                background: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: '8px',
                zIndex: 1000,
                padding: '8px'
              }}>
                <strong style={{ display: 'block', marginBottom: '8px' }}>Notifications</strong>
                {notifications.length === 0 ? (
                  <p style={{ margin: 0 }}>Aucune notification</p>
                ) : (
                  notifications.map((text, idx) => (
                    <div key={idx} style={{
                      background: '#F9FAFB',
                      padding: '8px',
                      borderRadius: '4px',
                      marginBottom: '6px'
                    }}>
                      {text}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="user-info">
            <p className="user-name">{userData.name}</p>
            <p className="user-role">{userData.role}</p>
            <button 
              className="logout-btn"
              onClick={() => setShowLogoutModal(true)}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      {/* Summary Cards Section */}
      <section className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <div className="card-content">
            <h3 className="card-number">{summaryStats.assignedTasks}</h3>
            <p className="card-label">Assigned Tasks</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
          </div>
          <div className="card-content">
            <h3 className="card-number">{summaryStats.inProgress}</h3>
            <p className="card-label">In Progress</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="card-content">
            <h3 className="card-number">{summaryStats.completed}</h3>
            <p className="card-label">Completed</p>
          </div>
        </div>

        <div className="summary-card warning">
          <div className="card-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="card-content">
            <h3 className="card-number">{summaryStats.overdue}</h3>
            <p className="card-label">Overdue</p>
          </div>
        </div>

        <div className="summary-card info">
          <div className="card-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </div>
          <div className="card-content">
            <h3 className="card-number">{summaryStats.dueThisWeek}</h3>
            <p className="card-label">Due This Week</p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="status-filter">Filtrer par statut:</label>
            <select 
              id="status-filter"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les statuts</option>
              <option value="Assigned">Assigné</option>
              <option value="In Progress">En cours</option>
              <option value="Completed">Terminé</option>
              <option value="On Hold">En attente</option>
            </select>
          </div>

          
        </div>
      </section>

      {/* Feedback Section */}
      <section className="feedback-section">
        <h2 className="section-title">My Assigned Feedback</h2>
        
        <div className="feedback-list">
          {feedbackList.length === 0 ? (
            <div className="no-feedback">
              <p>Aucun feedback assigné pour le moment.</p>
            </div>
          ) : (
            feedbackList.map((feedback) => (
              <div key={feedback.id} className="feedback-item">
                <div className="feedback-content">
                  <div className="feedback-header">
                    <h3 className="feedback-title">#{feedback.id} - {feedback.title}</h3>
                    <div className="feedback-badges">
                      <StatusBadge status={feedbackStatus[feedback.id] || feedback.status} />
                    </div>
                  </div>
                  
                  <p className="feedback-submitted">
                    Submitted by {feedback.submittedBy} on {feedback.date}
                  </p>
                  
                  <p className="feedback-description">{feedback.description}</p>
                  
                  <div className="feedback-progress">
                    <label>Progression:</label>
                    <ProgressBar 
                      progress={feedbackProgress[feedback.id] || feedback.progress || 0}
                      feedbackId={feedback.id}
                    />
                  </div>
                  
                  <div className="feedback-actions">
                    <div className="date-input-group">
                      <label htmlFor={`due-date-${feedback.id}`}>Date d'exécution:</label>
                      <input
                        type="date"
                        id={`due-date-${feedback.id}`}
                        value={feedbackDates[feedback.id] || ''}
                        onChange={(e) => handleDateChange(feedback.id, e.target.value)}
                        className="due-date-input"
                      />
                    </div>
                  </div>
                </div>
                <div className="feedback-status">
                  <select 
                    value={feedbackStatus[feedback.id] || feedback.status}
                    onChange={(e) => handleStatusChange(feedback.id, e.target.value)}
                    className="status-dropdown"
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {feedbackList.length > 0 && (
          <div className="pagination">
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <span className="pagination-text">{currentPage}/2</span>
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === 2}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>
        )}
      </section>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmation de déconnexion</h3>
            <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn-primary"
                onClick={handleLogout}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications affichées via la cloche */}
    </div>
  );
}

export default App;
