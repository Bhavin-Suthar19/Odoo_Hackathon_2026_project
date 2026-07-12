import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  ShieldAlert,
  LogOut
} from 'lucide-react';

function AppContent() {
  const { user, logout, impersonate } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  const mockUsers = [
    { name: 'Admin User', email: 'admin@company.com', role: 'Admin' },
    { name: 'Alex Mercer', email: 'manager@company.com', role: 'Asset Manager' },
    { name: 'Priya Shah', email: 'priya@company.com', role: 'Department Head' },
    { name: 'Raj Patel', email: 'raj@company.com', role: 'Employee' },
  ];

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('af_theme');
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('af_theme', theme);
    const isLight = theme === 'light';
    document.documentElement.classList.toggle('light', isLight);
    document.body.classList.toggle('light', isLight);
  }, [theme]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [currentTab]);

  // If user is not authenticated, render Login/Signup screens
  if (!user) {
    if (currentTab === 'signup') {
      return (
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar theme={theme} setTheme={setTheme} currentTab={currentTab} setCurrentTab={setCurrentTab} />
          <main style={{ flex: 1, display: 'flex', padding: '2rem 1.5rem', overflowY: 'auto' }}>
            <Signup setCurrentTab={setCurrentTab} />
          </main>
        </div>
      );
    }
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar theme={theme} setTheme={setTheme} currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main style={{ flex: 1, display: 'flex', padding: '2rem 1.5rem', overflowY: 'auto' }}>
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
  ];

  const visibleItems = navigationItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        theme={theme}
        setTheme={setTheme}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Sidebar Backdrop Overlay on Mobile */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
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
                  color: isActive ? 'var(--accent-purple-soft)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 600,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--surface-hover)';
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

          {/* Mobile Session Details & Actions */}
          <div className="sidebar-mobile-only">
            {/* Impersonation Panel */}
            {user && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  padding: '0.75rem',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldAlert size={14} color="#a78bfa" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple-soft)', fontWeight: 700 }}>
                    Impersonate Tester:
                  </span>
                </div>
                <select
                  value={user.email}
                  onChange={(e) => impersonate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    padding: '0.35rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {mockUsers.map((mu) => (
                    <option key={mu.email} value={mu.email}>
                      {mu.role} ({mu.name.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* User Profile Info & Sign Out */}
            {user && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        boxShadow: '0 0 8px #10b981',
                      }}
                    />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: 'var(--accent-purple-soft)',
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
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <LogOut size={16} />
                  <span>Exit Portal</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="app-main">
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
          backgroundColor: 'var(--bg-primary)',
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
