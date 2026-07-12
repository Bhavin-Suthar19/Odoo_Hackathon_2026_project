import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OrganizationSetup from './pages/OrganizationSetup';
import AssetDirectory from './pages/AssetDirectory';
import AssetAllocation from './pages/AssetAllocation';
import ResourceBooking from './pages/ResourceBooking';
import MaintenanceManagement from './pages/MaintenanceManagement';
import AssetAudit from './pages/AssetAudit';
import ReportsAnalytics from './pages/ReportsAnalytics';
import ActivityLogs from './pages/ActivityLogs';

import {
  LayoutDashboard,
  Settings,
  Layers,
  UserCheck,
  Calendar,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  ChevronRight
} from 'lucide-react';

function AppContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  // If user is not authenticated, render Login/Signup screens
  if (!user) {
    if (currentTab === 'signup') {
      return (
        <div className="app-container">
          <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
          <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Signup setCurrentTab={setCurrentTab} />
          </main>
        </div>
      );
    }
    return (
      <div className="app-container">
        <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Login setCurrentTab={setCurrentTab} />
        </main>
      </div>
    );
  }

  // Sidebar navigation options depending on role
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'org_setup', label: 'Organization Setup', icon: Settings, roles: ['Admin'] },
    { id: 'assets', label: 'Assets', icon: Layers, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'allocation', label: 'Allocation & Transfer', icon: UserCheck, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'booking', label: 'Resource Booking', icon: Calendar, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'audit', label: 'Audit', icon: ClipboardCheck, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Asset Manager', 'Department Head'] },
    { id: 'activity', label: 'Notifications & Logs', icon: Bell, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  ];

  const visibleItems = navigationItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Sidebar Navigation */}
        <aside
          style={{
            width: '260px',
            backgroundColor: '#0f131d',
            borderRight: '1px solid var(--border-glass)',
            padding: '1.5rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            flexShrink: 0,
          }}
        >
          <p style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', paddingLeft: '0.75rem', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Menu Navigation
          </p>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(139, 92, 246, 0.35)' : 'transparent',
                  color: isActive ? '#c4b5fd' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 600,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={18} color={isActive ? '#a78bfa' : 'var(--text-muted)'} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} color="#a78bfa" />}
              </button>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: '#090b10' }}>
          {currentTab === 'dashboard' && <Dashboard setCurrentTab={setCurrentTab} />}
          {currentTab === 'org_setup' && <OrganizationSetup />}
          {currentTab === 'assets' && <AssetDirectory />}
          {currentTab === 'allocation' && <AssetAllocation />}
          {currentTab === 'booking' && <ResourceBooking />}
          {currentTab === 'maintenance' && <MaintenanceManagement />}
          {currentTab === 'audit' && <AssetAudit />}
          {currentTab === 'reports' && <ReportsAnalytics />}
          {currentTab === 'activity' && <ActivityLogs />}
        </main>
      </div>

      <footer
        style={{
          textAlign: 'center',
          padding: '1.2rem',
          borderTop: '1px solid var(--border-glass)',
          backgroundColor: '#090b10',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          zIndex: 10,
        }}
      >
        AssetFlow Enterprise Resource Portal • High Fidelity Hackathon Submission
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
