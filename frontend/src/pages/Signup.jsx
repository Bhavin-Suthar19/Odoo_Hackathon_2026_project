import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function Signup({ setCurrentTab }) {
  const { signup, error } = useAuth();
  const [name, setName] = useState('Hackathon Developer');
  const [email, setEmail] = useState('dev' + Math.floor(Math.random() * 1000) + '@team.dev');
  const [password, setPassword] = useState('supersecret');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);

    const result = await signup(name, email, password);
    setSubmitting(false);

    if (result.success) {
      setCurrentTab('dashboard');
    } else {
      setLocalError(result.message);
    }
  };

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
            Join the Enterprise <span className="heading-gradient">AssetFlow ERP</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Create your account to start managing hardware specs, tracking deployments, reserving workspaces, and participating in automated lifecycle audits.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>✔</span>
            <span style={{ color: 'var(--text-secondary)' }}>Instantly link with your department team</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>✔</span>
            <span style={{ color: 'var(--text-secondary)' }}>Log activities and request custody transfers</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>✔</span>
            <span style={{ color: 'var(--text-secondary)' }}>Real-time database and security audits</span>
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
            <UserPlus size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Sign Up
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Register to join the organization workspace
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
            <label className="form-label">Full Name / Team Role</label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', top: '15px', left: '14px' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.8rem' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex - Lead Backend"
                required
              />
            </div>
          </div>

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
                placeholder="alex@hackathon.dev"
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
            {submitting ? 'Registering...' : 'Create Account & Start'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-glass)',
            textAlign: 'center',
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
          }}
        >
          Already have an account?{' '}
          <button
            onClick={() => setCurrentTab('login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-main)',
            }}
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
}
