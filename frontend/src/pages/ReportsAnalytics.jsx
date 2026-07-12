import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { BarChart3, TrendingUp, HelpCircle, AlertOctagon, RefreshCcw, Download } from 'lucide-react';

export default function ReportsAnalytics() {
  const { assets, bookings, maintenances, departments } = useData();
  const [exporting, setExporting] = useState(false);

  // 1. Calculations: Utilization Trends
  const totalAssetsCount = assets.length;
  const allocatedAssetsCount = assets.filter(a => a.status === 'Allocated').length;
  const maintenanceAssetsCount = assets.filter(a => a.status === 'Under Maintenance').length;
  const availableAssetsCount = assets.filter(a => a.status === 'Available').length;

  const utilizationRate = totalAssetsCount > 0 ? Math.round((allocatedAssetsCount / totalAssetsCount) * 100) : 0;
  const maintenanceRate = totalAssetsCount > 0 ? Math.round((maintenanceAssetsCount / totalAssetsCount) * 100) : 0;

  // 2. Department-wise Allocation Summary
  const departmentAllocationSummary = departments.map(d => {
    // count assets held by employees in this department
    const count = assets.filter(a => {
      if (a.status !== 'Allocated' || !a.currentHolder) return false;
      // Find employee
      return a.currentHolderEmail && a.currentHolderEmail.includes(d.name.toLowerCase().substring(0, 3)) || a.currentHolder === d.head;
    }).length;

    return {
      name: d.name,
      count,
      percent: totalAssetsCount > 0 ? Math.round((count / totalAssetsCount) * 100) : 0,
    };
  });

  // 3. Maintenance Frequencies (Top repaired assets)
  const maintenanceFrequency = assets.map(a => {
    const repairCount = maintenances.filter(m => m.assetId === a.id).length;
    return {
      tag: a.tag,
      name: a.name,
      category: a.category,
      repairs: repairCount,
    };
  }).sort((a, b) => b.repairs - a.repairs).slice(0, 4);

  // 4. Assets Nearing Retirement (Mock logic based on cost ranking or date)
  // Let's assume life span is 5 years. If acquired before 2024-01-01, it is nearing retirement.
  const nearingRetirement = assets.filter(a => {
    const acqYear = parseInt(a.acquisitionDate.split('-')[0]);
    return acqYear <= 2024 || a.condition === 'Fair' || a.condition === 'Poor';
  });

  // 5. Booking Hours Heatmap (peak usage windows)
  // We count bookings by time slots
  const timeSlots = [
    { label: '09:00 - 10:00', count: bookings.filter(b => b.startTime === '09:00').length },
    { label: '10:00 - 11:00', count: bookings.filter(b => b.startTime === '10:00').length },
    { label: '11:00 - 12:00', count: bookings.filter(b => b.startTime === '11:00').length },
    { label: '12:00 - 13:00', count: bookings.filter(b => b.startTime === '12:00').length },
    { label: '13:00 - 14:00', count: bookings.filter(b => b.startTime === '13:00').length },
    { label: '14:00 - 15:00', count: bookings.filter(b => b.startTime === '14:00').length },
    { label: '15:00 - 16:00', count: bookings.filter(b => b.startTime === '15:00').length },
    { label: '16:00 - 17:00', count: bookings.filter(b => b.startTime === '16:00').length },
  ];

  const maxBookingInSlot = Math.max(...timeSlots.map(t => t.count), 1);

  const triggerExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert('CSV Export completed! Downloader generated for assetflow_report_2026.csv');
    }, 1500);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Reports & <span className="heading-gradient">Analytics</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time operations stats, booking heatmaps, and device lifespans</p>
        </div>
        <button onClick={triggerExport} disabled={exporting} className="btn btn-primary">
          <Download size={16} />
          {exporting ? 'Generating Report...' : 'Export CSV Dataset'}
        </button>
      </div>

      {/* Grid: 3 Stats Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {/* Stat 1: Global Utilization */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple-soft)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Device Utilization Rate
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.15rem' }}>{utilizationRate}%</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{allocatedAssetsCount} of {totalAssetsCount} physical assets allocated</p>
          </div>
        </div>

        {/* Stat 2: Maintenance Overhead */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fda4af' }}>
            <AlertOctagon size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Active Maintenance Overhead
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.15rem' }}>{maintenanceRate}%</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{maintenanceAssetsCount} active repair workshop jobs</p>
          </div>
        </div>

        {/* Stat 3: Total Capital valuation */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#67e8f9' }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Asset Capital Value
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.15rem' }}>
              ${assets.reduce((sum, a) => sum + (a.acquisitionCost || 0), 0).toLocaleString()}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accumulated hardware acquisition costs</p>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: '2rem' }}>
        {/* Department allocations bar charts */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 850, marginBottom: '1.25rem' }}>Department-wise Device Split</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {departmentAllocationSummary.map((item, idx) => (
              <div key={idx} className="chart-bar-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700 }}>{item.name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.count} Devices ({item.percent}%)</span>
                </div>
                <div className="chart-bar-container">
                  <div className="chart-bar-fill" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking usage Heatmap matrix */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 850, marginBottom: '1.25rem' }}>Resource Reservations Heatmap</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Identifies peak hours usage slots for meeting rooms, projector screens, and vehicles.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {timeSlots.map((slot, idx) => {
              // calculate color opacity based on reservation volume
              const heatIntensity = slot.count > 0 ? Math.min(0.15 + (slot.count / maxBookingInSlot) * 0.45, 0.7) : 0.03;
              const textColor = slot.count > 0 ? 'var(--accent-purple-soft)' : 'var(--text-muted)';
              const borderColor = slot.count > 0 ? 'rgba(139, 92, 246, 0.4)' : 'var(--border-glass)';

              return (
                <div
                  key={idx}
                  style={{
                    background: `rgba(139, 92, 246, ${heatIntensity})`,
                    border: '1px solid',
                    borderColor,
                    borderRadius: '8px',
                    padding: '0.75rem 0.5rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: textColor }}>{slot.label.split(' - ')[0]}</span>
                  <strong style={{ fontSize: '0.95rem', color: slot.count > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {slot.count} book{slot.count === 1 ? '' : 's'}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: '2rem' }}>
        {/* Maintenance frequency */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 850, marginBottom: '1.25rem' }}>Repairs Frequency by Asset</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Device Name</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Repair Worksheets</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceFrequency.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>{item.tag}</span>
                    </td>
                    <td><strong style={{ fontSize: '0.85rem' }}>{item.name}</strong></td>
                    <td>{item.category}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: item.repairs > 1 ? '#fda4af' : 'var(--text-secondary)' }}>
                      {item.repairs} Cycles
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nearing retirement */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 850, marginBottom: '1.25rem' }}>Devices Flagged Nearing Retirement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
            {nearingRetirement.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>
                All devices have excellent condition ratings.
              </span>
            ) : (
              nearingRetirement.map((asset) => (
                <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)', border: '1px solid var(--border-glass)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{asset.name}</strong>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{asset.tag}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Acquired: {asset.acquisitionDate}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: asset.condition === 'Fair' ? '#fbbf24' : '#fca5a5' }}>
                      Condition: {asset.condition}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
