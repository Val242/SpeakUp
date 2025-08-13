import React, { useState } from 'react';

export default function Login() {
  const [role, setRole] = useState('admin');

  const go = () => {
    if (role === 'admin') {
      window.location.hash = '/admin';
    } else {
      window.location.hash = '/developer';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        width: 420, 
        padding: 48, 
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          opacity: 0.1
        }} />
        
        <div style={{ marginBottom: 40 }}>
          <div style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
          }}>
            <span style={{ fontSize: 36, color: 'white' }}>💬</span>
          </div>
          
          <h1 style={{ 
            fontSize: 32, 
            fontWeight: 700, 
            color: '#1a202c',
            marginBottom: 12,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Feedback Hub
          </h1>
          <p style={{ 
            color: '#718096', 
            fontSize: 18,
            lineHeight: 1.6
          }}>
            Connectez-vous à votre espace de travail
          </p>
        </div>
        
        <div style={{ marginBottom: 32 }}>
          <label style={{ 
            display: 'block', 
            textAlign: 'left',
            marginBottom: 12,
            fontWeight: 600,
            color: '#4a5568',
            fontSize: 16
          }}>
            Sélectionnez votre rôle
          </label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            style={{ 
              width: '100%', 
              padding: 16, 
              border: '2px solid #e2e8f0',
              borderRadius: 12,
              fontSize: 16,
              backgroundColor: '#fff',
              color: '#1a202c',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="admin">👑 Administrateur</option>
            <option value="developer">👨‍💻 Collaborateur</option>
          </select>
        </div>
        
        <button 
          onClick={go} 
          style={{ 
            width: '100%', 
            padding: 18, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff', 
            border: 0, 
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>
            Accéder au Dashboard
          </span>
        </button>

        {/* Footer */}
        <div style={{ 
          marginTop: 32, 
          paddingTop: 24, 
          borderTop: '1px solid #f1f5f9',
          fontSize: 14,
          color: '#94a3b8'
        }}>
          <p style={{ margin: 0 }}>
            Système de gestion des feedbacks et tâches
          </p>
        </div>
      </div>
    </div>
  );
}

