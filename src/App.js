import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { userService, dashboardService, feedbackService, authService } from './services/apiService';

function App() {
  const statusConfig = {
    'Assigned': { label: 'Assigné', color: '#2196F3', bgColor: '#E3F2FD', borderColor: '#2196F3' },
    'In Progress': { label: 'En cours', color: '#FF9800', bgColor: '#FFF3E0', borderColor: '#FF9800' },
    'Completed': { label: 'Terminé', color: '#4CAF50', bgColor: '#E8F5E8', borderColor: '#4CAF50' },
    'On Hold': { label: 'En attente', color: '#9E9E9E', bgColor: '#F5F5F5', borderColor: '#9E9E9E' },
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [softError, setSoftError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [userData, setUserData] = useState({ name: 'Collaborator', role: 'Developer' });
  const [summaryStats, setSummaryStats] = useState({ assignedTasks: 0, inProgress: 0, completed: 0, overdue: 0, dueThisWeek: 0 });
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [feedbackDates, setFeedbackDates] = useState({});
  const [feedbackProgress, setFeedbackProgress] = useState({});

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const unreadCount = notifications.length;
  const currentUserRef = useRef(null);

  const addNotification = (text) => {
    setNotifications(prev => [`${new Date().toLocaleTimeString()} • ${text}`, ...prev]);
  };

  const inboxKeyFor = (username) => `inbox:${username}`;
  const assignmentsKeyFor = (username) => `assignments:${username}`;

  useEffect(() => {
    try {
      const cu = JSON.parse(localStorage.getItem('currentUser') || 'null');
      currentUserRef.current = cu;
      if (cu?.name) setUserData({ name: cu.name, role: cu.role === 'developer' ? 'Collaborator' : 'Developer' });
    } catch {}
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await userService.getProfile();
      setUserData(prev => ({ ...prev, ...data }));
    } catch (e) {
      setSoftError('Impossible de charger les données utilisateur');
    }
  };

  const fetchSummaryStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setSummaryStats(data);
    } catch (e) {
      setSoftError('Impossible de charger les statistiques');
    }
  };

  const fetchFeedbackList = async (page = 1, overrideFilters = null) => {
    try {
      setLoading(true);
      const filters = {};
      const effectiveStatus = overrideFilters?.status ?? statusFilter;
      if (effectiveStatus !== 'all') filters.status = effectiveStatus;
      const data = await feedbackService.getFeedbackList(page, 10, filters);
      const newList = (data.feedbacks || data.items || data);
      setFeedbackList(newList);
      const statusMap = {}; const datesMap = {}; const progressMap = {};
      newList.forEach(f => { statusMap[f.id] = f.status; datesMap[f.id] = f.dueDate || ''; progressMap[f.id] = f.progress || 0; });
      setFeedbackStatus(statusMap); setFeedbackDates(datesMap); setFeedbackProgress(progressMap);
    } catch (e) {
      // Non-bloquant: on affiche un banner et on charge depuis localStorage assignments
      setSoftError('Certaines données API n\'ont pas pu être chargées. Affichage des données locales.');
      try {
        const cu = currentUserRef.current;
        const username = cu?.username || 'user';
        const local = JSON.parse(localStorage.getItem(assignmentsKeyFor(username)) || '[]');
        setFeedbackList(local.map(x => ({ id: x.id, title: x.title, description: x.description, submittedBy: x.submittedBy, date: x.date, status: x.status, progress: x.progress })));
        const statusMap = {}; const datesMap = {}; const progressMap = {};
        local.forEach(f => { statusMap[f.id] = f.status; datesMap[f.id] = ''; progressMap[f.id] = f.progress || 0; });
        setFeedbackStatus(statusMap); setFeedbackDates(datesMap); setFeedbackProgress(progressMap);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      await feedbackService.updateFeedbackStatus(feedbackId, newStatus);
      setFeedbackStatus(prev => ({ ...prev, [feedbackId]: newStatus }));
      await fetchSummaryStats();
    } catch (e) {
      setFeedbackStatus(prev => ({ ...prev, [feedbackId]: newStatus }));
      setSoftError('Statut mis à jour localement (API indisponible)');
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
      setSoftError('Progression mise à jour localement (API indisponible)');
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

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    try { localStorage.removeItem('currentUser'); } catch {}
    window.location.hash = '#/';
  };

  const handlePageChange = (newPage) => { setCurrentPage(newPage); fetchFeedbackList(newPage); };
  const handleStatusFilterChange = (newStatus) => { setStatusFilter(newStatus); setCurrentPage(1); fetchFeedbackList(1, { status: newStatus }); };

  // Listen to inbox for new assignments
  useEffect(() => {
    const cu = currentUserRef.current; const username = cu?.username || 'user';
    const key = inboxKeyFor(username);
    const poll = () => {
      try {
        const inbox = JSON.parse(localStorage.getItem(key) || '[]');
        if (inbox.length > 0) {
          const item = inbox.shift();
          localStorage.setItem(key, JSON.stringify(inbox));
          addNotification(item.message || 'Nouvelle notification');
          // Refresh local assignments when inbox message arrives
          const local = JSON.parse(localStorage.getItem(assignmentsKeyFor(username)) || '[]');
          if (local.length > 0) {
            setFeedbackList(local.map(x => ({ id: x.id, title: x.title, description: x.description, submittedBy: x.submittedBy, date: x.date, status: x.status, progress: x.progress })));
            const statusMap = {}; const datesMap = {}; const progressMap = {};
            local.forEach(f => { statusMap[f.id] = f.status; datesMap[f.id] = ''; progressMap[f.id] = f.progress || 0; });
            setFeedbackStatus(statusMap); setFeedbackDates(datesMap); setFeedbackProgress(progressMap);
          }
        }
      } catch {}
    };
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { (async () => { setLoading(true); setError(null); await Promise.all([fetchUserData(), fetchSummaryStats(), fetchFeedbackList(1)]); setLoading(false); })(); }, []);

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig['Assigned'];
    return (
      <span className="status-badge" style={{ backgroundColor: config.bgColor, color: config.color, borderColor: config.borderColor }}>{config.label}</span>
    );
  };

  const ProgressBar = ({ progress, feedbackId }) => (
    <div className="progress-container">
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
      <div className="progress-controls">
        <input type="range" min="0" max="100" value={progress} onChange={(e) => updateProgress(feedbackId, parseInt(e.target.value))} className="progress-slider" />
        <span className="progress-text">{progress}%</span>
      </div>
    </div>
  );

  const startAction = (id) => updateFeedbackStatus(id, 'In Progress');
  const completeAction = (id) => { updateProgress(id, 100); };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container"><div className="loading-spinner"></div><p>Chargement du tableau de bord...</p></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {softError && (
        <div style={{ background: '#FEF3C7', color: '#92400E', padding: '10px 14px', border: '1px solid #FDE68A', borderRadius: 6, margin: '12px 16px' }}>
          {softError}
        </div>
      )}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Collaborator Dashboard</h1>
          <p className="welcome-message">Welcome back, {userData?.name || ''}</p>
        </div>
        <div className="user-profile">
          <div ref={notificationsRef} className="notification-bell" onClick={() => setShowNotifications(p => !p)} style={{ position: 'relative', marginRight: '16px', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6V9a6 6 0 10-12 0v7l-2 2v1h16v-1l-2-2z"/></svg>
            {unreadCount > 0 && (<span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#F44336', color: '#fff', borderRadius: '50%', fontSize: '10px', padding: '2px 6px' }}>{unreadCount}</span>)}
            {showNotifications && (
              <div style={{ position: 'absolute', right: 0, top: '28px', width: '300px', maxHeight: '320px', overflowY: 'auto', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px', zIndex: 1000, padding: '8px' }}>
                <strong style={{ display: 'block', marginBottom: '8px' }}>Notifications</strong>
                {notifications.length === 0 ? (<p style={{ margin: 0 }}>Aucune notification</p>) : (
                  notifications.map((text, idx) => (<div key={idx} style={{ background: '#F9FAFB', padding: '8px', borderRadius: '4px', marginBottom: '6px' }}>{text}</div>))
                )}
              </div>
            )}
          </div>
          <div className="avatar"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
          <div className="user-info">
            <p className="user-name">{userData.name}</p>
            <p className="user-role">{userData.role}</p>
            <button className="logout-btn" onClick={() => { try { localStorage.removeItem('currentUser'); } catch {}; window.location.hash = '#/'; }}>Se déconnecter</button>
          </div>
        </div>
      </header>

      <section className="summary-cards">
        <div className="summary-card"><div className="card-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg></div><div className="card-content"><h3 className="card-number">{feedbackList.length}</h3><p className="card-label">Assigned</p></div></div>
        <div className="summary-card"><div className="card-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg></div><div className="card-content"><h3 className="card-number">{Object.values(feedbackStatus).filter(s => s==='In Progress').length}</h3><p className="card-label">In Progress</p></div></div>
        <div className="summary-card"><div className="card-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div><div className="card-content"><h3 className="card-number">{Object.values(feedbackStatus).filter(s => s==='Completed').length}</h3><p className="card-label">Completed</p></div></div>
      </section>

      <section className="filters-section">
        <div className="filters-container">
          <div className="filter-group"><label htmlFor="status-filter">Filtrer par statut:</label><select id="status-filter" value={statusFilter} onChange={(e) => handleStatusFilterChange(e.target.value)} className="filter-select"><option value="all">Tous les statuts</option><option value="Assigned">Assigné</option><option value="In Progress">En cours</option><option value="Completed">Terminé</option><option value="On Hold">En attente</option></select></div>
        </div>
      </section>

      <section className="feedback-section">
        <h2 className="section-title">My Assigned Feedback</h2>
        <div className="feedback-list">
          {feedbackList.length === 0 ? (
            <div className="no-feedback"><p>Aucun feedback assigné pour le moment.</p></div>
          ) : (
            feedbackList.map((feedback) => (
              <div key={feedback.id} className="feedback-item">
                <div className="feedback-content">
                  <div className="feedback-header">
                    <h3 className="feedback-title">#{feedback.id} - {feedback.title}</h3>
                    <div className="feedback-badges"><StatusBadge status={feedbackStatus[feedback.id] || feedback.status} /></div>
                  </div>
                  <p className="feedback-submitted">Submitted by {feedback.submittedBy} on {feedback.date}</p>
                  <p className="feedback-description">{feedback.description}</p>
                  <div className="feedback-progress">
                    <label>Progression:</label>
                    <ProgressBar progress={feedbackProgress[feedback.id] || feedback.progress || 0} feedbackId={feedback.id} />
                  </div>
                  <div className="feedback-actions" style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-primary" onClick={() => startAction(feedback.id)}>Start</button>
                    <button className="btn-secondary" onClick={() => completeAction(feedback.id)}>Complete</button>
                  </div>
                </div>
                <div className="feedback-status">
                  <select value={feedbackStatus[feedback.id] || feedback.status} onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value)} className="status-dropdown">
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
      </section>

      {showLogoutModal && (
        <div className="modal-overlay"><div className="modal"><h3>Confirmation de déconnexion</h3><p>Êtes-vous sûr de vouloir vous déconnecter ?</p><div className="modal-actions"><button className="btn-secondary" onClick={() => setShowLogoutModal(false)}>Annuler</button><button className="btn-primary" onClick={handleLogout}>Se déconnecter</button></div></div></div>
      )}
    </div>
  );
}

export default App;
