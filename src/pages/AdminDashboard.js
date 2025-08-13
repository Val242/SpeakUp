import React, { useState, useEffect, useRef } from 'react';

export default function AdminDashboard() {
  // États pour la gestion de l'interface
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  
  // États pour les données
  const [developers, setDevelopers] = useState([]);
  
  const [feedbacks, setFeedbacks] = useState([]);

  // Notifications Admin
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [showAdminNotifications, setShowAdminNotifications] = useState(false);
  const adminNotificationsRef = useRef(null);
  const addNotification = (message) => {
    setAdminNotifications((prev) => [
      `${new Date().toLocaleTimeString()} • ${message}`,
      ...prev,
    ]);
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (adminNotificationsRef.current && !adminNotificationsRef.current.contains(e.target)) {
        setShowAdminNotifications(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Fonction de déconnexion
  const handleLogout = () => {
    window.location.hash = '#/';
  };

  // Fonction pour basculer la sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Fonction pour changer de vue
  const changeView = (view) => {
    setCurrentView(view);
  };

  // Fonction pour ouvrir le modal de feedback
  const openFeedbackModal = (feedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackModal(true);
  };

  // Fonction pour ouvrir le modal d'assignation
  const openAssignModal = (feedback) => {
    setSelectedFeedback(feedback);
    setShowAssignModal(true);
  };

  // Admin inbox polling for collaborator finish + new feedback detection
  const adminInboxRef = useRef([]);
  const prevIdsRef = useRef(new Set());
  useEffect(() => {
    const poll = () => {
      try {
        const inbox = JSON.parse(localStorage.getItem('inbox:admin') || '[]');
        if (inbox.length > 0) {
          const item = inbox.shift();
          localStorage.setItem('inbox:admin', JSON.stringify(inbox));
          addNotification(item.message || 'Notification');
        }
      } catch {}
    };
    const id = setInterval(poll, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // detect new feedback objects added to feedbacks state
    try {
      const current = new Set(feedbacks.map(f => f.id));
      const prev = prevIdsRef.current;
      feedbacks.forEach(f => { if (!prev.has(f.id)) addNotification(`Nouveau feedback: #${f.id}`); });
      prevIdsRef.current = current;
    } catch {}
  }, [feedbacks]);

  // Fonction pour assigner un feedback
  const assignFeedback = (feedbackId, developerId) => {
    const developer = developers.find(d => d.id === developerId);
    setFeedbacks(prev => prev.map(f => 
      f.id === feedbackId 
        ? { ...f, assignedTo: developer, status: 'In Progress' }
        : f
    ));
    
    // Mettre à jour le nombre de tâches du développeur
    setDevelopers(prev => prev.map(d => 
      d.id === developerId 
        ? { ...d, tasks: d.tasks + 1 }
        : d
    ));

    addNotification(`Feedback ${feedbackId} assigné à ${developer?.name || developerId}`);
    
    // Envoyer un event d'assignation au collaborateur (via localStorage)
    try {
      const assignedFeedback = feedbacks.find(f => f.id === feedbackId);
      const username = developer?.username || (developer?.email ? developer.email.split('@')[0] : 'user');
      const assignmentsKey = `assignments:${username}`;
      const inboxKey = `inbox:${username}`;
      const existing = JSON.parse(localStorage.getItem(assignmentsKey) || '[]');
      const payload = {
        id: assignedFeedback?.id || feedbackId,
        title: (assignedFeedback?.message || '').slice(0, 50) || `Feedback ${feedbackId}`,
        description: assignedFeedback?.message || '',
        submittedBy: assignedFeedback?.submitter?.name || 'Admin',
        date: new Date().toISOString().slice(0,10),
        status: 'In Progress',
        progress: 10
      };
      const updated = [
        ...existing.filter(it => it.id !== payload.id),
        payload
      ];
      localStorage.setItem(assignmentsKey, JSON.stringify(updated));
      // Inbox notification
      const inbox = JSON.parse(localStorage.getItem(inboxKey) || '[]');
      inbox.unshift({
        at: Date.now(),
        message: `Nouveau feedback assigné #${payload.id} - ${payload.title}`
      });
      localStorage.setItem(inboxKey, JSON.stringify(inbox));
    } catch {}
    
    setShowAssignModal(false);
  };

  // Fonction pour ajouter un développeur
  const addDeveloper = (developerData) => {
    const newDeveloper = {
      id: Date.now(),
      ...developerData,
      tasks: 0
    };
    setDevelopers(prev => [...prev, newDeveloper]);
    setShowDeveloperModal(false);
    addNotification(`Développeur ajouté: ${developerData.name}`);
  };

  // Fonction pour supprimer un développeur
  const deleteDeveloper = (developerId) => {
    const dev = developers.find(d => d.id === developerId);
    setDevelopers(prev => prev.filter(d => d.id !== developerId));
    addNotification(`Développeur supprimé: ${dev?.name || developerId}`);
  };

  // Fonction pour modifier un développeur
  const updateDeveloper = (developerId, updatedData) => {
    setDevelopers(prev => prev.map(d => 
      d.id === developerId ? { ...d, ...updatedData } : d
    ));
    addNotification(`Développeur modifié: ${updatedData.name || developerId}`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Left Sidebar - Rétractable */}
      <div style={{ 
        width: sidebarCollapsed ? '80px' : '280px', 
        backgroundColor: 'white', 
        padding: '24px 0',
        borderRight: '1px solid #E2E8F0',
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}>
        {/* Top Section */}
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!sidebarCollapsed && (
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>Dashboard</span>
            )}
            <div 
              style={{ 
                marginLeft: sidebarCollapsed ? '0' : 'auto', 
                cursor: 'pointer',
                fontSize: '20px',
                color: '#64748B'
              }}
              onClick={toggleSidebar}
            >
              {sidebarCollapsed ? '→' : '←'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: '24px 0' }}>
          <div 
            style={{ 
              padding: '12px 24px', 
              backgroundColor: currentView === 'dashboard' ? '#DBEAFE' : 'transparent', 
              color: currentView === 'dashboard' ? '#1E40AF' : '#64748B',
              fontWeight: '500',
              borderRadius: '8px',
              margin: '0 16px 8px 16px',
              cursor: 'pointer'
            }}
            onClick={() => changeView('dashboard')}
          >
            📊 {!sidebarCollapsed && 'Dashboard'}
          </div>
          <div 
            style={{ 
              padding: '12px 24px', 
              color: '#64748B', 
              cursor: 'pointer', 
              margin: '0 16px',
              borderRadius: '8px',
              backgroundColor: currentView === 'feedback' ? '#F1F5F9' : 'transparent'
            }}
            onClick={() => changeView('feedback')}
          >
            💬 {!sidebarCollapsed && 'Feedback'}
          </div>
          <div 
            style={{ 
              padding: '12px 24px', 
              color: '#64748B', 
              cursor: 'pointer', 
              margin: '0 16px',
              borderRadius: '8px',
              backgroundColor: currentView === 'unassigned' ? '#F1F5F9' : 'transparent'
            }}
            onClick={() => changeView('unassigned')}
          >
            📋 {!sidebarCollapsed && 'Unassigned'}
          </div>
          <div 
            style={{ 
              padding: '12px 24px', 
              color: '#64748B', 
              cursor: 'pointer', 
              margin: '0 16px',
              borderRadius: '8px',
              backgroundColor: currentView === 'in-progress' ? '#F1F5F9' : 'transparent'
            }}
            onClick={() => changeView('in-progress')}
          >
            ⏳ {!sidebarCollapsed && 'In Progress'}
          </div>
          <div 
            style={{ 
              padding: '12px 24px', 
              color: '#64748B', 
              cursor: 'pointer', 
              margin: '0 16px',
              borderRadius: '8px',
              backgroundColor: currentView === 'resolved' ? '#F1F5F9' : 'transparent'
            }}
            onClick={() => changeView('resolved')}
          >
            ✅ {!sidebarCollapsed && 'Resolved'}
          </div>
        </div>

        {/* Admin Section */}
        <div style={{ padding: '24px 0', borderTop: '1px solid #F1F5F9' }}>
          {!sidebarCollapsed && (
            <div style={{ 
              padding: '0 24px 16px', 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#64748B',
              textTransform: 'uppercase'
            }}>
              Manage
            </div>
          )}
          <div 
            style={{ 
              padding: '12px 24px', 
              color: currentView === 'developers' ? '#1E40AF' : '#64748B', 
              cursor: 'pointer', 
              margin: '0 16px',
              borderRadius: '8px',
              backgroundColor: currentView === 'developers' ? '#DBEAFE' : 'transparent'
            }}
            onClick={() => changeView('developers')}
          >
            👥 {!sidebarCollapsed && 'Developers'}
          </div>
          <div 
            style={{ 
              padding: '12px 24px', 
              color: '#64748B', 
              cursor: 'pointer', 
              margin: '0 16px',
              borderRadius: '8px',
              backgroundColor: currentView === 'settings' ? '#F1F5F9' : 'transparent'
            }}
            onClick={() => changeView('settings')}
          >
            ⚙️ {!sidebarCollapsed && 'Settings'}
          </div>
        </div>

        {/* Feedback Button */}
        <div style={{ padding: '24px', marginTop: 'auto' }}>
          <button style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            💬 {!sidebarCollapsed && 'Feedback'}
          </button>
        </div>

        {/* User Profile avec déconnexion */}
        <div style={{ 
          padding: '24px', 
          borderTop: '1px solid #F1F5F9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: sidebarCollapsed ? 'column' : 'row' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#E2E8F0', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: sidebarCollapsed ? '0' : '12px',
              marginBottom: sidebarCollapsed ? '8px' : '0'
            }}>
              👤
            </div>
            {!sidebarCollapsed && (
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', color: '#1E293B' }}>sarah@example.com</div>
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '4px 0',
                    marginTop: '4px',
                    textDecoration: 'underline'
                  }}
                >
                  Se déconnecter
                </button>
              </div>
            )}
            {/* Bouton de déconnexion toujours visible même en mode collapsed */}
            {sidebarCollapsed && (
              <button 
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  marginTop: '8px'
                }}
                title="Se déconnecter"
              >
                🚪
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Top Header */}
        <header style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1E293B' }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div ref={adminNotificationsRef} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowAdminNotifications(p => !p)}>
              🔔
              {adminNotifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {adminNotifications.length}
                </span>
              )}
              {showAdminNotifications && (
                <div style={{
                  position: 'absolute', right: 0, top: '24px', width: '300px', maxHeight: '320px', overflowY: 'auto',
                  background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px', zIndex: 1000, padding: '8px'
                }}>
                  <strong style={{ display: 'block', marginBottom: '8px' }}>Notifications</strong>
                  {adminNotifications.length === 0 ? (
                    <p style={{ margin: 0 }}>Aucune notification</p>
                  ) : (
                    adminNotifications.map((text, idx) => (
                      <div key={idx} style={{ background: '#F9FAFB', padding: '8px', borderRadius: '4px', marginBottom: '6px' }}>{text}</div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div style={{ cursor: 'pointer' }}>⚙️</div>
            <button 
              onClick={handleLogout}
              style={{
                background: 'none', border: 'none', color: '#EF4444', fontSize: '14px', cursor: 'pointer', padding: '8px 16px', borderRadius: '6px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              🚪 Se déconnecter
            </button>
            <div style={{ 
              width: '40px', height: '40px', backgroundColor: '#E2E8F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              👤
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div style={{ padding: '24px' }}>
          {/* Rendu conditionnel selon la vue */}
          {currentView === 'dashboard' && (
            <>
              {/* Summary Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '24px',
                marginBottom: '32px'
              }}>
            {/* Total Feedback */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: '#1E293B' }}>
                    {feedbacks.length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>
                    Total Feedback
                  </div>
                  <div style={{ fontSize: '14px', color: '#10B981' }}>Total des feedbacks reçus</div>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#DBEAFE', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  💬
                </div>
              </div>
            </div>

            {/* Unassigned */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: '#1E293B' }}>
                    {feedbacks.filter(f => !f.assignedTo).length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>
                    Unassigned
                  </div>
                  <div style={{ fontSize: '14px', color: '#EF4444' }}>En attente d'assignation</div>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#FEF3C7', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  📁
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: '#1E293B' }}>
                    {feedbacks.filter(f => f.status === 'In Progress').length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>
                    In Progress
                  </div>
                  <div style={{ fontSize: '14px', color: '#10B981' }}>En cours de traitement</div>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#DBEAFE', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  ⏳
                </div>
              </div>
            </div>

            {/* Resolved */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '600', color: '#1E293B' }}>
                    {feedbacks.filter(f => f.status === 'Resolved').length}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>
                    Resolved
                  </div>
                  <div style={{ fontSize: '14px', color: '#10B981' }}>Résolus avec succès</div>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#D1FAE5', 
                  borderRadius: '12px',
                  display: 'flex',
                                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  ✅
                </div>
              </div>
            </div>
          </div>

          {/* Recent Feedback Table */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            marginBottom: '32px'
          }}>
            <div style={{ 
              padding: '24px 24px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>Recent Feedback</h2>
              <a href="#" style={{ color: '#3B82F6', textDecoration: 'none' }}>View all</a>
            </div>
            
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ID</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>SUBMITTER</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>MESSAGE</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>STATUS</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ASSIGNED TO</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>DATE</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {/* FB-001 */}
                  {feedbacks.slice(0,3).map((row, idx) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>#{row.id}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', backgroundColor: '#E2E8F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#64748B' }}>
                            {row.submitter.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>{row.submitter.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{row.submitter.email}</div>
                          </div>
                        </div>
                      </td>
                      <td 
                        style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', maxWidth: '300px', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => openFeedbackModal(row)}
                      >
                        {row.message.substring(0, 50)}...
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          backgroundColor: row.status === 'New' ? '#FEF3C7' : row.status === 'In Progress' ? '#DBEAFE' : '#D1FAE5',
                          color: row.status === 'New' ? '#F59E0B' : row.status === 'In Progress' ? '#3B82F6' : '#10B981',
                          padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', whiteSpace: 'nowrap'
                        }}>
                          {row.status === 'Resolved' ? 'Resolved' : (row.status === 'In Progress' ? 'In Progress' : 'New')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {row.assignedTo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', backgroundColor: '#3B82F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white' }}>
                              {row.assignedTo.name.split(' ').map(n => n.charAt(0)).join('')}
                            </div>
                            <span style={{ fontSize: '14px', color: '#1E293B' }}>{row.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#64748B' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>{row.date}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {!row.assignedTo && row.status === 'New' && (
                            <button 
                              style={{ padding: '6px 12px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                              onClick={() => openAssignModal(row)}
                            >
                              Assign
                            </button>
                          )}
                          {row.assignedTo && row.status === 'In Progress' && (
                            <button 
                              style={{ padding: '6px 12px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                              onClick={() => {
                                // Update -> just keep modal to edit if needed
                                openFeedbackModal(row);
                              }}
                            >
                              Update
                            </button>
                          )}
                          {row.status === 'Resolved' && (
                            <button 
                              style={{ padding: '6px 12px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                              onClick={() => {
                                // Close the feedback (archive locally)
                                setFeedbacks(prev => prev.filter(f => f.id !== row.id));
                              }}
                            >
                              Close
                            </button>
                          )}
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748B' }}>⋮</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dashboard Widgets */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px'
          }}>
            {/* Developer Workload */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '20px' }}>
                Developer Workload
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {developers.map(developer => {
                  const maxTasks = Math.max(...developers.map(d => d.tasks), 1);
                  const percentage = (developer.tasks / maxTasks) * 100;
                  
                  return (
                    <div key={developer.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        backgroundColor: '#3B82F6', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        color: 'white',
                        fontWeight: '600'
                      }}>
                        {developer.name.split(' ').map(n => n.charAt(0)).join('')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '6px' }}>
                          {developer.name}
                        </div>
                        <div style={{ 
                          width: '100%', 
                          height: '10px', 
                          backgroundColor: '#F1F5F9', 
                          borderRadius: '6px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: '#3B82F6',
                            borderRadius: '6px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        color: '#1E293B',
                        minWidth: '50px',
                        textAlign: 'right'
                      }}>
                        {developer.tasks} tasks
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback Status */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '20px' }}>
                Feedback Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {(() => {
                  const total = feedbacks.length;
                  const newCount = feedbacks.filter(f => f.status === 'New').length;
                  const inProgressCount = feedbacks.filter(f => f.status === 'In Progress').length;
                  const resolvedCount = feedbacks.filter(f => f.status === 'Resolved').length;
                  
                  const statuses = [
                    { name: 'NEW', count: newCount, color: '#3B82F6', bgColor: '#3B82F6' },
                    { name: 'IN PROGRESS', count: inProgressCount, color: '#8B5CF6', bgColor: '#8B5CF6' },
                    { name: 'RESOLVED', count: resolvedCount, color: '#10B981', bgColor: '#10B981' }
                  ];
                  
                  return statuses.map(status => {
                    const percentage = total > 0 ? (status.count / total) * 100 : 0;
                    
                    return (
                      <div key={status.name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                          width: '70px', 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          color: status.color,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {status.name}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            width: '100%', 
                            height: '10px', 
                            backgroundColor: '#F1F5F9', 
                            borderRadius: '6px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: status.bgColor,
                              borderRadius: '6px',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                        <div style={{ 
                          fontSize: '13px', 
                          fontWeight: '600', 
                          color: '#1E293B',
                          minWidth: '45px',
                          textAlign: 'right'
                        }}>
                          {Math.round(percentage)}%
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </>
          )}

          {/* Vue Developers */}
          {currentView === 'developers' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1E293B' }}>
                  Gestion des Développeurs
                </h2>
                <button 
                  onClick={() => setShowDeveloperModal(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  + Ajouter un développeur
                </button>
              </div>

              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px',
                border: '1px solid #E2E8F0'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Nom</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Email</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Identifiant</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Tâches</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {developers.map(developer => (
                      <tr key={developer.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B' }}>
                          {developer.name}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>
                          {developer.email}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>
                          {developer.username}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                          {developer.tasks}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => {
                                setSelectedDeveloper(developer);
                                setShowDeveloperModal(true);
                              }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#10B981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Modifier
                            </button>
                            <button 
                              onClick={() => deleteDeveloper(developer.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#EF4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vue Feedback */}
          {currentView === 'feedback' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1E293B', marginBottom: '24px' }}>
                Tous les Feedbacks
              </h2>
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px',
                border: '1px solid #E2E8F0'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ID</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>SUBMITTER</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>MESSAGE</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>STATUS</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ASSIGNED TO</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>DATE</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map(feedback => (
                      <tr key={feedback.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                          {feedback.id}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              backgroundColor: '#E2E8F0', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: '#64748B'
                            }}>
                              {feedback.submitter.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>
                                {feedback.submitter.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {feedback.submitter.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td 
                          style={{ 
                            padding: '16px 24px', 
                            fontSize: '14px', 
                            color: '#1E293B', 
                            maxWidth: '300px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                          onClick={() => openFeedbackModal(feedback)}
                        >
                          {feedback.message.substring(0, 50)}...
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            backgroundColor: 
                              feedback.status === 'New' ? '#FEF3C7' :
                              feedback.status === 'In Progress' ? '#DBEAFE' :
                              feedback.status === 'Resolved' ? '#D1FAE5' : '#FEF3C7',
                            color: 
                              feedback.status === 'New' ? '#F59E0B' :
                              feedback.status === 'In Progress' ? '#3B82F6' :
                              feedback.status === 'Resolved' ? '#10B981' : '#F59E0B',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            border: 'none',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}>
                            {feedback.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {feedback.assignedTo ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ 
                                width: '24px', 
                                height: '24px', 
                                backgroundColor: '#3B82F6', 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                color: 'white'
                              }}>
                                {feedback.assignedTo.name.split(' ').map(n => n.charAt(0)).join('')}
                              </div>
                              <span style={{ fontSize: '14px', color: '#1E293B' }}>
                                {feedback.assignedTo.name}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#64748B' }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>
                          {feedback.date}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {!feedback.assignedTo && (
                              <button 
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#3B82F6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer'
                                }}
                                onClick={() => openAssignModal(feedback)}
                              >
                                Assign
                              </button>
                            )}
                            <button style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '16px',
                              color: '#64748B'
                            }}>
                              ⋮
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vue Unassigned */}
          {currentView === 'unassigned' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1E293B', marginBottom: '24px' }}>
                Feedbacks Non Assignés
              </h2>
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px',
                border: '1px solid #E2E8F0'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ID</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>SUBMITTER</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>MESSAGE</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>DATE</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.filter(f => !f.assignedTo).map(feedback => (
                      <tr key={feedback.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                          {feedback.id}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              backgroundColor: '#E2E8F0', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: '#64748B'
                            }}>
                              {feedback.submitter.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>
                                {feedback.submitter.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {feedback.submitter.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td 
                          style={{ 
                            padding: '16px 24px', 
                            fontSize: '14px', 
                            color: '#1E293B', 
                            maxWidth: '300px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                          onClick={() => openFeedbackModal(feedback)}
                        >
                          {feedback.message.substring(0, 50)}...
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>
                          {feedback.date}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <button 
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#3B82F6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                            onClick={() => openAssignModal(feedback)}
                          >
                            Assigner
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vue In Progress */}
          {currentView === 'in-progress' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1E293B', marginBottom: '24px' }}>
                Feedbacks En Cours
              </h2>
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px',
                border: '1px solid #E2E8F0'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ID</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>SUBMITTER</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>MESSAGE</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ASSIGNED TO</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>PROGRESS</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>DATE</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.filter(f => f.assignedTo && f.status === 'In Progress').map(feedback => (
                      <tr key={feedback.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                          {feedback.id}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              backgroundColor: '#E2E8F0', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: '#64748B'
                            }}>
                              {feedback.submitter.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>
                                {feedback.submitter.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {feedback.submitter.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td 
                          style={{ 
                            padding: '16px 24px', 
                            fontSize: '14px', 
                            color: '#1E293B', 
                            maxWidth: '300px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                          onClick={() => openFeedbackModal(feedback)}
                        >
                          {feedback.message.substring(0, 50)}...
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              backgroundColor: '#3B82F6', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: 'white'
                            }}>
                              {feedback.assignedTo.name.split(' ').map(n => n.charAt(0)).join('')}
                            </div>
                            <span style={{ fontSize: '14px', color: '#1E293B' }}>
                              {feedback.assignedTo.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              width: '100px', 
                              height: '8px', 
                              backgroundColor: '#F1F5F9', 
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${feedback.progress}%`,
                                height: '100%',
                                backgroundColor: '#3B82F6',
                                borderRadius: '4px'
                              }} />
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748B', minWidth: '40px' }}>
                              {feedback.progress}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>
                          {feedback.date}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <button 
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#10B981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              // Marquer comme résolu
                              setFeedbacks(prev => prev.map(f => 
                                f.id === feedback.id 
                                  ? { ...f, status: 'Resolved', progress: 100 }
                                  : f
                              ));
                            }}
                          >
                            Marquer résolu
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vue Resolved */}
          {currentView === 'resolved' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1E293B', marginBottom: '24px' }}>
                Feedbacks Résolus
              </h2>
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px',
                border: '1px solid #E2E8F0'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ID</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>SUBMITTER</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>MESSAGE</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ASSIGNED TO</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>DATE RÉSOLUTION</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.filter(f => f.status === 'Resolved').map(feedback => (
                      <tr key={feedback.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>
                          {feedback.id}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              backgroundColor: '#E2E8F0', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: '#64748B'
                            }}>
                              {feedback.submitter.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>
                                {feedback.submitter.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {feedback.submitter.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td 
                          style={{ 
                            padding: '16px 24px', 
                            fontSize: '14px', 
                            color: '#1E293B', 
                            maxWidth: '300px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                          onClick={() => openFeedbackModal(feedback)}
                        >
                          {feedback.message.substring(0, 50)}...
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              backgroundColor: '#3B82F6', 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: 'white'
                            }}>
                              {feedback.assignedTo.name.split(' ').map(n => n.charAt(0)).join('')}
                            </div>
                            <span style={{ fontSize: '14px', color: '#1E293B' }}>
                              {feedback.assignedTo.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>
                          {feedback.date}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <button 
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#F1F5F9',
                              color: '#64748B',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vue Settings */}
          {currentView === 'settings' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1E293B', marginBottom: '24px' }}>
                Paramètres
              </h2>
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px'
              }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B', marginBottom: '16px' }}>
                    Notifications
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <input type="checkbox" id="email-notifications" defaultChecked />
                    <label htmlFor="email-notifications" style={{ color: '#1E293B' }}>
                      Notifications par email
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" id="browser-notifications" defaultChecked />
                    <label htmlFor="browser-notifications" style={{ color: '#1E293B' }}>
                      Notifications navigateur
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B', marginBottom: '16px' }}>
                    Interface
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <input type="checkbox" id="dark-mode" />
                    <label htmlFor="dark-mode" style={{ color: '#1E293B' }}>
                      Mode sombre
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" id="compact-view" />
                    <label htmlFor="compact-view" style={{ color: '#1E293B' }}>
                      Vue compacte
                    </label>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button 
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Help Button */}
      <button style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
        backgroundColor: '#8B5CF6',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        ❓
      </button>

      {/* Modal de Feedback */}
      {showFeedbackModal && selectedFeedback && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1E293B' }}>
                {selectedFeedback.id} - {selectedFeedback.submitter.name}
              </h3>
              <button 
                onClick={() => setShowFeedbackModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#64748B' }}>Soumis par:</strong>
                <div style={{ color: '#1E293B', marginTop: '4px' }}>
                  {selectedFeedback.submitter.name} ({selectedFeedback.submitter.email})
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#64748B' }}>Date:</strong>
                <div style={{ color: '#1E293B', marginTop: '4px' }}>
                  {selectedFeedback.date}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#64748B' }}>Statut:</strong>
                <div style={{ marginTop: '4px' }}>
                  <span style={{
                    backgroundColor: 
                      selectedFeedback.status === 'New' ? '#FEF3C7' :
                      selectedFeedback.status === 'In Progress' ? '#DBEAFE' :
                      selectedFeedback.status === 'Resolved' ? '#D1FAE5' : '#FEF3C7',
                    color: 
                      selectedFeedback.status === 'New' ? '#F59E0B' :
                      selectedFeedback.status === 'In Progress' ? '#3B82F6' :
                      selectedFeedback.status === 'Resolved' ? '#10B981' : '#F59E0B',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {selectedFeedback.status}
                  </span>
                </div>
              </div>

              {selectedFeedback.assignedTo && (
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: '#64748B' }}>Assigné à:</strong>
                  <div style={{ color: '#1E293B', marginTop: '4px' }}>
                    {selectedFeedback.assignedTo.name}
                  </div>
                </div>
              )}

              {selectedFeedback.progress > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: '#64748B' }}>Progression:</strong>
                  <div style={{ marginTop: '8px' }}>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#F1F5F9',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${selectedFeedback.progress}%`,
                        height: '100%',
                        backgroundColor: '#3B82F6',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      {selectedFeedback.progress}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <strong style={{ color: '#64748B' }}>Message:</strong>
              <div style={{ 
                color: '#1E293B', 
                marginTop: '8px',
                lineHeight: '1.6',
                backgroundColor: '#F8FAFC',
                padding: '16px',
                borderRadius: '8px'
              }}>
                {selectedFeedback.message}
              </div>
            </div>

            {selectedFeedback.photos && selectedFeedback.photos.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <strong style={{ color: '#64748B' }}>Photos soumises:</strong>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '12px',
                  marginTop: '8px'
                }}>
                  {selectedFeedback.photos.map((photo, index) => (
                    <div key={index} style={{
                      backgroundColor: '#F1F5F9',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{photo}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              {!selectedFeedback.assignedTo && (
                <button 
                  onClick={() => {
                    setShowFeedbackModal(false);
                    openAssignModal(selectedFeedback);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Assigner
                </button>
              )}
              <button 
                onClick={() => setShowFeedbackModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'Assignation */}
      {showAssignModal && selectedFeedback && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1E293B', marginBottom: '24px' }}>
              Assigner le feedback {selectedFeedback.id}
            </h3>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1E293B' }}>
                Sélectionner un développeur:
              </label>
              <select 
                id="developer-select"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Choisir un développeur...</option>
                {developers.map(developer => (
                  <option key={developer.id} value={developer.id}>
                    {developer.name} ({developer.username})
                  </option>
                ))}
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={() => setShowAssignModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  const select = document.getElementById('developer-select');
                  if (select.value) {
                    assignFeedback(selectedFeedback.id, parseInt(select.value));
                  }
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Assigner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Développeur */}
      {showDeveloperModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1E293B', marginBottom: '24px' }}>
              {selectedDeveloper ? 'Modifier le développeur' : 'Ajouter un développeur'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const developerData = {
                name: formData.get('name'),
                email: formData.get('email'),
                username: formData.get('username')
              };
              
              if (selectedDeveloper) {
                updateDeveloper(selectedDeveloper.id, developerData);
              } else {
                addDeveloper(developerData);
              }
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1E293B' }}>
                  Nom complet:
                </label>
                <input 
                  name="name"
                  type="text"
                  defaultValue={selectedDeveloper?.name || ''}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1E293B' }}>
                  Email:
                </label>
                <input 
                  name="email"
                  type="email"
                  defaultValue={selectedDeveloper?.email || ''}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1E293B' }}>
                  Identifiant de connexion:
                </label>
                <input 
                  name="username"
                  type="text"
                  defaultValue={selectedDeveloper?.username || ''}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button 
                  type="button"
                  onClick={() => {
                    setShowDeveloperModal(false);
                    setSelectedDeveloper(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#F1F5F9',
                    color: '#64748B',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {selectedDeveloper ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
