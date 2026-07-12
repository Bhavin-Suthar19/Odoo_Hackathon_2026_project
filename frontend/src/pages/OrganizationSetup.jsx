import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Plus, UserCheck, Shield, ToggleLeft, ToggleRight, FolderPlus, ArrowUpRight, Check, X } from 'lucide-react';
import Modal from '../components/Modal';

export default function OrganizationSetup() {
  const { user } = useAuth();
  const {
    departments,
    categories,
    employees,
    addDepartment,
    updateDepartment,
    toggleDepartmentStatus,
    addCategory,
    addEmployee,
    updateEmployeeRole,
    toggleEmployeeStatus,
  } = useData();

  const [activeTab, setActiveTab] = useState('departments');

  // Modals / Forms States
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', headEmail: '', parentId: '' });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', customFields: [] });
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [empForm, setEmpForm] = useState({ name: '', email: '', department: 'Engineering' });

  // Handle department submit
  const handleDeptSubmit = (e) => {
    e.preventDefault();
    if (!deptForm.name) return;

    // Find head name from email
    const headEmp = employees.find(emp => emp.email === deptForm.headEmail);
    const parentDept = departments.find(d => d.id === deptForm.parentId);

    addDepartment({
      name: deptForm.name,
      head: headEmp ? headEmp.name : deptForm.headEmail || 'Unassigned',
      headEmail: deptForm.headEmail || '',
      parent: parentDept ? parentDept.name : null,
    }, user);

    setDeptForm({ name: '', headEmail: '', parentId: '' });
    setShowDeptModal(false);
  };

  // Add custom field to current category draft
  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    setCatForm(prev => ({
      ...prev,
      customFields: [...prev.customFields, { name: newFieldName.trim(), type: newFieldType, required: false }]
    }));
    setNewFieldName('');
  };

  const handleRemoveField = (index) => {
    setCatForm(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  // Handle category submit
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!catForm.name) return;

    addCategory({
      name: catForm.name,
      fields: catForm.customFields,
    }, user);

    setCatForm({ name: '', customFields: [] });
    setShowCategoryModal(false);
  };

  // Handle employee submit
  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!empForm.name || !empForm.email) return;

    addEmployee({
      name: empForm.name,
      email: empForm.email,
      department: empForm.department,
      role: 'Employee', // Default role always Employee at signup/creation
    }, user);

    setEmpForm({ name: '', email: '', department: 'Engineering' });
    setShowEmployeeModal(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="page-title">Organization <span className="heading-gradient">Setup</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Maintain departments, categories, and promote system roles (Admin Only)</p>
        </div>

        {activeTab === 'departments' && (
          <button onClick={() => setShowDeptModal(true)} className="btn btn-primary">
            <Plus size={16} /> Add Department
          </button>
        )}
        {activeTab === 'categories' && (
          <button onClick={() => setShowCategoryModal(true)} className="btn btn-primary">
            <Plus size={16} /> Add Category
          </button>
        )}
        {activeTab === 'employees' && (
          <button onClick={() => setShowEmployeeModal(true)} className="btn btn-primary">
            <Plus size={16} /> Add Employee
          </button>
        )}
      </div>

      {/* Tabs Header */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          Departments
        </button>
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Asset Categories
        </button>
        <button
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Employee Directory
        </button>
      </div>

      {/* Tab Content: Departments */}
      {activeTab === 'departments' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Hierarchy (Parent)</th>
                  <th>Department Head</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{dept.name}</span>
                    </td>
                    <td>
                      <span style={{ color: dept.parent ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {dept.parent || 'Root Level'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{dept.head}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dept.headEmail}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${dept.status === 'Active' ? 'badge-online' : 'badge-warning'}`}>
                        {dept.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => toggleDepartmentStatus(dept.id, user)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                      >
                        {dept.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Categories */}
      {activeTab === 'categories' && (
        <div className="grid-3">
          {categories.map((cat) => (
            <div key={cat.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-purple-soft)' }}>{cat.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {cat.fields.length} Custom Fields
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  Custom Specs Attributes:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {cat.fields.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No custom fields configured</span>
                  ) : (
                    cat.fields.map((f, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--surface-inset)', padding: '0.4rem 0.65rem', borderRadius: '6px', fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 600 }}>{f.name}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>{f.type}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Employee Directory */}
      {activeTab === 'employees' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Email Address</th>
                  <th>Department</th>
                  <th>System Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Role Promotion</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} style={{ opacity: emp.status === 'Inactive' ? 0.6 : 1 }}>
                    <td>
                      <span style={{ fontWeight: 700 }}>{emp.name}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{emp.email}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.88rem' }}>{emp.department}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: emp.role === 'Admin' ? 'rgba(244, 63, 94, 0.15)' : emp.role === 'Asset Manager' ? 'rgba(6, 182, 212, 0.15)' : emp.role === 'Department Head' ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-subtle)',
                          color: emp.role === 'Admin' ? '#fda4af' : emp.role === 'Asset Manager' ? '#67e8f9' : emp.role === 'Department Head' ? '#6ee7b7' : 'var(--text-secondary)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                        }}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleEmployeeStatus(emp.email, user)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {emp.status === 'Active' ? (
                          <span className="badge badge-online" style={{ cursor: 'pointer' }}><Check size={12} /> Active</span>
                        ) : (
                          <span className="badge badge-warning" style={{ cursor: 'pointer' }}><X size={12} /> Inactive</span>
                        )}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <select
                        value={emp.role}
                        onChange={(e) => updateEmployeeRole(emp.email, e.target.value, user)}
                        disabled={emp.status === 'Inactive'}
                        style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-glass)',
                          color: 'var(--text-primary)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: emp.status === 'Inactive' ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <option value="Employee">Employee</option>
                        <option value="Department Head">Department Head</option>
                        <option value="Asset Manager">Asset Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Department */}
      <Modal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        title="Create New Department"
      >
        <form onSubmit={handleDeptSubmit}>
          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Product Design"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign Department Head</label>
            <select
              className="form-input"
              value={deptForm.headEmail}
              onChange={(e) => setDeptForm({ ...deptForm, headEmail: e.target.value })}
            >
              <option value="">Select Employee...</option>
              {employees.map(emp => (
                <option key={emp.email} value={emp.email}>{emp.name} ({emp.email})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Parent Department (For Hierarchy)</label>
            <select
              className="form-input"
              value={deptForm.parentId}
              onChange={(e) => setDeptForm({ ...deptForm, parentId: e.target.value })}
            >
              <option value="">None (Root Level)</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowDeptModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Department</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Category */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Create Asset Category"
      >
        <form onSubmit={handleCategorySubmit}>
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Lab Equipment"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
            />
          </div>

          <div style={{ border: '1px solid var(--border-glass)', padding: '1rem', borderRadius: '12px', marginTop: '1rem', background: 'var(--surface-inset)' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Configure Custom Fields</label>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Field Name (e.g. Serial Code)"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
              />
              <select
                className="form-input"
                style={{ width: '130px' }}
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
              </select>
              <button type="button" onClick={handleAddField} className="btn btn-secondary" style={{ padding: '0.75rem' }}>
                Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {catForm.customFields.map((field, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{field.name}</span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>({field.type})</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveField(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowCategoryModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Category</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Employee */}
      <Modal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        title="Add Employee to Directory"
      >
        <form onSubmit={handleEmployeeSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Monica Geller"
              value={empForm.name}
              onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="monica@company.com"
              value={empForm.email}
              onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Department</label>
            <select
              className="form-input"
              value={empForm.department}
              onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
            >
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--accent-purple-soft)', marginBottom: '1.25rem' }}>
            💡 <strong>ERP Role Constraint:</strong> Signup/Direct registration puts employees on the standard <em>Employee</em> role. Role elevations (to Department Head or Asset Manager) can be made in the main Employee Directory table by an Administrator.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowEmployeeModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Add Employee</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
