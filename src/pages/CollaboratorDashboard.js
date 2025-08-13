import React, { useState, useEffect, useRef } from 'react';
import { userService, dashboardService, feedbackService } from '../services/apiService';

export default function CollaboratorDashboard() {
  const [user, setUser] = useState(null);
  const [summaryStats, setSummaryStats] = useState({});
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [feedbackProgress, setFeedbackProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [apiError, setApiError] = useState(null);

  const notificationsRef = useRef(null);
  const currentUserRef = useRef(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUserRef.current = currentUser;
    
    if (!currentUser.email) {
      window.location.hash = '#/';
      return;
    }

    fetchData();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'inbox' && event.newValue) {
        const newMessages = JSON.parse(event.newValue);
        newMessages.forEach(msg => addNotification(msg));
        localStorage.removeItem('inbox');
      }
      if (event.key === 'assignedFeedback' && event.newValue) {
        const assigned = JSON.parse(event.newValue);
        setFeedbackList(prevList => {
          const existing = prevList.find(f => f.id === assigned.id);
          if (!existing) {
            addNotification(`Nouveau feedback assigné: #${assigned.id} - ${assigned.title}`);
            return [...prevList, assigned];
          }
          return prevList.map(f => f.id === assigned.id ? assigned : f);
        });
        setFeedbackStatus(prev => ({ ...prev, [assigned.id]: assigned.status }));
        setFeedbackProgress(prev => ({ ...prev, [assigned.id]: assigned.progress }));
        localStorage.removeItem('assignedFeedback');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      const [userData, stats, feedbacks] = await Promise.all([
        userService.getProfile(),
        dashboardService.getStats(),
        feedbackService.getFeedbackList()
      ]);

      setUser(userData);
      setSummaryStats(stats);
      setFeedbackList(feedbacks);
      
      const statusMap = {};
      const progressMap = {};
      feedbacks.forEach(feedback => {
        statusMap[feedback.id] = feedback.status || 'New';
        progressMap[feedback.id] = feedback.progress || 0;
      });
      setFeedbackStatus(statusMap);
      setFeedbackProgress(progressMap);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setApiError('Erreur de chargement des données. Utilisation des données locales.');
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setUser({ name: currentUser.username || 'Utilisateur', email: currentUser.email || 'user@example.com' });
      setSummaryStats({ total: 0, inProgress: 0, completed: 0, overdue: 0 });
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message: typeof message === 'string' ? message : message.message || 'Notification',
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleStatusFilterChange = (status) => {
    setCurrentFilter(status);
  };

  const handleProgressChange = async (feedbackId, newProgress) => {
    try {
      await updateProgress(feedbackId, newProgress);
      if (newProgress >= 100) {
        await updateFeedbackStatus(feedbackId, 'Completed');
      } else if (newProgress > 0) {
        await updateFeedbackStatus(feedbackId, 'In Progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      await feedbackService.updateFeedbackStatus(feedbackId, newStatus);
      setFeedbackStatus(prev => ({ ...prev, [feedbackId]: newStatus }));
    } catch (e) {
      setFeedbackStatus(prev => ({ ...prev, [feedbackId]: newStatus }));
    } finally {
      try {
        if (newStatus === 'Completed') {
          const cu = currentUserRef.current; const username = cu?.username || 'user';
          const adminInbox = JSON.parse(localStorage.getItem('inbox:admin') || '[]');
          adminInbox.unshift({ at: Date.now(), message: `Feedback #${feedbackId} terminé par ${username}` });
          localStorage.setItem('inbox:admin', JSON.stringify(adminInbox));
        }
      } catch {}
    }
  };

  const updateProgress = async (feedbackId, progress) => {
    try {
      await feedbackService.updateProgress(feedbackId, progress);
      setFeedbackProgress(prev => ({ ...prev, [feedbackId]: progress }));
      setFeedbackStatus(prev => {
        const next = { ...prev };
        if (progress >= 100) next[feedbackId] = 'Completed';
        else if (progress > 0) next[feedbackId] = 'In Progress';
        else next[feedbackId] = next[feedbackId] || 'Assigned';
        return next;
      });
    } catch (e) {
      setFeedbackProgress(prev => ({ ...prev, [feedbackId]: progress }));
      setFeedbackStatus(prev => ({ ...prev, [feedbackId]: progress >= 100 ? 'Completed' : (progress > 0 ? 'In Progress' : (prev[feedbackId] || 'Assigned')) }));
    } finally {
      try {
        if (progress >= 100) {
          const cu = currentUserRef.current; const username = cu?.username || 'user';
          const adminInbox = JSON.parse(localStorage.getItem('inbox:admin') || '[]');
          adminInbox.unshift({ at: Date.now(), message: `Feedback #${feedbackId} terminé par ${username}` });
          localStorage.setItem('inbox:admin', JSON.stringify(adminInbox));
        }
      } catch {}
    }
  };

  const filteredFeedbacks = feedbackList.filter(feedback => {
    if (currentFilter === 'all') return true;
    return feedbackStatus[feedback.id] === currentFilter;
  });

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#64748b'
      }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
            Dashboard Collaborateur
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notificationsRef}>
            <button
              onClick={toggleNotifications}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                position: 'relative',
                padding: '8px'
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                width: '300px',
                maxHeight: '400px',
                overflowY: 'auto',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                marginTop: '8px'
              }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                    Aucune notification
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div key={notification.id} style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '14px'
                    }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                        {notification.message}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {notification.timestamp}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span style={{ fontSize: '14px', color: '#374151' }}>
              {user?.name || 'Utilisateur'}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={() => {
              localStorage.removeItem('currentUser');
              window.location.hash = '#/';
            }}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#ef4444';
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {apiError && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          color: '#92400e',
          padding: '12px 24px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ {apiError}
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding: '24px' }}>
        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>
              {summaryStats.total || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Total Feedbacks</div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
              {summaryStats.inProgress || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>En cours</div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
              {summaryStats.completed || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Terminés</div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>
              {summaryStats.overdue || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>En retard</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {['all', 'New', 'In Progress', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              style={{
                padding: '8px 16px',
                background: currentFilter === status ? '#3b82f6' : 'white',
                color: currentFilter === status ? 'white' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              {status === 'all' ? 'Tous' : status}
            </button>
          ))}
        </div>

        {/* Feedback List */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              Feedbacks Assignés
            </h2>
          </div>
          
          {filteredFeedbacks.length === 0 ? (
            <div style={{ 
              padding: '48px 24px', 
              textAlign: 'center', 
              color: '#64748b',
              fontSize: '16px'
            }}>
              <div style={{ marginBottom: '16px', fontSize: '48px' }}>📋</div>
              <div style={{ marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Aucun feedback assigné
              </div>
              <div style={{ fontSize: '14px' }}>
                Les feedbacks apparaîtront ici une fois qu'ils vous seront assignés par l'administrateur.
              </div>
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>ID</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>CLIENT</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>DESCRIPTION</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>SERVICE</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>STATUT</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>PROGRESSION</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>DATE</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.map(feedback => (
                    <tr key={feedback.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                        #{feedback.id}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                            {feedback.submitter?.name || 'Client'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {feedback.submitter?.email || 'client@example.com'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1e293b', maxWidth: '300px' }}>
                        {feedback.message?.substring(0, 100)}...
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>
                        {feedback.service || 'Général'}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          backgroundColor: feedbackStatus[feedback.id] === 'New' ? '#fef3c7' : 
                                           feedbackStatus[feedback.id] === 'In Progress' ? '#dbeafe' : '#d1fae5',
                          color: feedbackStatus[feedback.id] === 'New' ? '#f59e0b' : 
                                 feedbackStatus[feedback.id] === 'In Progress' ? '#3b82f6' : '#10b981',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {feedbackStatus[feedback.id] || 'New'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', width: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={feedbackProgress[feedback.id] || 0}
                            onChange={(e) => handleProgressChange(feedback.id, parseInt(e.target.value))}
                            style={{
                              flex: 1,
                              height: '6px',
                              borderRadius: '3px',
                              background: '#e2e8f0',
                              outline: 'none',
                              appearance: 'none'
                            }}
                          />
                          <span style={{ fontSize: '12px', color: '#64748b', minWidth: '30px' }}>
                            {feedbackProgress[feedback.id] || 0}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>
                        {feedback.date || 'N/A'}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleProgressChange(feedback.id, 25)}
                            style={{
                              padding: '6px 12px',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Start
                          </button>
                          <button
                            onClick={() => handleProgressChange(feedback.id, 100)}
                            style={{
                              padding: '6px 12px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Complete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
