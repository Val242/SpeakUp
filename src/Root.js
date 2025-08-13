import React, { useState, useEffect } from 'react';
import CollaboratorDashboard from './pages/CollaboratorDashboard';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

export default function Root() {
  const [path, setPath] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setPath(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  let ComponentToRender;
  switch (path) {
    case '#/admin':
      ComponentToRender = AdminDashboard;
      break;
    case '#/collaborator':
      ComponentToRender = CollaboratorDashboard;
      break;
    default:
      ComponentToRender = Login;
      break;
  }

  return <ComponentToRender />;
}

