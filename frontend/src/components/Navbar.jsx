import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab }) {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(9, 11, 16, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '0.8rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Brand Logo & Title */}
        <div
          onClick={() => {
            if (user) setCurrentTab('dashboard');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: user ? 'pointer' : 'default',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--gradient-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>AF</span>
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.02em' }}>
              Asset<span className="heading-gradient">Flow</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Enterprise Resource & Lifecycle ERP
            </p>
          </div>
        </div>


        {/* User Session Profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                  }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#c4b5fd',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="btn btn-secondary"
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  display: 'flex',
                  gap: '0.35rem',
                }}
              >
                <LogOut size={14} />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentTab('login')}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
              >
                Sign In
              </button>
              <button
                onClick={() => setCurrentTab('signup')}
                className="btn btn-primary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
