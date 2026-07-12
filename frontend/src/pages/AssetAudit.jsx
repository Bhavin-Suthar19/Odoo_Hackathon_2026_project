import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, Plus, Check, X, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';
import Modal from '../components/Modal';

export default function AssetAudit() {
  const { user } = useAuth();
  const {
    audits,
    assets,
    employees,
    departments,
    createAuditCycle,
    updateAuditChecklist,
    closeAuditCycle
  } = useData();

  // Create Audit form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [auditName, setAuditName] = useState('');
  const [scopeDept, setScopeDept] = useState('Engineering');
  const [scopeLocation, setScopeLocation] = useState('HQ Office 101');
  const [assignedAuditorEmail, setAssignedAuditorEmail] = useState('');

  // Selected active audit cycle to view checklist
  const [selectedAuditId, setSelectedAuditId] = useState('');
  const [auditNotes, setAuditNotes] = useState('');

  const handleCreateAuditSubmit = (e) => {
    e.preventDefault();
    if (!auditName || !assignedAuditorEmail) return;

    createAuditCycle(auditName, scopeDept, scopeLocation, assignedAuditorEmail, user);
    setAuditName('');
    setScopeLocation('HQ Office 101');
    setAssignedAuditorEmail('');
    setShowCreateModal(false);
    alert('Audit cycle created successfully!');
  };

  const handleAuditAction = (auditId, assetId, result) => {
    const notes = prompt(`Enter optional audit notes for this item:`) || '';
    updateAuditChecklist(auditId, assetId, result, notes, user);
  };

  const handleCloseAudit = (auditId) => {
    if (confirm('Are you sure you want to CLOSE this audit cycle? This will lock all checklist entries and mark missing assets as "Lost" in the system.')) {
      closeAuditCycle(auditId, user);
      alert('Audit cycle closed and locked.');
    }
  };

  // Find active audit and scope assets
  const activeAudit = audits.find(a => a.id === selectedAuditId) || audits[0];
  const isSelected = activeAudit ? true : false;

  // Filter assets matching the audit scope
  const scopeAssets = activeAudit
    ? assets.filter(a => {
        // If department matches employee department or location matches
        const holder = employees.find(e => e.name === a.currentHolder);
        const deptMatch = !activeAudit.scopeDept || (holder && holder.department === activeAudit.scopeDept);
        const locMatch = !activeAudit.scopeLocation || a.location.toLowerCase().includes(activeAudit.scopeLocation.toLowerCase());
        return deptMatch || locMatch;
      })
    : [];

  const isAuditorOrManager = activeAudit && (
    user.email === activeAudit.assignedAuditorEmail ||
    user.role === 'Asset Manager' ||
    user.role === 'Admin'
  );

  const canClose = user.role === 'Admin' || user.role === 'Asset Manager';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="page-title">Asset <span className="heading-gradient">Audits</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Run structured verification cycles, track missing items, and review discrepancy logs</p>
        </div>
        {(user.role === 'Admin' || user.role === 'Asset Manager') && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} /> Create Audit Cycle
          </button>
        )}
      </div>

      <div className="audit-grid">
        {/* Left column: Audit Cycles List */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Audit Cycles
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {audits.map((aud) => {
              const isActive = (activeAudit && activeAudit.id === aud.id);
              return (
                <button
                  key={aud.id}
                  onClick={() => setSelectedAuditId(aud.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                    textAlign: 'left',
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'var(--surface-hover)',
                    border: '1px solid',
                    borderColor: isActive ? 'rgba(139, 92, 246, 0.35)' : 'var(--border-glass)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <strong style={{ fontSize: '0.88rem', color: isActive ? 'var(--accent-purple-soft)' : 'var(--text-primary)' }}>{aud.name}</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Auditor: {aud.assignedAuditor.split(' ')[0]}
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', padding: '0.1rem 0.35rem', borderRadius: '4px', background: aud.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100,116,139,0.15)', color: aud.status === 'Active' ? '#6ee7b7' : '#94a3b8', fontWeight: 700 }}>
                      {aud.status}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {Object.keys(aud.checklist).length} items checked
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected Audit Cycle Detail & Checklists */}
        {isSelected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header Details */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{activeAudit.name}</h3>
                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700, background: activeAudit.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100,116,139,0.15)', color: activeAudit.status === 'Active' ? '#6ee7b7' : '#94a3b8' }}>
                      {activeAudit.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Scope: Dept: <strong>{activeAudit.scopeDept || 'All'}</strong> | Room Location: <strong>{activeAudit.scopeLocation || 'All'}</strong>
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Assigned Auditor: <strong>{activeAudit.assignedAuditor}</strong> ({activeAudit.assignedAuditorEmail})
                  </p>
                </div>

                {activeAudit.status === 'Active' && canClose && (
                  <button
                    onClick={() => handleCloseAudit(activeAudit.id)}
                    className="btn btn-primary"
                    style={{ background: 'var(--accent-rose)', boxShadow: 'none' }}
                  >
                    Lock & Close Cycle
                  </button>
                )}
              </div>

              {/* Dynamic Discrepancy Warnings Box */}
              {activeAudit.discrepancyReport.items.length > 0 && (
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '12px',
                    padding: '0.85rem 1.1rem',
                    marginTop: '1.25rem',
                    fontSize: '0.85rem',
                    color: '#fbcfe8',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#fbbf24', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <AlertTriangle size={16} />
                    <span>Auto-Generated Discrepancy Report ({activeAudit.discrepancyReport.flaggedCount} Flagged)</span>
                  </div>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                    {activeAudit.discrepancyReport.items.map((disc, idx) => (
                      <li key={idx}>
                        <strong style={{ color: 'var(--text-primary)' }}>{disc.tag} ({disc.name})</strong>: {disc.issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Checklist Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Audit Verification Checklist</h4>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Tag</th>
                      <th>Asset Name</th>
                      <th>Current Holder</th>
                      <th>System Status</th>
                      <th>Verification Status</th>
                      {activeAudit.status === 'Active' && isAuditorOrManager && (
                        <th style={{ textAlign: 'right' }}>Auditor Verification Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {scopeAssets.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No assets found within this department/location scope.
                        </td>
                      </tr>
                    ) : (
                      scopeAssets.map((asset) => {
                        const verifiedStatus = activeAudit.checklist[asset.id];
                        return (
                          <tr key={asset.id}>
                            <td>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                                {asset.tag}
                              </span>
                            </td>
                            <td>
                              <strong style={{ fontSize: '0.9rem' }}>{asset.name}</strong>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Loc: {asset.location}</p>
                            </td>
                            <td>{asset.currentHolder || 'None (Available)'}</td>
                            <td>
                              <span className={`badge-status ${asset.status.toLowerCase().replace(' ', '_')}`}>
                                {asset.status}
                              </span>
                            </td>
                            <td>
                              {verifiedStatus ? (
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    background: verifiedStatus === 'Verified' ? 'rgba(16, 185, 129, 0.15)' : verifiedStatus === 'Damaged' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                                    color: verifiedStatus === 'Verified' ? '#6ee7b7' : verifiedStatus === 'Damaged' ? '#fbbf24' : '#fda4af',
                                    textTransform: 'uppercase'
                                  }}
                                >
                                  {verifiedStatus}
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending Check</span>
                              )}
                            </td>

                            {activeAudit.status === 'Active' && isAuditorOrManager && (
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => handleAuditAction(activeAudit.id, asset.id, 'Verified')}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.08)', color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.2)' }}
                                  >
                                    Verify
                                  </button>
                                  <button
                                    onClick={() => handleAuditAction(activeAudit.id, asset.id, 'Damaged')}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.08)', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.2)' }}
                                  >
                                    Damaged
                                  </button>
                                  <button
                                    onClick={() => handleAuditAction(activeAudit.id, asset.id, 'Missing')}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', background: 'rgba(244, 63, 94, 0.08)', color: '#fda4af', borderColor: 'rgba(244,63,94,0.2)' }}
                                  >
                                    Missing
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select an audit cycle on the left sidebar to view discrepancies and complete checklists.
          </div>
        )}
      </div>

      {/* Modal: Create Audit Cycle */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Audit Cycle"
      >
        <form onSubmit={handleCreateAuditSubmit}>
          <div className="form-group">
            <label className="form-label">Audit Cycle Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Q3 Electronics Check"
              value={auditName}
              onChange={(e) => setAuditName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Scope: Department</label>
              <select
                className="form-input"
                value={scopeDept}
                onChange={(e) => setScopeDept(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Scope: Office Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. HQ Office 101"
                value={scopeLocation}
                onChange={(e) => setScopeLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Auditor</label>
            <select
              className="form-input"
              required
              value={assignedAuditorEmail}
              onChange={(e) => setAssignedAuditorEmail(e.target.value)}
            >
              <option value="">Choose employee...</option>
              {employees.filter(e => e.status === 'Active').map(e => (
                <option key={e.email} value={e.email}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Initialize Audit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
