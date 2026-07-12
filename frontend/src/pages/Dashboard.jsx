import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusCard from '../components/StatusCard';
import {
  Code2,
  Database,
  Terminal,
  Cookie,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Play,
  Send,
} from 'lucide-react';
import apiClient from '../api/client';

export default function Dashboard({ setCurrentTab }) {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [testingApi, setTestingApi] = useState(false);

  const runApiTest = async () => {
    setTestingApi(true);
    try {
      const res = await apiClient.get('/auth/me');
      setTestResult({
        status: 200,
        data: res.data,
      });
    } catch (err) {
      setTestResult({
        status: err.response?.status || 500,
        error: err.response?.data?.message || err.message,
      });
    } finally {
      setTestingApi(false);
    }
  };

  return (
    <div>
      {/* Hero Welcome Section */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(139, 92, 246, 0.15)',
            color: '#c4b5fd',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
          }}
        >
          4-Person Team Hackathon Architecture
        </span>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.15 }}>
          Ready to Build Your <span className="heading-gradient">Hackathon Winner</span>
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            maxWidth: '700px',
            margin: '0.75rem auto 0',
          }}
        >
          Clean separation of concerns between React Frontend (Port 5173) and Node/Express Backend
          (Port 5000), powered by Cloud Supabase.
        </p>
      </div>

      {/* Live Health & Connection Status Card */}
      <StatusCard />

      {/* Current User Auth & Cookie State Card */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: user ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cookie size={24} color={user ? '#34d399' : '#a78bfa'} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {user ? `Active Cookie Session: ${user.name}` : 'No Session Cookie Found'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {user
                  ? `Authenticated via ${user.provider} | HTTP-Only Cookie Active`
                  : 'Test the session & cookie flow by creating a demo account or logging in.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!user ? (
              <>
                <button
                  onClick={() => setCurrentTab('login')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Test Login
                </button>
                <button
                  onClick={() => setCurrentTab('signup')}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Test Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={runApiTest}
                disabled={testingApi}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <Send size={15} />
                {testingApi ? 'Testing API...' : 'Test Protected API (/api/auth/me)'}
              </button>
            )}
          </div>
        </div>

        {/* API Response Output Box */}
        {testResult && (
          <div
            style={{
              marginTop: '1.25rem',
              background: 'rgba(9, 11, 16, 0.85)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
            }}
          >
            <p style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem', fontWeight: 600 }}>
              API RESPONSE FROM BACKEND PORT 5000:
            </p>
            <pre style={{ color: 'var(--text-primary)', overflowX: 'auto' }}>
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* 4-Person Team Guide Breakdown */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.2rem' }}>
        👥 Team Collaboration Guide (Separation of Concerns)
      </h2>

      <div className="grid-2">
        {/* Frontend Developers Card */}
        <div className="glass-panel" style={{ padding: '1.6rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <Code2 size={24} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Frontend Developers (`frontend/`)
            </h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Build responsive pages and dynamic React UI components without touching server code.
          </p>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              fontSize: '0.88rem',
            }}
          >
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>•</span>
              <span>
                <strong>Pages:</strong> Create your new pages in <code>frontend/src/pages/</code>.
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>•</span>
              <span>
                <strong>API Calling:</strong> Import <code>apiClient</code> from{' '}
                <code>src/api/client.js</code>. It handles CORS and sends HTTP-Only cookies to
                Port 5000 automatically.
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>•</span>
              <span>
                <strong>Styling:</strong> Use <code>src/index.css</code> glassmorphic design tokens
                to keep the wow-factor UI.
              </span>
            </li>
          </ul>
        </div>

        {/* Backend Developers Card */}
        <div className="glass-panel" style={{ padding: '1.6rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <Database size={24} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Backend Developers (`backend/`)
            </h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Handle business logic, Cloud Supabase database queries, and secure session management.
          </p>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              fontSize: '0.88rem',
            }}
          >
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-primary)' }}>•</span>
              <span>
                <strong>Routes & Controllers:</strong> Add endpoints in <code>backend/routes/</code>{' '}
                and write business logic in <code>backend/controllers/</code>.
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-primary)' }}>•</span>
              <span>
                <strong>Cloud Supabase:</strong> Import <code>supabase</code> from{' '}
                <code>backend/config/supabase.js</code> to query tables or run auth actions.
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-primary)' }}>•</span>
              <span>
                <strong>Env Config:</strong> Update <code>SUPABASE_URL</code> and{' '}
                <code>SUPABASE_ANON_KEY</code> in <code>backend/.env</code>.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
