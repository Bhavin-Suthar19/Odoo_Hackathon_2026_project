import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Filter, Tag, Info, Calendar, DollarSign, PenTool, CheckCircle, X, ChevronRight } from 'lucide-react';
import Modal from '../components/Modal';

export default function AssetDirectory() {
  const { user } = useAuth();
  const { assets, categories, registerAsset, history, maintenances } = useData();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Form State
  const [assetForm, setAssetForm] = useState({
    name: '',
    category: '',
    serial: '',
    acquisitionDate: new Date().toISOString().substring(0, 10),
    acquisitionCost: '',
    condition: 'Excellent',
    location: '',
    shared: false,
    specs: {},
  });

  const handleCategoryChangeInForm = (catName) => {
    const cat = categories.find(c => c.name === catName);
    const initialSpecs = {};
    if (cat) {
      cat.fields.forEach(f => {
        initialSpecs[f.name] = '';
      });
    }
    setAssetForm({
      ...assetForm,
      category: catName,
      specs: initialSpecs,
    });
  };

  const handleSpecChange = (fieldName, val) => {
    setAssetForm({
      ...assetForm,
      specs: {
        ...assetForm.specs,
        [fieldName]: val,
      }
    });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!assetForm.name || !assetForm.category) return;

    registerAsset({
      name: assetForm.name,
      category: assetForm.category,
      serial: assetForm.serial || 'N/A',
      acquisitionDate: assetForm.acquisitionDate,
      acquisitionCost: parseFloat(assetForm.acquisitionCost) || 0,
      condition: assetForm.condition,
      location: assetForm.location || 'HQ Office',
      shared: assetForm.shared,
      specs: assetForm.specs,
    }, user);

    // Reset Form
    setAssetForm({
      name: '',
      category: '',
      serial: '',
      acquisitionDate: new Date().toISOString().substring(0, 10),
      acquisitionCost: '',
      condition: 'Excellent',
      location: '',
      shared: false,
      specs: {},
    });
    setShowRegisterModal(false);
  };

  // Filter Assets
  const filteredAssets = assets.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || a.status === selectedStatus;
    const matchesCondition = selectedCondition === 'All' || a.condition === selectedCondition;

    return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
  });

  const canRegister = user.role === 'Admin' || user.role === 'Asset Manager';

  // Find history & maintenance logs for selected detail asset
  const assetAllocHistory = selectedAsset ? history.filter(h => h.assetId === selectedAsset.id) : [];
  const assetMaintHistory = selectedAsset ? maintenances.filter(m => m.assetId === selectedAsset.id) : [];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="page-title">Asset <span className="heading-gradient">Directory</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Centralized registry for physical assets and hardware specs</p>
        </div>
        {canRegister && (
          <button onClick={() => {
            // Set initial category to first category in list
            if (categories.length > 0) {
              handleCategoryChangeInForm(categories[0].name);
            }
            setShowRegisterModal(true);
          }} className="btn btn-primary">
            <Plus size={16} /> Register Asset
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Text Search */}
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '14px', left: '14px' }} />
            <input
              type="text"
              placeholder="Search by tag, serial, name, or location..."
              className="form-input"
              style={{ paddingLeft: '2.7rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ flex: '1 1 180px' }}>
            <select
              className="form-input"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div style={{ flex: '1 1 180px' }}>
            <select
              className="form-input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Reserved">Reserved</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Lost">Lost</option>
              <option value="Retired">Retired</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>

          {/* Condition Dropdown */}
          <div style={{ flex: '1 1 160px' }}>
            <select
              className="form-input"
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
            >
              <option value="All">All Conditions</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Asset Table Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Serial Code</th>
                <th>Location</th>
                <th>Lifecycle Status</th>
                <th>Condition</th>
                <th style={{ textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No assets match the active filters or search criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const statusClass = asset.status.toLowerCase().replace(' ', '_');
                  return (
                    <tr key={asset.id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {asset.tag}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700 }}>{asset.name}</span>
                          {asset.shared && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--accent-purple-soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '0.15rem' }}>
                              🔄 Shared Bookable Resource
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{asset.category}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {asset.serial}
                        </span>
                      </td>
                      <td>{asset.location}</td>
                      <td>
                        <span className={`badge-status ${statusClass}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: asset.condition === 'Excellent' ? '#34d399' : asset.condition === 'Good' ? '#60a5fa' : asset.condition === 'Fair' ? '#fbbf24' : '#fca5a5'
                          }}
                        >
                          {asset.condition}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedAsset(asset)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                        >
                          <Info size={13} />
                          <span>View History</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Asset */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register New Physical Asset"
        maxHeight="90vh"
      >
        <form onSubmit={handleRegisterSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Asset Name / Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. MacBook Pro M3"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Asset Category</label>
                  <select
                    className="form-input"
                    required
                    value={assetForm.category}
                    onChange={(e) => handleCategoryChangeInForm(e.target.value)}
                  >
                    <option value="">Select Category...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Serial Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. S/N 89H23JK"
                    value={assetForm.serial}
                    onChange={(e) => setAssetForm({ ...assetForm, serial: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Physical Condition</label>
                  <select
                    className="form-input"
                    value={assetForm.condition}
                    onChange={(e) => setAssetForm({ ...assetForm, condition: e.target.value })}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Acquisition Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={assetForm.acquisitionDate}
                    onChange={(e) => setAssetForm({ ...assetForm, acquisitionDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Acquisition Cost (USD)</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={14} color="var(--text-muted)" style={{ position: 'absolute', top: '15px', left: '12px' }} />
                    <input
                      type="number"
                      className="form-input"
                      style={{ paddingLeft: '2.2rem' }}
                      placeholder="e.g. 1500"
                      value={assetForm.acquisitionCost}
                      onChange={(e) => setAssetForm({ ...assetForm, acquisitionCost: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Storage Location / Room</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Server Room B, 3rd Floor"
                  value={assetForm.location}
                  onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                />
              </div>

              {/* Dynamic specs fields based on category schema */}
              {assetForm.category && (
                <div style={{ border: '1px solid var(--border-glass)', padding: '1rem', borderRadius: '12px', background: 'var(--surface-inset)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--accent-purple-soft)', display: 'block', marginBottom: '0.75rem' }}>
                    Category Specifications ({assetForm.category})
                  </span>
                  {categories.find(c => c.name === assetForm.category)?.fields.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No dynamic spec attributes required</span>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {categories.find(c => c.name === assetForm.category)?.fields.map((f, idx) => (
                        <div key={idx} className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>{f.name}</label>
                          <input
                            type={f.type}
                            className="form-input"
                            style={{ padding: '0.6rem 0.85rem' }}
                            placeholder={`Enter ${f.name.toLowerCase()}...`}
                            value={assetForm.specs[f.name] || ''}
                            onChange={(e) => handleSpecChange(f.name, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="shared"
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={assetForm.shared}
                  onChange={(e) => setAssetForm({ ...assetForm, shared: e.target.checked })}
                />
                <label htmlFor="shared" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Enable as "Shared Bookable Resource" (for calendar scheduling)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowRegisterModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Registry</button>
              </div>
            </form>
      </Modal>

      {/* Modal: View History Drawer */}
      <Modal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        title={
          selectedAsset ? (
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>
                {selectedAsset.tag}
              </span>
              <h3 style={{ fontWeight: 800, fontSize: '1.3rem' }}>{selectedAsset.name}</h3>
            </div>
          ) : ''
        }
        maxHeight="85vh"
      >
        {selectedAsset && (
          <div>
              {/* Asset Technical Details summary card */}
              <div className="glass-panel" style={{ padding: '1rem', background: 'var(--surface-inset)', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--accent-purple-soft)', marginBottom: '0.65rem' }}>
                  Technical Specs Sheet
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Lifecycle Status: </span>
                    <strong style={{ textTransform: 'uppercase' }}>{selectedAsset.status}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Condition Rating: </span>
                    <strong>{selectedAsset.condition}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Physical Location: </span>
                    <strong>{selectedAsset.location}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Capital Valuation: </span>
                    <strong>${selectedAsset.acquisitionCost}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Serial Number: </span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedAsset.serial}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Acquired On: </span>
                    <strong>{selectedAsset.acquisitionDate}</strong>
                  </div>
                </div>

                {/* Custom properties */}
                {Object.keys(selectedAsset.specs || {}).length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem', fontSize: '0.82rem' }}>
                      {Object.entries(selectedAsset.specs).map(([k, v]) => (
                        <div key={k}>
                          <span style={{ color: 'var(--text-secondary)' }}>{k}: </span>
                          <strong>{v || 'Not filled'}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Grid: Split Allocation and Maintenance history */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {/* Allocations Timeline */}
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    📋 Allocation History Timeline
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {assetAllocHistory.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No allocation logs found. This asset has not been assigned.
                      </span>
                    ) : (
                      assetAllocHistory.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.75rem', background: 'var(--surface-hover)', padding: '0.6rem 0.85rem', borderRadius: '8px', borderLeft: '3px solid #8b5cf6' }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.details}</p>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.type} • {item.date}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Maintenance Timeline */}
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    🔧 Maintenance History logs
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {assetMaintHistory.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No maintenance tickets raised for this asset.
                      </span>
                    ) : (
                      assetMaintHistory.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.75rem', background: 'var(--surface-hover)', padding: '0.6rem 0.85rem', borderRadius: '8px', borderLeft: '3px solid #f43f5e' }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.issue}</p>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Priority: <strong>{item.priority}</strong> | Status: <strong>{item.status}</strong>
                              {item.technician && ` | Tech: ${item.technician}`}
                            </span>
                            {item.notes && (
                              <p style={{ fontSize: '0.75rem', fontStyle: 'italic', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                                Note: {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
          </div>
        </div>
      )}
      </Modal>
    </div>
  );
}
