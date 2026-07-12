import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  UserCheck,
  Wrench,
  Calendar,
  ArrowRightLeft,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

export default function Dashboard({ setCurrentTab }) {
  const { user } = useAuth();
  const {
    assets,
    bookings,
    transfers,
    maintenances,
    activityLogs,
    allocateAsset,
    bookResource,
    raiseMaintenanceRequest
  } = useData();

  // Quick action form triggers
  const [showAssetQuick, setShowAssetQuick] = useState(false);
  const [showBookingQuick, setShowBookingQuick] = useState(false);
  const [showMaintQuick, setShowMaintQuick] = useState(false);

  // 1. Calculate KPI Statistics
  const totalAssetsCount = assets.length;
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
  const maintenanceCount = assets.filter(a => a.status === 'Under Maintenance').length;
  const activeBookingsCount = bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing').length;
  const pendingTransfersCount = transfers.filter(t => t.status === 'Requested').length;

  // 2. Identify Overdue Allocations (past expected return date)
  const todayStr = '2026-07-12'; // Mock today date
  const overdueAllocations = assets.filter(a => {
    if (a.status !== 'Allocated' || !a.expectedReturnDate) return false;
    return new Date(a.expectedReturnDate) < new Date(todayStr);
  });

  const upcomingReturns = assets.filter(a => {
    if (a.status !== 'Allocated' || !a.expectedReturnDate) return false;
    return new Date(a.expectedReturnDate) >= new Date(todayStr);
  });

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 850, lineHeight: 1.1 }}>
          Welcome back, <span className="heading-gradient">{user.name}</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Current Role Context: <strong>{user.role}</strong> ({user.department} Department)
        </p>
      </div>

      {/* Overdue Returns Alert Banner */}
      {overdueAllocations.length > 0 && (
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            animation: 'pulseGlow 3s infinite ease-in-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} color="#fda4af" />
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#fda4af' }}>
                {overdueAllocations.length} Assets Overdue for Action!
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Devices have exceeded their expected return dates. Please process returns or follow up.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('allocation')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', background: 'rgba(244, 63, 94, 0.2)', color: '#fda4af', border: 'none' }}
          >
            Review Overdue Lists <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        {/* KPI 1: Available */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Assets Available</span>
            <Layers size={18} color="var(--accent-emerald)" />
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>{availableCount}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready for employee allocation</p>
        </div>

        {/* KPI 2: Allocated */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Assets Allocated</span>
            <UserCheck size={18} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>{allocatedCount}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Held by employees/departments</p>
        </div>

        {/* KPI 3: Maintenance Today */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-rose)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Under Maintenance</span>
            <Wrench size={18} color="var(--accent-rose)" />
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>{maintenanceCount}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently out of service for repair</p>
        </div>

        {/* KPI 4: Active Bookings */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Active Bookings</span>
            <Calendar size={18} color="var(--accent-cyan)" />
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>{activeBookingsCount}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shared resources reserved</p>
        </div>

        {/* KPI 5: Pending Transfers */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #fca5a5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Pending Transfers</span>
            <ArrowRightLeft size={18} color="#fca5a5" />
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>{pendingTransfersCount}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Device custody transfers awaiting approval</p>
        </div>

        {/* KPI 6: Overdue Returns */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Overdue Returns</span>
            <Clock size={18} color="#f43f5e" />
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: overdueAllocations.length > 0 ? '#fda4af' : 'var(--text-primary)' }}>{overdueAllocations.length}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overdue return schedules flagged</p>
        </div>
      </div>

      {/* Quick Action Buttons section */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Operational Quick Actions</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        {(user.role === 'Admin' || user.role === 'Asset Manager') && (
          <button onClick={() => setCurrentTab('assets')} className="btn btn-primary" style={{ padding: '0.85rem 1.4rem' }}>
            <Plus size={18} /> Register New Asset
          </button>
        )}
        <button onClick={() => setCurrentTab('booking')} className="btn btn-secondary" style={{ padding: '0.85rem 1.4rem' }}>
          <Calendar size={18} /> Book Shared Resource
        </button>
        <button onClick={() => setCurrentTab('maintenance')} className="btn btn-secondary" style={{ padding: '0.85rem 1.4rem' }}>
          <Wrench size={18} /> Raise Maintenance Request
        </button>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '2rem', marginBottom: '2rem' }}>
        {/* Overdue Items Detail List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 850, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="#f43f5e" />
            <span>Overdue Returns Listing</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {overdueAllocations.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>
                All devices are returned or well within expected deadlines.
              </span>
            ) : (
              overdueAllocations.map(ast => (
                <div
                  key={ast.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.88rem' }}>{ast.name}</strong>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{ast.tag}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      Held by: <strong>{ast.currentHolder}</strong>
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 700 }}>
                    Due: {ast.expectedReturnDate}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 850, marginBottom: '1.25rem' }}>Recent Operations Stream</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activityLogs.slice(0, 4).map((log) => (
              <div key={log.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start', fontSize: '0.85rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a78bfa', marginTop: '0.35rem', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <strong>{log.action}</strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.1rem' }}>{log.details}</p>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>by {log.user} • {log.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
