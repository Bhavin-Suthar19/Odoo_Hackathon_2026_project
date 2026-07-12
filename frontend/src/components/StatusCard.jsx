import React, { useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { Database, Server, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function StatusCard() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await authApi.checkHealth();
      setHealth(data);
    } catch (err) {
      setHealth({
        success: false,
        status: 'offline',
        message: 'Cannot connect to Backend API (Port 5000). Start server in backend/ directory.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const isOnline = health && health.status === 'online';
  const isSupabaseLive = health?.database?.configured;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Server size={22} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            System Architecture & Connection Health
          </h3>
        </div>
        <button
          onClick={fetchHealth}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Status
        </button>
      </div>

      <div className="grid-2">
        {/* Backend Node/Express Status */}
        <div
          style={{
            background: 'rgba(15, 19, 29, 0.65)',
            padding: '1.1rem',
            borderRadius: '14px',
            border: '1px solid var(--border-glass)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              EXPRESS BACKEND (PORT 5000)
            </span>
            <span className={`badge ${isOnline ? 'badge-online' : 'badge-warning'}`}>
              <span className={`status-dot ${isOnline ? 'online' : 'warning'}`}></span>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <p style={{ marginTop: '0.6rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {isOnline
              ? '✅ API endpoints & HTTP-Only cookies active'
              : '❌ Run `npm run dev` inside backend/ to launch Node/Express'}
          </p>
          <p style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Endpoint: <code>http://localhost:5000/api</code>
          </p>
        </div>

        {/* Cloud Supabase Status */}
        <div
          style={{
            background: 'rgba(15, 19, 29, 0.65)',
            padding: '1.1rem',
            borderRadius: '14px',
            border: '1px solid var(--border-glass)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              CLOUD SUPABASE DATABASE
            </span>
            <span className={`badge ${isSupabaseLive ? 'badge-online' : 'badge-warning'}`}>
              <Database size={12} />
              {isSupabaseLive ? 'CONFIGURED' : 'DEMO MODE'}
            </span>
          </div>
          <p style={{ marginTop: '0.6rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {isSupabaseLive
              ? '✅ Live Cloud Supabase project linked!'
              : '⚠️ Demo Session active. Update SUPABASE_URL & KEY in backend/.env'}
          </p>
          <p style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Config File: <code>backend/config/supabase.js</code>
          </p>
        </div>
      </div>
    </div>
  );
}
