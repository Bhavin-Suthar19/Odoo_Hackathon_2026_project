import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';

export default function Login({ setCurrentTab }) {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('hackathon2026');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);

    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      setCurrentTab('dashboard');
    } else {
      setLocalError(result.message);
    }
  };

  const handleQuickLogin = async (roleEmail) => {
    setSubmitting(true);
    setLocalError(null);
    const result = await login(roleEmail, 'hackathon2026');
    setSubmitting(false);
    if (result.success) {
      setCurrentTab('dashboard');
    } else {
      setLocalError(result.message);
    }
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@company.com', color: '#fda4af' },
    { label: 'Asset Manager', email: 'manager@company.com', color: '#67e8f9' },
    { label: 'Dept Head', email: 'priya@company.com', color: '#6ee7b7' },
    { label: 'Employee', email: 'raj@company.com', color: '#c4b5fd' },
  ];

  return (
    <div
      style={{
        maxWidth: '460px',
        margin: '2rem auto',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'var(--gradient-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Lock size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Asset<span className="heading-gradient">Flow</span> Sign In
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            ERP Resource & Lifecycle Portal
          </p>
        </div>

        {(localError || error) && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fda4af',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.88rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', top: '15px', left: '14px' }}
              />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.8rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@hackathon.dev"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', top: '15px', left: '14px' }}
              />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.8rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.9rem' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Developer Quick Impersonators Grid */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <ShieldAlert size={14} color="#a78bfa" />
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-purple-soft)', fontWeight: 700, textTransform: 'uppercase' }}>
              Developer Quick Access accounts:
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleQuickLogin(acc.email)}
                disabled={submitting}
                className="btn btn-secondary"
                style={{
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.1rem',
                }}
              >
                <span style={{ color: acc.color, fontWeight: 800 }}>{acc.label}</span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{acc.email}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
          }}
        >
          Don't have an account yet?{' '}
          <button
            onClick={() => setCurrentTab('signup')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-main)',
            }}
          >
            Create Employee Account
          </button>
        </div>
      </div>
    </div>
  );
}
