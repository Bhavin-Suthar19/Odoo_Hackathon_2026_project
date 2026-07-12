import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main className="main-content">
          {currentTab === 'dashboard' && <Dashboard setCurrentTab={setCurrentTab} />}
          {currentTab === 'login' && <Login setCurrentTab={setCurrentTab} />}
          {currentTab === 'signup' && <Signup setCurrentTab={setCurrentTab} />}
        </main>
        <footer
          style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            borderTop: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
          }}
        >
          Hackathon Starter Base Project • Built with React 18, Express 4, and Cloud Supabase
        </footer>
      </div>
    </AuthProvider>
  );
}
