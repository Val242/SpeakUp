import React, { useEffect, useState } from 'react';
import App from './App';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

const getRouteFromHash = () => {
  const hash = window.location.hash || '#/login';
  const path = hash.replace('#', '');
  return path || '/login';
};

export default function Root() {
  const [route, setRoute] = useState(getRouteFromHash());

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route.startsWith('/admin')) {
    return <AdminDashboard />;
  }

  if (route.startsWith('/developer')) {
    return <App />;
  }

  return <Login />;
}

