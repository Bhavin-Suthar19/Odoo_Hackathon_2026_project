import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserCheck, RefreshCw, CheckCircle, AlertTriangle, X, Clipboard, ArrowRight } from 'lucide-react';

export default function AssetAllocation() {
  const { user } = useAuth();
  const {
    assets,
    employees,
    transfers,
    allocateAsset,
    returnAsset,
    requestTransfer,
    approveTransfer,
    rejectTransfer
  } = useData();

  // Active form states
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [targetEmployeeEmail, setTargetEmployeeEmail] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  // Transfer Request state
  const [transferReason, setTransferReason] = useState('');

  // Return state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnAssetId, setReturnAssetId] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('Good');

  // Find selected asset to evaluate conflict rules
  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const isConflict = selectedAsset && selectedAsset.status !== 'Available';

  const handleAllocateSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssetId || !targetEmployeeEmail) return;

    const result = allocateAsset(selectedAssetId, targetEmployeeEmail, expectedReturnDate, user);
    if (result.success) {
      // Clear forms
      setSelectedAssetId('');
      setTargetEmployeeEmail('');
      setExpectedReturnDate('');
    } else {
      alert(result.message);
    }
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssetId || !targetEmployeeEmail || !transferReason) return;

    const result = requestTransfer(selectedAssetId, targetEmployeeEmail, transferReason, user);
    if (result.success) {
      setSelectedAssetId('');
      setTargetEmployeeEmail('');
      setTransferReason('');
      alert('Transfer request submitted successfully. Awaiting Manager/Department Head approval.');
    }
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnAssetId) return;

    returnAsset(returnAssetId, returnNotes, returnCondition, user);
    setShowReturnModal(false);
    setReturnAssetId('');
    setReturnNotes('');
  };

  // Check if current user is manager or dept head
  const isApprover = user.role === 'Asset Manager' || user.role === 'Department Head' || user.role === 'Admin';

  // Get active allocations to display in returns section
  const allocatedAssets = assets.filter(a => a.status === 'Allocated');

  // Filter transfer requests relevant to user
  const activeTransfers = transfers.filter(t => t.status === 'Requested');
  const pastTransfers = transfers.filter(t => t.status !== 'Requested');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Allocation & <span className="heading-gradient">Transfers</span></h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Assign assets to team members, manage returns, and approve device transfers</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: '2rem' }}>
        {/* Form Panel: Allocation or Transfer */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 850, marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <UserCheck size={20} color="#a78bfa" />
            <span>Allocate Device / Request Transfer</span>
          </h3>

          <form onSubmit={isConflict ? handleTransferSubmit : handleAllocateSubmit}>
            {/* Step 1: Select Asset */}
            <div className="form-group">
              <label className="form-label">Select Asset / Device</label>
              <select
                className="form-input"
                required
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
              >
                <option value="">Select an asset...</option>
                {assets.map((ast) => (
                  <option key={ast.id} value={ast.id}>
                    {ast.tag} - {ast.name} ({ast.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Conflict Alert Check */}
            {isConflict && (
              <div
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  borderRadius: '12px',
                  padding: '0.85rem 1.1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  color: '#fda4af',
                  display: 'flex',
                  gap: '0.6rem',
                  alignItems: 'start',
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <strong>Double-Allocation Blocked!</strong>
                  <p style={{ marginTop: '0.2rem', color: 'var(--text-secondary)' }}>
                    This asset is currently allocated to <strong>{selectedAsset.currentHolder}</strong> ({selectedAsset.currentHolderEmail}).
                    You cannot allocate it directly. Please fill out a Transfer Request instead.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Select Target Recipient */}
            <div className="form-group">
              <label className="form-label">Assign To (Employee Email)</label>
              <select
                className="form-input"
                required
                value={targetEmployeeEmail}
                onChange={(e) => setTargetEmployeeEmail(e.target.value)}
              >
                <option value="">Select target recipient...</option>
                {employees
                  .filter(e => e.status === 'Active' && e.email !== (selectedAsset?.currentHolderEmail || ''))
                  .map((emp) => (
                    <option key={emp.email} value={emp.email}>
                      {emp.name} ({emp.department} - {emp.role})
                    </option>
                  ))}
              </select>
            </div>

            {/* Dynamic input fields based on conflict */}
            {!isConflict ? (
              // direct allocation expected return date
              <div className="form-group">
                <label className="form-label">Expected Return Date (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                />
              </div>
            ) : (
              // transfer request justification reason
              <div className="form-group">
                <label className="form-label">Reason for Device Transfer</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  required
                  placeholder="Justification for why this specific asset needs to be transferred..."
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                />
              </div>
            )}

            {/* Actions button */}
            {!isConflict ? (
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <UserCheck size={18} /> Allocate Asset
              </button>
            ) : (
              <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem', borderColor: 'rgba(139, 92, 246, 0.4)', color: 'var(--accent-purple-soft)' }}>
                <RefreshCw size={18} /> Submit Transfer Request
              </button>
            )}
          </form>
        </div>

        {/* List Panel: Returns & Current Allocations */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 850, marginBottom: '1.25rem' }}>Active Allocations & Returns</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
            {allocatedAssets.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>
                No active allocations found in the organization.
              </span>
            ) : (
              allocatedAssets.map((asset) => {
                // Check if overdue
                const isOverdue = asset.expectedReturnDate && new Date(asset.expectedReturnDate) < new Date('2026-07-12');
                return (
                  <div
                    key={asset.id}
                    style={{
                      background: 'var(--surface-hover)',
                      border: '1px solid var(--border-glass)',
                      borderColor: isOverdue ? 'rgba(244, 63, 94, 0.25)' : 'var(--border-glass)',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{asset.name}</strong>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                          {asset.tag}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        Held by: <strong>{asset.currentHolder}</strong>
                      </p>
                      {asset.expectedReturnDate && (
                        <p style={{ fontSize: '0.72rem', color: isOverdue ? '#fca5a5' : 'var(--text-muted)', marginTop: '0.15rem', fontWeight: isOverdue ? 700 : 500 }}>
                          Expected Back: {asset.expectedReturnDate} {isOverdue && '(OVERDUE)'}
                        </p>
                      )}
                    </div>
                    {user.role === 'Asset Manager' || user.role === 'Admin' ? (
                      <button
                        onClick={() => {
                          setReturnAssetId(asset.id);
                          setReturnCondition(asset.condition);
                          setShowReturnModal(true);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Check-in Return
                      </button>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Transfer Requests Queue Panel */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 850, marginBottom: '1rem' }}>Pending Transfer Approvals Queue</h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Asset / Tag</th>
                <th>Current Holder</th>
                <th>Recipient Requestor</th>
                <th>Reason</th>
                <th>Request Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTransfers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No pending device transfer requests found in the system.
                  </td>
                </tr>
              ) : (
                activeTransfers.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700 }}>{item.assetName}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                          {item.assetTag}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{item.fromUser}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.fromEmail}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{item.toUser}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.toEmail}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>"{item.reason}"</span>
                    </td>
                    <td>{item.requestDate}</td>
                    <td style={{ textAlign: 'right' }}>
                      {isApprover ? (
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => approveTransfer(item.id, user)}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'var(--accent-emerald)', boxShadow: 'none' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectTransfer(item.id, user)}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'var(--accent-rose)', boxShadow: 'none' }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending Manager</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Process Return (Check-in Condition Notes) */}
      {showReturnModal && (
        <div className="modal-backdrop" onClick={() => setShowReturnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800 }}>Process Asset Return Check-in</h3>
              <button onClick={() => setShowReturnModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleReturnSubmit} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Return Condition Check</label>
                <select
                  className="form-input"
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                >
                  <option value="Excellent">Excellent - Unused / Perfect</option>
                  <option value="Good">Good - Minor scratches only</option>
                  <option value="Fair">Fair - Normal wear & tear</option>
                  <option value="Poor">Poor - Needs refurbishment / cleaning</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Condition Check-in Notes</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '90px' }}
                  required
                  placeholder="Record keyboard defects, charger check-in, visual inspection detail..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowReturnModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Accept Device & Check-in</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
