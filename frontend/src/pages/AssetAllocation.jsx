import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserCheck, RefreshCw, CheckCircle, AlertTriangle, X, Clipboard, ArrowRight, Box } from 'lucide-react';

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

  const isManagement = user.role === 'Admin' || user.role === 'Asset Manager' || user.role === 'Department Head';

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [targetEmployeeEmail, setTargetEmployeeEmail] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnAssetId, setReturnAssetId] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('Good');

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const isConflict = selectedAsset && selectedAsset.status !== 'Available';

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !targetEmployeeEmail) return;

    const result = await allocateAsset(selectedAssetId, targetEmployeeEmail, expectedReturnDate, user);
    if (result && result.success) {
      setSelectedAssetId('');
      setTargetEmployeeEmail('');
      setExpectedReturnDate('');
      alert('Asset allocated successfully!');
    } else {
      alert(result?.message || 'Failed to allocate asset');
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !targetEmployeeEmail || !transferReason) return;

    const result = await requestTransfer(selectedAssetId, targetEmployeeEmail, transferReason, user);
    if (result && result.success) {
      setSelectedAssetId('');
      setTargetEmployeeEmail('');
      setTransferReason('');
      alert('Transfer request submitted successfully. Awaiting Manager/Department Head approval.');
    } else {
      alert(result?.message || 'Failed to submit transfer request');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnAssetId) return;

    const result = await returnAsset(returnAssetId, returnNotes, returnCondition, user);
    if (result && result.success) {
      setShowReturnModal(false);
      setReturnAssetId('');
      setReturnNotes('');
      alert('Asset return check-in completed successfully!');
    } else {
      alert(result?.message || 'Failed to process return');
    }
  };

  // Regular Employee sees ONLY assets assigned to their account
  const myAssignedAssets = assets.filter(
    a => a.status === 'Allocated' && (
      (a.currentHolderEmail && a.currentHolderEmail.toLowerCase() === (user.email || '').toLowerCase()) ||
      (a.currentHolder && a.currentHolder.toLowerCase() === (user.name || '').toLowerCase())
    )
  );

  // CHAIN OF CUSTODY HIERARCHY RULES:
  // - Asset Manager: Can ONLY allocate assets to Department Heads
  // - Department Head: Can ONLY allocate assets to employees within their respective department
  // - Admin: Can allocate to any active employee across the organization
  const eligibleRecipients = employees.filter(emp => {
    if (emp.status !== 'Active') return false;
    if (emp.email === (selectedAsset?.currentHolderEmail || '')) return false;

    if (user.role === 'Asset Manager') {
      return emp.role === 'Department Head';
    }
    if (user.role === 'Department Head') {
      return emp.department === user.department && emp.email !== user.email;
    }
    return true; // Admin can allocate to anyone
  });

  const recipientLabelText =
    user.role === 'Asset Manager'
      ? 'Target Recipient (Department Heads Only)'
      : user.role === 'Department Head'
      ? `Target Recipient (${user.department} Employees Only)`
      : 'Target Recipient';

  const selectableAssets =
    user.role === 'Department Head'
      ? assets.filter(a =>
          (a.currentHolderEmail && a.currentHolderEmail.toLowerCase() === (user.email || '').toLowerCase()) ||
          (a.currentHolder && a.currentHolder.toLowerCase() === (user.name || '').toLowerCase()) ||
          a.status === 'Available'
        )
      : isManagement
      ? assets
      : myAssignedAssets;

  // Management sees all organization/department allocated assets
  const allocatedAssets = isManagement ? assets.filter(a => a.status === 'Allocated') : myAssignedAssets;

  const activeTransfers = transfers.filter(t => t.status === 'Requested');
  const pastTransfers = transfers.filter(t => t.status !== 'Requested');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          {isManagement ? 'Allocation & Transfers' : 'My Assigned Equipment'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {user.role === 'Asset Manager'
            ? 'Allocate organizational assets to Department Heads for department custody'
            : user.role === 'Department Head'
            ? `Allocate held assets to employees in your ${user.department} department`
            : isManagement
            ? 'Assign assets to team members, manage returns, and approve device transfers'
            : 'View equipment checked out to your account, initiate returns, or request custody transfers'}
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: '2rem' }}>
        {/* Form Panel: Allocation for Management / Transfer Request for Employees */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 850, marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <UserCheck size={20} color="#a78bfa" />
            <span>{isManagement ? 'Allocate Device / Request Transfer' : 'Request Device Transfer'}</span>
          </h3>

          <form onSubmit={isConflict || !isManagement ? handleTransferSubmit : handleAllocateSubmit}>
            <div className="form-group">
              <label className="form-label">Select Device</label>
              <select
                className="form-input"
                required
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
              >
                <option value="">Select an asset...</option>
                {selectableAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.tag}) — Status: {asset.status} {asset.currentHolder ? `[Holder: ${asset.currentHolder}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{recipientLabelText}</label>
              <select
                className="form-input"
                required
                value={targetEmployeeEmail}
                onChange={(e) => setTargetEmployeeEmail(e.target.value)}
              >
                <option value="">Select target recipient...</option>
                {eligibleRecipients.map((emp) => (
                  <option key={emp.email} value={emp.email}>
                    {emp.name} ({emp.department} - {emp.role})
                  </option>
                ))}
              </select>
            </div>

            {(!isConflict && isManagement) ? (
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
              <div className="form-group">
                <label className="form-label">Reason for Device Transfer</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  required
                  placeholder="Justification for why this asset should be transferred..."
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                />
              </div>
            )}

            {(!isConflict && isManagement) ? (
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <UserCheck size={18} /> Allocate Asset
              </button>
            ) : (
              <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem', borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c4b5fd' }}>
                <RefreshCw size={18} /> Submit Transfer Request
              </button>
            )}
          </form>
        </div>

        {/* List Panel: Returns & Active Allocations */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 850, marginBottom: '1.25rem' }}>
            {isManagement ? 'Active Allocations & Returns' : 'My Assigned Devices'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
            {allocatedAssets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <Box size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {isManagement ? 'No active allocations found.' : 'No assets assigned to your account.'}
                </p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {isManagement ? 'Use the form on the left to allocate an asset.' : 'When equipment is allocated to your email, it will appear here.'}
                </p>
              </div>
            ) : (
              allocatedAssets.map((asset) => {
                const isOverdue = asset.expectedReturnDate && new Date(asset.expectedReturnDate) < new Date();
                return (
                  <div
                    key={asset.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid',
                      borderColor: isOverdue ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-glass)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.95rem' }}>{asset.name}</strong>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{asset.tag}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Holder: <strong style={{ color: '#fff' }}>{asset.currentHolder}</strong> ({asset.currentHolderEmail})
                      </p>
                      {asset.expectedReturnDate && (
                        <p style={{ fontSize: '0.75rem', color: isOverdue ? '#fca5a5' : 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Expected Return: {asset.expectedReturnDate} {isOverdue && '(OVERDUE)'}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setReturnAssetId(asset.id);
                        setShowReturnModal(true);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fca5a5' }}
                    >
                      Process Return
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Transfer Requests Section */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 850, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={20} color="#a78bfa" />
          <span>Device Custody Transfers Log</span>
        </h3>

        {transfers.length === 0 ? (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
            No asset transfer requests recorded yet.
          </span>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Current Holder</th>
                  <th>Requested Recipient</th>
                  <th>Justification</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  {isManagement && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {transfers.map((tf) => {
                  const isPending = tf.status === 'Requested';
                  return (
                    <tr key={tf.id}>
                      <td><strong style={{ color: 'var(--accent-cyan)' }}>{tf.assetId}</strong></td>
                      <td>{tf.fromUser}</td>
                      <td>{tf.toUser}</td>
                      <td style={{ maxWidth: '220px' }}>{tf.reason}</td>
                      <td>{tf.requestedBy}</td>
                      <td>
                        <span
                          className={`badge ${
                            tf.status === 'Approved'
                              ? 'badge-available'
                              : tf.status === 'Rejected'
                              ? 'badge-maintenance'
                              : 'badge-allocated'
                          }`}
                        >
                          {tf.status}
                        </span>
                      </td>
                      {isManagement && (
                        <td>
                          {isPending ? (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => approveTransfer(tf.id, user)}
                                className="btn btn-primary"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => rejectTransfer(tf.id, user)}
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: '#f43f5e', color: '#fca5a5' }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolved</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Assessment Modal */}
      {showReturnModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Check-In / Return Assessment</h3>
              <button onClick={() => setShowReturnModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit}>
              <div className="form-group">
                <label className="form-label">Asset Condition Upon Check-In</label>
                <select
                  className="form-input"
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                >
                  <option value="Excellent">Excellent - No wear</option>
                  <option value="Good">Good - Normal minor wear</option>
                  <option value="Needs Maintenance">Needs Maintenance / Repair</option>
                  <option value="Damaged">Damaged - Unusable</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Inspection Notes & Observations</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '90px' }}
                  placeholder="Record screen condition, included accessories (charger, bag), physical defects..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowReturnModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#10b981' }}>
                  Complete Return Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
