import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Bell, FileText, CheckCheck, Trash2, Clock, Shield } from 'lucide-react';

export default function ActivityLogs() {
  const { notifications, activityLogs, addNotification } = useData();
  const [activeTab, setActiveTab] = useState('notifications');
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const markAllAsRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setLocalNotifications([]);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Audit Logs & <span className="heading-gradient">Activity</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track administrator configuration changes and live operational notifications</p>
        </div>

        {activeTab === 'notifications' && localNotifications.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={markAllAsRead} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', gap: '0.35rem' }}>
              <CheckCheck size={14} /> Mark all read
            </button>
            <button onClick={clearAllNotifications} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', gap: '0.35rem', borderColor: 'rgba(244,63,94,0.3)', color: '#fda4af' }}>
              <Trash2 size={14} /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Bell size={16} />
            <span>Live Alerts ({localNotifications.filter(n => !n.read).length})</span>
          </div>
        </button>
        <button
          className={`tab-btn ${activeTab === 'audit_logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit_logs')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={16} />
            <span>Admin Audit Logs</span>
          </div>
        </button>
      </div>

      {/* Tab Content: Notifications */}
      {activeTab === 'notifications' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {localNotifications.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>No new notifications or alerts found</p>
              </div>
            ) : (
              localNotifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    background: notif.read ? 'var(--surface-hover)' : 'rgba(139, 92, 246, 0.04)',
                    border: '1px solid var(--border-glass)',
                    borderColor: notif.read ? 'var(--border-glass)' : 'rgba(139, 92, 246, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: notif.type === 'Alert' ? 'rgba(244, 63, 94, 0.12)' : notif.type === 'Approvals' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                        color: notif.type === 'Alert' ? '#fda4af' : notif.type === 'Approvals' ? '#fbbf24' : '#60a5fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Bell size={16} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: notif.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {notif.title}
                      </strong>
                      <p style={{ fontSize: '0.82rem', color: notif.read ? 'var(--text-muted)' : 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.35 }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-block', marginTop: '0.4rem' }}>
                        {notif.date}
                      </span>
                    </div>
                  </div>

                  {!notif.read && (
                    <button
                      onClick={() => {
                        setLocalNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', border: 'none', background: 'var(--surface-hover)' }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Admin Audit Logs */}
      {activeTab === 'audit_logs' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Event</th>
                  <th>Details Log</th>
                  <th>Responsible User</th>
                  <th style={{ textAlign: 'right' }}>Security Scope</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  activityLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={12} />
                          <span>{log.date}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{log.action}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.details}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{log.user}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.email}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--accent-purple-soft)', background: 'rgba(139, 92, 246, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                          <Shield size={10} />
                          <span>Audit verified</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
