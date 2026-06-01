import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './App.css';

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState('login');

  if (user) return <Dashboard />;

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <h1>TaskFlow</h1>
        <p>Manage your tasks smarter.</p>
      </div>
      {page === 'login' ? (
        <Login onSwitch={() => setPage('register')} />
      ) : (
        <Register onSwitch={() => setPage('login')} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
