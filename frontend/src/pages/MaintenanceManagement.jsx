import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Wrench, Plus, CheckCircle, XCircle, UserPlus, Play, Check, AlertTriangle, X } from 'lucide-react';
import Modal from '../components/Modal';

export default function MaintenanceManagement() {
  const { user } = useAuth();
  const { assets, maintenances, raiseMaintenanceRequest, updateMaintenanceStatus } = useData();

  // States
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Technician assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTicketId, setAssignTicketId] = useState('');
  const [technicianName, setTechnicianName] = useState('');

  // Resolution notes state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveTicketId, setResolveTicketId] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleRaiseSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssetId || !issueDescription) return;

    raiseMaintenanceRequest(selectedAssetId, issueDescription, priority, user);
    setSelectedAssetId('');
    setIssueDescription('');
    setPriority('Medium');
    setShowRaiseModal(false);
    alert('Maintenance request submitted successfully!');
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignTicketId || !technicianName) return;

    updateMaintenanceStatus(
      assignTicketId,
      'Approved', // Moves from Pending -> Approved (with Technician Assigned)
      { technician: technicianName },
      user
    );

    setTechnicianName('');
    setAssignTicketId('');
    setShowAssignModal(false);
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!resolveTicketId || !resolutionNotes) return;

    updateMaintenanceStatus(
      resolveTicketId,
      'Resolved',
      { notes: resolutionNotes },
      user
    );

    setResolutionNotes('');
    setResolveTicketId('');
    setShowResolveModal(false);
    alert('Maintenance ticket resolved. Asset is now Available.');
  };

  // Roles verification
  const isManager = user.role === 'Asset Manager' || user.role === 'Admin';

  // Kanban column grouping
  const getTicketsByStatus = (statusName) => {
    return maintenances.filter(m => m.status === statusName);
  };

  const columns = [
    { id: 'Pending', label: 'Pending Review', color: '#fbbf24', count: getTicketsByStatus('Pending').length },
    { id: 'Approved', label: 'Technician Assigned', color: '#60a5fa', count: getTicketsByStatus('Approved').length },
    { id: 'In Progress', label: 'In Progress', color: '#a78bfa', count: getTicketsByStatus('In Progress').length },
    { id: 'Resolved', label: 'Resolved / Fixed', color: '#34d399', count: getTicketsByStatus('Resolved').length },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="page-title">Maintenance <span className="heading-gradient">Management</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Route device repairs through approvals, assign technicians, and track hardware logs</p>
        </div>
        <button onClick={() => setShowRaiseModal(true)} className="btn btn-primary">
          <Plus size={16} /> Raise Request
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="kanban-board">
        {columns.map((col) => {
          const tickets = getTicketsByStatus(col.id);
          return (
            <div key={col.id} className="kanban-column">
              {/* Column Header */}
              <div className="kanban-column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: col.color }} />
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{col.label}</span>
                </div>
                <span style={{ fontSize: '0.72rem', background: 'var(--surface-subtle)', color: 'var(--text-secondary)', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontWeight: 700 }}>
                  {col.count}
                </span>
              </div>

              {/* Card List */}
              <div className="kanban-card-list">
                {tickets.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', border: '1px dashed var(--border-glass)', borderRadius: '10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                    Empty Column
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="kanban-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.4rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {ticket.assetTag}
                        </span>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            background: ticket.priority === 'High' ? 'rgba(244,63,94,0.15)' : ticket.priority === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)',
                            color: ticket.priority === 'High' ? '#fda4af' : ticket.priority === 'Medium' ? '#fbbf24' : '#94a3b8',
                          }}
                        >
                          {ticket.priority}
                        </span>
                      </div>

                      <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>{ticket.assetName}</strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.3, marginBottom: '0.6rem' }}>
                        "{ticket.issue}"
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <div>Raised by: <strong>{ticket.raisedBy}</strong></div>
                        {ticket.technician && <div>Tech: <strong style={{ color: 'var(--text-secondary)' }}>{ticket.technician}</strong></div>}
                        {ticket.notes && <div style={{ fontStyle: 'italic' }}>Notes: {ticket.notes}</div>}
                      </div>

                      {/* Interactive Transitions (Asset Manager Actions) */}
                      {isManager && (
                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem' }}>
                          {col.id === 'Pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setAssignTicketId(ticket.id);
                                  setShowAssignModal(true);
                                }}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '0.25rem', fontSize: '0.7rem', display: 'flex', gap: '0.2rem', background: 'var(--accent-primary)', boxShadow: 'none' }}
                              >
                                <UserPlus size={11} /> Approve & Assign
                              </button>
                              <button
                                onClick={() => updateMaintenanceStatus(ticket.id, 'Rejected', {}, user)}
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderColor: 'rgba(244,63,94,0.3)', color: '#fda4af' }}
                                title="Reject Request"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {col.id === 'Approved' && (
                            <button
                              onClick={() => updateMaintenanceStatus(ticket.id, 'In Progress', {}, user)}
                              className="btn btn-primary"
                              style={{ flex: 1, padding: '0.25rem', fontSize: '0.7rem', display: 'flex', gap: '0.2rem', background: 'var(--accent-cyan)', boxShadow: 'none' }}
                            >
                              <Play size={11} /> Start Repair Work
                            </button>
                          )}

                          {col.id === 'In Progress' && (
                            <button
                              onClick={() => {
                                setResolveTicketId(ticket.id);
                                setShowResolveModal(true);
                              }}
                              className="btn btn-primary"
                              style={{ flex: 1, padding: '0.25rem', fontSize: '0.7rem', display: 'flex', gap: '0.2rem', background: 'var(--accent-emerald)', boxShadow: 'none' }}
                            >
                              <Check size={11} /> Resolve & Close
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Raise Request */}
      <Modal
        isOpen={showRaiseModal}
        onClose={() => setShowRaiseModal(false)}
        title="Raise Maintenance Request"
      >
        <form onSubmit={handleRaiseSubmit}>
          <div className="form-group">
            <label className="form-label">Select Faulty Device</label>
            <select
              className="form-input"
              required
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
            >
              <option value="">Choose asset...</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.tag} - {a.name} ({a.location})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Severity / Priority</label>
            <select
              className="form-input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low - Cosmetic / minor wear</option>
              <option value="Medium">Medium - Hardware malfunctioning but usable</option>
              <option value="High">High - Critical failure / completely broken</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Describe the Issue</label>
            <textarea
              className="form-input"
              style={{ minHeight: '90px' }}
              required
              placeholder="Explain what is broken, when it happened, or error codes..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowRaiseModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">File Ticket</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Approve & Assign Tech */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Approve Request & Assign Tech"
      >
        <form onSubmit={handleAssignSubmit}>
          <div className="form-group">
            <label className="form-label">Technician Name / Service Vendor</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Dave (Fleet Auto) / Apple Store Depot"
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Assign & Approve</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Resolve Notes */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Resolve Maintenance Ticket"
      >
        <form onSubmit={handleResolveSubmit}>
          <div className="form-group">
            <label className="form-label">Resolution Details</label>
            <textarea
              className="form-input"
              style={{ minHeight: '90px' }}
              required
              placeholder="Describe how the device was repaired, spare parts costs, or warranty usage..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowResolveModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Resolve & Release Asset</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
