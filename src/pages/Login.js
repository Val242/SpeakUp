import React, { useState } from 'react';

export default function Login() {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (email && password) {
        const username = (email || '').split('@')[0] || 'user';
        const name = email || 'User';
        const currentUser = { role, email, username, name };
        try {
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } catch {}

        if (role === 'admin') {
          window.location.hash = '#/admin';
        } else {
          window.location.hash = '#/collaborator';
        }
      } else {
        setError('Veuillez remplir tous les champs');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        width: 900, 
        display: 'flex',
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        
        {/* Description Section */}
        <div style={{ 
          flex: 1, 
          padding: 48,
          background: '#1e293b',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '50%',
            zIndex: 1
          }} />
          <div style={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '50%',
            zIndex: 1
          }} />
          
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 300 }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{
                width: 72,
                height: 72,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
              }}>
                <span style={{ fontSize: 32, color: 'white' }}>💬</span>
              </div>
              
              <h1 style={{ 
                fontSize: 36, 
                fontWeight: 800, 
                marginBottom: 12,
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Feedback Hub
              </h1>
              <p style={{ 
                fontSize: 18,
                lineHeight: 1.5,
                opacity: 0.8,
                fontWeight: 400
              }}>
                Plateforme collaborative
              </p>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div style={{ 
          flex: 1, 
          padding: 48,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 700, 
              color: '#1e293b',
              marginBottom: 8
            }}>
              Connexion
            </h2>
            <p style={{ 
              color: '#64748b', 
              fontSize: 16
            }}>
              Accédez à votre espace de travail
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 600, 
                color: '#374151', 
                marginBottom: 8
              }}>
                Rôle
              </label>
              <div style={{ 
                display: 'flex', 
                gap: 8,
                background: '#f1f5f9',
                padding: 4,
                borderRadius: 8
              }}>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: role === 'admin' ? '#3b82f6' : 'transparent',
                    color: role === 'admin' ? 'white' : '#64748b',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Administrateur
                </button>
                <button
                  type="button"
                  onClick={() => setRole('collaborator')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: role === 'collaborator' ? '#3b82f6' : 'transparent',
                    color: role === 'collaborator' ? 'white' : '#64748b',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Collaborateur
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 600, 
                color: '#374151', 
                marginBottom: 8
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ 
                display: 'block', 
                fontSize: 14, 
                fontWeight: 600, 
                color: '#374151', 
                marginBottom: 8
              }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: isLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#3b82f6';
                }
              }}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          color: '#dc2626',
          fontSize: 14,
          zIndex: 1000,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
