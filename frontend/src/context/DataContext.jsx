import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

// Initial mock data definitions
const INITIAL_DEPARTMENTS = [
  { id: 'dept-1', name: 'Engineering', head: 'Priya Shah', headEmail: 'priya@company.com', parent: null, status: 'Active' },
  { id: 'dept-2', name: 'Operations', head: 'Raj Patel', headEmail: 'raj@company.com', parent: null, status: 'Active' },
  { id: 'dept-3', name: 'HR', head: 'Sarah Jenkins', headEmail: 'sarah@company.com', parent: null, status: 'Active' },
  { id: 'dept-4', name: 'Sales', head: 'Dave Chen', headEmail: 'dave@company.com', parent: 'dept-2', status: 'Active' },
  { id: 'dept-5', name: 'Finance', head: 'Sophia Lopez', headEmail: 'sophia@company.com', parent: null, status: 'Active' },
];

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Electronics', fields: [{ name: 'Warranty Period (months)', type: 'number', required: true }, { name: 'Operating System', type: 'text', required: false }] },
  { id: 'cat-2', name: 'Furniture', fields: [{ name: 'Material Type', type: 'text', required: true }, { name: 'Weight Capacity (kg)', type: 'number', required: false }] },
  { id: 'cat-3', name: 'Vehicles', fields: [{ name: 'Plate Number', type: 'text', required: true }, { name: 'Fuel Type', type: 'text', required: true }] },
];

const INITIAL_EMPLOYEES = [
  { id: 'emp-1', name: 'Admin User', email: 'admin@company.com', role: 'Admin', department: 'Operations', status: 'Active' },
  { id: 'emp-2', name: 'Alex Mercer', email: 'manager@company.com', role: 'Asset Manager', department: 'Operations', status: 'Active' },
  { id: 'emp-3', name: 'Priya Shah', email: 'priya@company.com', role: 'Department Head', department: 'Engineering', status: 'Active' },
  { id: 'emp-4', name: 'Sarah Jenkins', email: 'sarah@company.com', role: 'Department Head', department: 'HR', status: 'Active' },
  { id: 'emp-5', name: 'Raj Patel', email: 'raj@company.com', role: 'Employee', department: 'Engineering', status: 'Active' },
  { id: 'emp-6', name: 'Dave Chen', email: 'dave@company.com', role: 'Employee', department: 'Sales', status: 'Active' },
  { id: 'emp-7', name: 'Sophia Lopez', email: 'sophia@company.com', role: 'Department Head', department: 'Finance', status: 'Active' },
  { id: 'emp-8', name: 'John Doe', email: 'john@company.com', role: 'Employee', department: 'HR', status: 'Inactive' },
];

const INITIAL_ASSETS = [
  {
    id: 'ast-1',
    tag: 'AF-0001',
    name: 'Dell Latitude 7420',
    category: 'Electronics',
    serial: 'DELL-7420-XYZ',
    acquisitionDate: '2025-01-15',
    acquisitionCost: 1200,
    condition: 'Excellent',
    location: 'HQ Office 101',
    status: 'Allocated',
    shared: false,
    specs: { 'Warranty Period (months)': 36, 'Operating System': 'Windows 11' },
    currentHolder: 'Priya Shah',
    currentHolderEmail: 'priya@company.com',
    expectedReturnDate: '2026-01-20', // Overdue Return
  },
  {
    id: 'ast-2',
    tag: 'AF-0002',
    name: 'Macbook Pro M2',
    category: 'Electronics',
    serial: 'APPLE-MBP-M2',
    acquisitionDate: '2025-02-10',
    acquisitionCost: 2400,
    condition: 'Excellent',
    location: 'HQ Office 102',
    status: 'Available',
    shared: false,
    specs: { 'Warranty Period (months)': 24, 'Operating System': 'macOS' },
  },
  {
    id: 'ast-3',
    tag: 'AF-0003',
    name: 'Ergonomic Mesh Chair',
    category: 'Furniture',
    serial: 'HM-AERON-01',
    acquisitionDate: '2024-06-01',
    acquisitionCost: 950,
    condition: 'Good',
    location: 'HQ Office 101',
    status: 'Allocated',
    shared: false,
    specs: { 'Material Type': 'Mesh', 'Weight Capacity (kg)': 120 },
    currentHolder: 'Raj Patel',
    currentHolderEmail: 'raj@company.com',
    expectedReturnDate: '2026-06-05', // Overdue Return
  },
  {
    id: 'ast-4',
    tag: 'AF-0004',
    name: 'Conference Room Projector',
    category: 'Electronics',
    serial: 'EPSON-PROJ-X',
    acquisitionDate: '2024-09-20',
    acquisitionCost: 600,
    condition: 'Good',
    location: 'Conf Room B2',
    status: 'Available',
    shared: true,
    specs: { 'Warranty Period (months)': 12 },
  },
  {
    id: 'ast-5',
    tag: 'AF-0005',
    name: 'Ford Transit Shuttle',
    category: 'Vehicles',
    serial: 'FORD-TRANS-09',
    acquisitionDate: '2023-11-05',
    acquisitionCost: 35000,
    condition: 'Fair',
    location: 'Garage A',
    status: 'Under Maintenance',
    shared: true,
    specs: { 'Plate Number': 'TX-456-ABC', 'Fuel Type': 'Diesel' },
  },
  {
    id: 'ast-6',
    tag: 'AF-0006',
    name: 'iPad Air',
    category: 'Electronics',
    serial: 'APPLE-IPAD-XYZ',
    acquisitionDate: '2025-03-01',
    acquisitionCost: 700,
    condition: 'Excellent',
    location: 'HQ Office 101',
    status: 'Reserved',
    shared: false,
    specs: { 'Warranty Period (months)': 12, 'Operating System': 'iOS' },
    currentHolder: 'Sarah Jenkins',
    currentHolderEmail: 'sarah@company.com',
    expectedReturnDate: '2026-08-15',
  },
  {
    id: 'ast-7',
    tag: 'AF-0007',
    name: 'Conference Room Table',
    category: 'Furniture',
    serial: 'FURN-TAB-99',
    acquisitionDate: '2024-01-10',
    acquisitionCost: 1500,
    condition: 'Good',
    location: 'Conf Room B2',
    status: 'Available',
    shared: true,
    specs: { 'Material Type': 'Oak Wood' },
  },
  {
    id: 'ast-8',
    tag: 'AF-0008',
    name: 'Tesla Model 3',
    category: 'Vehicles',
    serial: 'TESLA-M3-XYZ',
    acquisitionDate: '2024-05-15',
    acquisitionCost: 42000,
    condition: 'Excellent',
    location: 'Garage A',
    status: 'Available',
    shared: true,
    specs: { 'Plate Number': 'CA-789-ELE', 'Fuel Type': 'Electric' },
  },
];

const INITIAL_TRANSFERS = [
  {
    id: 'trsf-1',
    assetId: 'ast-1',
    assetTag: 'AF-0001',
    assetName: 'Dell Latitude 7420',
    fromUser: 'Priya Shah',
    fromEmail: 'priya@company.com',
    toUser: 'Raj Patel',
    toEmail: 'raj@company.com',
    reason: 'Required for testing high-load client builds in Office 101.',
    status: 'Requested',
    requestDate: '2026-07-11',
  }
];

const INITIAL_BOOKINGS = [
  {
    id: 'bkg-1',
    resourceId: 'ast-4', // Projector
    resourceName: 'Conference Room Projector (AF-0004)',
    user: 'Priya Shah',
    userEmail: 'priya@company.com',
    date: '2026-07-12',
    startTime: '09:00',
    endTime: '10:00',
    status: 'Ongoing',
    purpose: 'Sprint Planning Meeting',
  },
  {
    id: 'bkg-2',
    resourceId: 'ast-8', // Tesla
    resourceName: 'Tesla Model 3 (AF-0008)',
    user: 'Sarah Jenkins',
    userEmail: 'sarah@company.com',
    date: '2026-07-13',
    startTime: '14:00',
    endTime: '17:00',
    status: 'Upcoming',
    purpose: 'Client site HR visit',
  }
];

const INITIAL_MAINTENANCE = [
  {
    id: 'maint-1',
    assetId: 'ast-5',
    assetTag: 'AF-0005',
    assetName: 'Ford Transit Shuttle',
    issue: 'Engine making strange knocking sound on start, check oil levels.',
    priority: 'High',
    status: 'In Progress',
    raisedBy: 'Raj Patel',
    raisedByEmail: 'raj@company.com',
    requestDate: '2026-07-10',
    technician: 'Dave (Fleet Auto)',
    notes: 'Oil filter replaced. Checking spark plugs next.',
  },
  {
    id: 'maint-2',
    assetId: 'ast-4',
    assetTag: 'AF-0004',
    assetName: 'Conference Room Projector',
    issue: 'Bulb flickering, needs replacement.',
    priority: 'Medium',
    status: 'Pending',
    raisedBy: 'Priya Shah',
    raisedByEmail: 'priya@company.com',
    requestDate: '2026-07-12',
  }
];

const INITIAL_AUDITS = [
  {
    id: 'aud-1',
    name: 'Q3 IT Equipment Audit',
    scopeDept: 'Engineering',
    scopeLocation: 'HQ Office 101',
    assignedAuditor: 'Sarah Jenkins',
    assignedAuditorEmail: 'sarah@company.com',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    status: 'Active',
    // checklist records status of checked assets
    checklist: {
      'ast-1': 'Verified',
      'ast-3': 'Verified',
      'ast-6': 'Damaged',
    },
    discrepancyReport: {
      flaggedCount: 1,
      items: [
        { assetId: 'ast-6', tag: 'AF-0006', name: 'iPad Air', issue: 'Marked Damaged by Auditor Sarah Jenkins' }
      ]
    }
  }
];

const INITIAL_HISTORY = [
  { assetId: 'ast-1', type: 'Allocation', details: 'Allocated to Priya Shah (Engineering)', date: '2025-01-20' },
  { assetId: 'ast-3', type: 'Allocation', details: 'Allocated to Raj Patel (Engineering)', date: '2024-06-05' },
  { assetId: 'ast-5', type: 'Maintenance', details: 'Maintenance started: Engine knocking sound', date: '2026-07-10' },
  { assetId: 'ast-6', type: 'Allocation', details: 'Allocated to Sarah Jenkins (HR)', date: '2025-03-01' },
];

const INITIAL_NOTIFICATIONS = [
  { id: 'notif-1', title: 'Overdue Return Alert', message: 'Dell Latitude 7420 (AF-0001) allocated to Priya Shah is overdue since 2026-01-20.', type: 'Alert', date: '2026-07-12 08:00 AM', read: false },
  { id: 'notif-2', title: 'Overdue Return Alert', message: 'Ergonomic Mesh Chair (AF-0003) allocated to Raj Patel is overdue since 2026-06-05.', type: 'Alert', date: '2026-07-12 08:05 AM', read: false },
  { id: 'notif-3', title: 'New Transfer Request', message: 'Raj Patel requested a transfer for Dell Latitude 7420 (AF-0001).', type: 'Approvals', date: '2026-07-11 04:30 PM', read: false },
  { id: 'notif-4', title: 'Maintenance Pending Approval', message: 'Priya Shah raised a maintenance request for Conference Room Projector (AF-0004).', type: 'Approvals', date: '2026-07-12 09:00 AM', read: false }
];

const INITIAL_LOGS = [
  { id: 'log-1', action: 'Asset Registered', details: 'Alex Mercer registered asset Tesla Model 3 (AF-0008)', user: 'Alex Mercer', email: 'manager@company.com', date: '2026-07-12 08:30:00' },
  { id: 'log-2', action: 'Booking Confirmed', details: 'Sarah Jenkins booked Tesla Model 3 for 2026-07-13 14:00-17:00', user: 'Sarah Jenkins', email: 'sarah@company.com', date: '2026-07-12 08:45:00' },
  { id: 'log-3', action: 'Maintenance Request', details: 'Priya Shah requested maintenance for Conference Room Projector (AF-0004)', user: 'Priya Shah', email: 'priya@company.com', date: '2026-07-12 09:00:00' }
];

export const DataProvider = ({ children }) => {
  // Load or set states
  const [departments, setDepartments] = useState(() => {
    const saved = localStorage.getItem('af_departments');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('af_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('af_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('af_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [transfers, setTransfers] = useState(() => {
    const saved = localStorage.getItem('af_transfers');
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('af_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [maintenances, setMaintenances] = useState(() => {
    const saved = localStorage.getItem('af_maintenances');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [audits, setAudits] = useState(() => {
    const saved = localStorage.getItem('af_audits');
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('af_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('af_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('af_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('af_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('af_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('af_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('af_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('af_transfers', JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem('af_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('af_maintenances', JSON.stringify(maintenances));
  }, [maintenances]);

  useEffect(() => {
    localStorage.setItem('af_audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('af_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('af_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('af_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Helper log functions
  const addLog = (action, details, userObj) => {
    const newLog = {
      id: `log-${Date.now()}`,
      action,
      details,
      user: userObj?.name || 'System',
      email: userObj?.email || 'system@company.com',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (title, message, type = 'Alert') => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + (new Date().toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : 'Yesterday'),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Transaction Actions

  // 1. Department Management
  const addDepartment = (dept, actor) => {
    const newDept = {
      id: `dept-${Date.now()}`,
      ...dept,
      status: 'Active',
    };
    setDepartments((prev) => [...prev, newDept]);
    addLog('Department Created', `Created department ${dept.name}`, actor);
  };

  const updateDepartment = (id, updatedDept, actor) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updatedDept } : d))
    );
    addLog('Department Updated', `Updated department details for ${updatedDept.name}`, actor);
  };

  const toggleDepartmentStatus = (id, actor) => {
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const newStatus = d.status === 'Active' ? 'Inactive' : 'Active';
          addLog('Department Status Toggled', `Changed ${d.name} status to ${newStatus}`, actor);
          return { ...d, status: newStatus };
        }
        return d;
      })
    );
  };

  // 2. Asset Category Management
  const addCategory = (category, actor) => {
    const newCat = {
      id: `cat-${Date.now()}`,
      ...category,
    };
    setCategories((prev) => [...prev, newCat]);
    addLog('Category Created', `Created asset category ${category.name}`, actor);
  };

  const updateCategory = (id, updatedCat, actor) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedCat } : c))
    );
    addLog('Category Updated', `Updated asset category ${updatedCat.name}`, actor);
  };

  // 3. Employee Directory Promotions
  const addEmployee = (emp, actor) => {
    const newEmp = {
      id: `emp-${Date.now()}`,
      ...emp,
      status: 'Active',
    };
    setEmployees((prev) => [...prev, newEmp]);
    addLog('Employee Directory Add', `Registered new employee ${emp.name}`, actor);
  };

  const updateEmployeeRole = (email, newRole, actor) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.email === email) {
          addLog('Employee Promoted', `Promoted ${e.name} to ${newRole}`, actor);
          addNotification('Role Assignment Updated', `${e.name} role changed to ${newRole}`, 'Alert');
          return { ...e, role: newRole };
        }
        return e;
      })
    );
  };

  const toggleEmployeeStatus = (email, actor) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.email === email) {
          const nextStatus = e.status === 'Active' ? 'Inactive' : 'Active';
          addLog('Employee Status Changed', `Set ${e.name} to ${nextStatus}`, actor);
          return { ...e, status: nextStatus };
        }
        return e;
      })
    );
  };

  // 4. Asset Registration & Directory
  const registerAsset = (asset, actor) => {
    // Generate next tag automatically
    const maxNum = assets.reduce((max, a) => {
      const tagNum = parseInt(a.tag.replace('AF-', ''));
      return tagNum > max ? tagNum : max;
    }, 0);
    const newTag = `AF-${String(maxNum + 1).padStart(4, '0')}`;

    const newAsset = {
      id: `ast-${Date.now()}`,
      tag: newTag,
      status: 'Available',
      ...asset,
    };

    setAssets((prev) => [...prev, newAsset]);
    addLog('Asset Registered', `Registered new asset ${newAsset.name} (${newTag})`, actor);
    return newAsset;
  };

  const updateAsset = (id, updatedFields, actor) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
    addLog('Asset Updated', `Modified fields on asset ID ${id}`, actor);
  };

  // 5. Allocation & Returns & Transfers
  const allocateAsset = (assetId, employeeEmail, expectedReturnDate, actor) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found' };

    // Prevent double allocation
    if (asset.status !== 'Available' && asset.status !== 'Reserved') {
      return {
        success: false,
        message: `Asset already taken`,
        heldBy: asset.currentHolder || 'Someone else',
        heldByEmail: asset.currentHolderEmail,
      };
    }

    const employee = employees.find((e) => e.email === employeeEmail);
    const holderName = employee ? employee.name : employeeEmail;

    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              status: 'Allocated',
              currentHolder: holderName,
              currentHolderEmail: employeeEmail,
              expectedReturnDate: expectedReturnDate || null,
            }
          : a
      )
    );

    // Save allocation history
    const historyItem = {
      assetId,
      type: 'Allocation',
      details: `Allocated to ${holderName} (${employee?.department || 'N/A'})`,
      date: new Date().toISOString().substring(0, 10),
    };
    setHistory((prev) => [historyItem, ...prev]);

    addLog('Asset Allocated', `Allocated ${asset.name} (${asset.tag}) to ${holderName}`, actor);
    addNotification('Asset Allocated', `${asset.name} has been assigned to you.`, 'Alert');

    return { success: true };
  };

  const returnAsset = (assetId, checkInNotes, condition, actor) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found' };

    const previousHolder = asset.currentHolder;

    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              status: 'Available',
              currentHolder: null,
              currentHolderEmail: null,
              expectedReturnDate: null,
              condition: condition || a.condition,
            }
          : a
      )
    );

    const historyItem = {
      assetId,
      type: 'Return',
      details: `Returned by ${previousHolder}. Notes: ${checkInNotes || 'None'}. Condition: ${condition || asset.condition}`,
      date: new Date().toISOString().substring(0, 10),
    };
    setHistory((prev) => [historyItem, ...prev]);

    addLog('Asset Returned', `Asset ${asset.tag} returned by ${previousHolder}`, actor);
    addNotification('Asset Returned', `Asset return processed for ${asset.tag}.`, 'Alert');

    return { success: true };
  };

  const requestTransfer = (assetId, toEmployeeEmail, reason, actor) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found' };

    const targetEmp = employees.find((e) => e.email === toEmployeeEmail);
    const toName = targetEmp ? targetEmp.name : toEmployeeEmail;

    const newTransfer = {
      id: `trsf-${Date.now()}`,
      assetId,
      assetTag: asset.tag,
      assetName: asset.name,
      fromUser: asset.currentHolder || 'System',
      fromEmail: asset.currentHolderEmail || '',
      toUser: toName,
      toEmail: toEmployeeEmail,
      reason,
      status: 'Requested',
      requestDate: new Date().toISOString().substring(0, 10),
    };

    setTransfers((prev) => [...prev, newTransfer]);
    addLog('Transfer Requested', `Transfer requested for ${asset.tag} to ${toName}`, actor);
    addNotification('New Transfer Request', `${actor.name} requested transfer of ${asset.tag} to ${toName}`, 'Approvals');

    return { success: true };
  };

  const approveTransfer = (transferId, actor) => {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer) return { success: false, message: 'Transfer request not found' };

    // Update asset
    setAssets((prev) =>
      prev.map((a) =>
        a.id === transfer.assetId
          ? {
              ...a,
              status: 'Allocated',
              currentHolder: transfer.toUser,
              currentHolderEmail: transfer.toEmail,
              expectedReturnDate: null,
            }
          : a
      )
    );

    // Update transfer status
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: 'Approved' } : t))
    );

    // Save allocation history
    const historyItem = {
      assetId: transfer.assetId,
      type: 'Transfer',
      details: `Transferred from ${transfer.fromUser} to ${transfer.toUser}`,
      date: new Date().toISOString().substring(0, 10),
    };
    setHistory((prev) => [historyItem, ...prev]);

    addLog('Transfer Approved', `Approved transfer of ${transfer.assetTag} to ${transfer.toUser}`, actor);
    addNotification('Transfer Approved', `Your transfer request for ${transfer.assetTag} was approved.`, 'Approvals');

    return { success: true };
  };

  const rejectTransfer = (transferId, actor) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: 'Rejected' } : t))
    );
    const transfer = transfers.find((t) => t.id === transferId);
    if (transfer) {
      addLog('Transfer Rejected', `Rejected transfer of ${transfer.assetTag} to ${transfer.toUser}`, actor);
      addNotification('Transfer Rejected', `Transfer request for ${transfer.assetTag} was rejected.`, 'Approvals');
    }
    return { success: true };
  };

  // 6. Resource Booking Screen
  const bookResource = (resourceId, date, startTime, endTime, purpose, employeeEmail, actor) => {
    const resource = assets.find((a) => a.id === resourceId);
    if (!resource) return { success: false, message: 'Resource not found' };

    // Validation: overlap checking
    const hasOverlap = bookings.some((b) => {
      if (b.resourceId !== resourceId || b.date !== date || b.status === 'Cancelled') return false;
      // b.startTime and b.endTime
      const s1 = parseInt(startTime.replace(':', ''));
      const e1 = parseInt(endTime.replace(':', ''));
      const s2 = parseInt(b.startTime.replace(':', ''));
      const e2 = parseInt(b.endTime.replace(':', ''));

      // Check overlap: start1 < end2 AND start2 < end1
      return s1 < e2 && s2 < e1;
    });

    if (hasOverlap) {
      return {
        success: false,
        message: 'This resource is already booked during the selected time slot.',
      };
    }

    const employee = employees.find((e) => e.email === employeeEmail);
    const userName = employee ? employee.name : employeeEmail;

    const newBooking = {
      id: `bkg-${Date.now()}`,
      resourceId,
      resourceName: `${resource.name} (${resource.tag})`,
      user: userName,
      userEmail: employeeEmail,
      date,
      startTime,
      endTime,
      purpose,
      status: 'Upcoming',
    };

    setBookings((prev) => [...prev, newBooking]);
    addLog('Resource Booked', `Booked resource ${resource.tag} for ${date} ${startTime}-${endTime}`, actor);
    addNotification('Booking Confirmed', `Booking confirmed for ${resource.name} on ${date}.`, 'Bookings');

    return { success: true };
  };

  const cancelBooking = (bookingId, actor) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
    const bkg = bookings.find((b) => b.id === bookingId);
    if (bkg) {
      addLog('Booking Cancelled', `Cancelled booking for ${bkg.resourceName}`, actor);
      addNotification('Booking Cancelled', `Your booking for ${bkg.resourceName} was cancelled.`, 'Bookings');
    }
  };

  // 7. Maintenance Management
  const raiseMaintenanceRequest = (assetId, issue, priority, actor) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found' };

    const newRequest = {
      id: `maint-${Date.now()}`,
      assetId,
      assetTag: asset.tag,
      assetName: asset.name,
      issue,
      priority,
      status: 'Pending',
      raisedBy: actor.name,
      raisedByEmail: actor.email,
      requestDate: new Date().toISOString().substring(0, 10),
    };

    setMaintenances((prev) => [...prev, newRequest]);
    addLog('Maintenance Requested', `Raised maintenance request for ${asset.tag}`, actor);
    addNotification('Maintenance Requested', `New maintenance request raised for ${asset.tag}`, 'Approvals');

    return { success: true };
  };

  const updateMaintenanceStatus = (id, newStatus, extra = {}, actor) => {
    let targetAssetId = null;
    let targetTag = '';

    setMaintenances((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          targetAssetId = m.assetId;
          targetTag = m.assetTag;
          return { ...m, status: newStatus, ...extra };
        }
        return m;
      })
    );

    // Side effect: update asset status
    if (targetAssetId) {
      if (newStatus === 'Approved') {
        setAssets((prev) =>
          prev.map((a) => (a.id === targetAssetId ? { ...a, status: 'Under Maintenance' } : a))
        );
        addNotification('Maintenance Approved', `Maintenance request approved for asset ${targetTag}`, 'Approvals');
      } else if (newStatus === 'Resolved') {
        setAssets((prev) =>
          prev.map((a) => (a.id === targetAssetId ? { ...a, status: 'Available', currentHolder: null, currentHolderEmail: null, expectedReturnDate: null } : a))
        );
        addNotification('Maintenance Resolved', `Asset ${targetTag} is now fixed and Available.`, 'Alert');
      } else if (newStatus === 'Rejected') {
        addNotification('Maintenance Rejected', `Maintenance request rejected for asset ${targetTag}`, 'Approvals');
      }
    }

    addLog('Maintenance Status Updated', `Set maintenance request ${id} to ${newStatus}`, actor);
  };

  // 8. Asset Audit Screen
  const createAuditCycle = (name, scopeDept, scopeLocation, auditorEmail, actor) => {
    const auditor = employees.find((e) => e.email === auditorEmail);
    const auditorName = auditor ? auditor.name : auditorEmail;

    const newAudit = {
      id: `aud-${Date.now()}`,
      name,
      scopeDept,
      scopeLocation,
      assignedAuditor: auditorName,
      assignedAuditorEmail: auditorEmail,
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 30 days
      status: 'Active',
      checklist: {},
      discrepancyReport: {
        flaggedCount: 0,
        items: [],
      },
    };

    setAudits((prev) => [...prev, newAudit]);
    addLog('Audit Cycle Created', `Created audit cycle ${name} for ${scopeDept}`, actor);
    return newAudit;
  };

  const updateAuditChecklist = (auditId, assetId, result, notes, actor) => {
    setAudits((prev) =>
      prev.map((aud) => {
        if (aud.id === auditId) {
          const checklist = { ...aud.checklist, [assetId]: result };
          const asset = assets.find((a) => a.id === assetId);
          const assetName = asset ? asset.name : 'Unknown';
          const assetTag = asset ? asset.tag : 'Unknown';

          // Update discrepancies list
          let items = [...aud.discrepancyReport.items];
          // Remove if already in there
          items = items.filter((i) => i.assetId !== assetId);

          if (result === 'Missing' || result === 'Damaged') {
            items.push({
              assetId,
              tag: assetTag,
              name: assetName,
              issue: `Marked ${result} by Auditor ${aud.assignedAuditor}. Notes: ${notes || 'None'}`,
            });
            addNotification('Audit Discrepancy Flagged', `${assetTag} marked as ${result} during ${aud.name}`, 'Alert');
          }

          return {
            ...aud,
            checklist,
            discrepancyReport: {
              flaggedCount: items.length,
              items,
            },
          };
        }
        return aud;
      })
    );
    addLog('Audit Checklist Updated', `Asset ID ${assetId} marked as ${result} in audit ${auditId}`, actor);
  };

  const closeAuditCycle = (auditId, actor) => {
    let affectedDiscrepancies = [];

    setAudits((prev) =>
      prev.map((aud) => {
        if (aud.id === auditId) {
          affectedDiscrepancies = aud.discrepancyReport.items;
          return { ...aud, status: 'Closed' };
        }
        return aud;
      })
    );

    // Apply status updates to assets (e.g. confirming Missing assets as Lost)
    affectedDiscrepancies.forEach((item) => {
      const isMissing = item.issue.includes('Missing');
      const isDamaged = item.issue.includes('Damaged');
      const newStatus = isMissing ? 'Lost' : 'Available'; // damaged keeps available or we could mark as under maintenance, but prompt says Lost for confirmed-missing items

      setAssets((prev) =>
        prev.map((a) => {
          if (a.id === item.assetId) {
            return {
              ...a,
              status: isMissing ? 'Lost' : a.status,
              condition: isDamaged ? 'Fair' : a.condition,
            };
          }
          return a;
        })
      );
    });

    addLog('Audit Cycle Closed', `Locked audit cycle ${auditId}`, actor);
  };

  return (
    <DataContext.Provider
      value={{
        departments,
        categories,
        employees,
        assets,
        transfers,
        bookings,
        maintenances,
        audits,
        history,
        notifications,
        activityLogs,
        addDepartment,
        updateDepartment,
        toggleDepartmentStatus,
        addCategory,
        updateCategory,
        addEmployee,
        updateEmployeeRole,
        toggleEmployeeStatus,
        registerAsset,
        updateAsset,
        allocateAsset,
        returnAsset,
        requestTransfer,
        approveTransfer,
        rejectTransfer,
        bookResource,
        cancelBooking,
        raiseMaintenanceRequest,
        updateMaintenanceStatus,
        createAuditCycle,
        updateAuditChecklist,
        closeAuditCycle,
        addNotification,
        addLog,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
