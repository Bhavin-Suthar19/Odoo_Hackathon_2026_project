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
    { label: 'Admin', email: 'admin@company.com', color: 'var(--accent-rose-soft)' },
    { label: 'Asset Manager', email: 'manager@company.com', color: 'var(--accent-cyan)' },
    { label: 'Dept Head', email: 'priya@company.com', color: 'var(--accent-emerald-soft)' },
    { label: 'Employee', email: 'raj@company.com', color: 'var(--accent-purple-soft)' },
  ];

  return (
    <div className="auth-split-container">
      {/* Left Branding Pane */}
      <div className="auth-brand-pane">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gradient-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>AF</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Asset<span className="heading-gradient">Flow</span></h2>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 850, lineHeight: 1.25, color: 'var(--text-primary)' }}>
            Enterprise Resource & <span className="heading-gradient">Lifecycle ERP</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Centralize physical asset tracking, automate custody allocations, schedule shared resources, and manage inventory audits with high-fidelity analytics.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>✔</span>
            <span style={{ color: 'var(--text-secondary)' }}>Automated lifecycle and transfer audits</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>✔</span>
            <span style={{ color: 'var(--text-secondary)' }}>Time-slot reservations for shared devices</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>✔</span>
            <span style={{ color: 'var(--text-secondary)' }}>Advanced role-based developer tools</span>
          </div>
        </div>
      </div>

      {/* Right Form Pane */}
      <div className="auth-form-pane">
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
            Sign In
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Enter your credentials to access the workspace
          </p>
        </div>

        {(localError || error) && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: 'var(--accent-rose-soft)',
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
