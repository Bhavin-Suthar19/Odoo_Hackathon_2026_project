import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowRight, AlertCircle, Building } from 'lucide-react';

export default function Signup({ setCurrentTab }) {
  const { signup, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      setSubmitting(false);
      return;
    }

    const result = await signup(name, email, password, department);
    setSubmitting(false);

    if (result.success) {
      setCurrentTab('dashboard');
    } else {
      setLocalError(result.message);
    }
  };

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
            <UserPlus size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Create <span className="heading-gradient">Employee Account</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            New employees register here. Roles can be promoted by Admin.
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
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '15px', left: '14px' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.8rem' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '15px', left: '14px' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.8rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@company.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <div style={{ position: 'relative' }}>
              <Building size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '15px', left: '14px' }} />
              <select
                className="form-input"
                style={{ paddingLeft: '2.8rem' }}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password (min. 6 characters)</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '15px', left: '14px' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.8rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <div
            style={{
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '10px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1.25rem',
              fontSize: '0.78rem',
              color: '#c4b5fd',
            }}
          >
            ℹ️ All new registrations start with <strong>Employee</strong> role. Only an Admin can promote accounts to Asset Manager, Department Head, or Admin.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem' }}
          >
            {submitting ? 'Creating Account...' : 'Register Employee Account'}
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
