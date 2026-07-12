import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DataContext = createContext(null);
const API_BASE = 'http://localhost:5000/api/erp';

export const DataProvider = ({ children }) => {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [audits, setAudits] = useState([]);
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from Cloud Supabase via Backend API
  const fetchAllData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/data`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDepartments(json.data.departments || []);
          setCategories(json.data.categories || []);
          setEmployees(json.data.employees || []);
          setAssets(json.data.assets || []);
          setTransfers(json.data.transfers || []);
          setBookings(json.data.bookings || []);
          setMaintenances(json.data.maintenances || []);
          setAudits(json.data.audits || []);
          setHistory(json.data.history || []);
          setNotifications(json.data.notifications || []);
          setActivityLogs(json.data.activityLogs || []);
        }
      }
    } catch (err) {
      console.error('Error fetching live ERP data from Supabase backend:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Helper local notification
  const addNotification = (title, message, type = 'Alert') => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      date: 'Today',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // 1. Department Management
  const addDepartment = async (dept, actor) => {
    try {
      const res = await fetch(`${API_BASE}/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dept, actor })
      });
      if (res.ok) await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateDepartment = async (id, updatedDept, actor) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...updatedDept } : d)));
  };

  const toggleDepartmentStatus = async (id, actor) => {
    setDepartments(prev =>
      prev.map(d => (d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d))
    );
  };

  // 2. Asset Category Management
  const addCategory = async (category, actor) => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, actor })
      });
      if (res.ok) await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateCategory = async (id, updatedCat, actor) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updatedCat } : c)));
  };

  // 3. Employee Directory
  const addEmployee = async (emp, actor) => {
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emp, actor })
      });
      if (res.ok) await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateEmployeeRole = async (email, newRole, actor) => {
    try {
      const res = await fetch(`${API_BASE}/employees/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: newRole, actor })
      });
      if (res.ok) await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleEmployeeStatus = async (email, actor) => {
    setEmployees(prev =>
      prev.map(e => (e.email === email ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' } : e))
    );
  };

  // 4. Asset Directory
  const registerAsset = async (asset, actor) => {
    try {
      const res = await fetch(`${API_BASE}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...asset, actor })
      });
      if (res.ok) {
        await fetchAllData();
        return { success: true };
      }
      return { success: false, message: 'Failed to register asset' };
    } catch (e) {
      console.error(e);
      return { success: false, message: e.message };
    }
  };

  const updateAsset = async (id, updatedFields, actor) => {
    setAssets(prev => prev.map(a => (a.id === id ? { ...a, ...updatedFields } : a)));
  };

  // 5. Allocation & Returns & Transfers
  const allocateAsset = (assetId, employeeEmail, expectedReturnDate, actor) => {
    fetch(`${API_BASE}/assets/${assetId}/allocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeEmail,
        employeeName: employees.find(e => e.email === employeeEmail)?.name || employeeEmail,
        expectedReturnDate,
        actor
      })
    }).then(async res => {
      if (res.ok) {
        await fetchAllData();
        addNotification('Asset Allocated', `Asset assigned successfully to ${employeeEmail}`, 'Alert');
      }
    });

    return { success: true };
  };

  const returnAsset = (assetId, checkInNotes, condition, actor) => {
    fetch(`${API_BASE}/assets/${assetId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkInNotes, condition, actor })
    }).then(async res => {
      if (res.ok) {
        await fetchAllData();
        addNotification('Asset Returned', `Check-in return processed successfully.`, 'Alert');
      }
    });
    return { success: true };
  };

  const requestTransfer = (assetId, toEmployeeEmail, reason, actor) => {
    fetch(`${API_BASE}/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId, toEmployeeEmail, reason, actor })
    }).then(async res => {
      if (res.ok) {
        await fetchAllData();
        addNotification('New Transfer Request', `Transfer requested for ${assetId}`, 'Approvals');
      }
    });
    return { success: true };
  };

  const approveTransfer = async (transferId, actor) => {
    try {
      const res = await fetch(`${API_BASE}/transfers/${transferId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor })
      });
      if (res.ok) {
        await fetchAllData();
        addNotification('Transfer Approved', 'Device transfer has been approved.', 'Approvals');
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  const rejectTransfer = async (transferId, actor) => {
    try {
      await fetch(`${API_BASE}/transfers/${transferId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor })
      });
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
    return { success: true };
  };

  // 6. Resource Booking
  const bookResource = async (resourceId, date, startTime, endTime, purpose, employeeEmail, actor) => {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId,
          resourceName: assets.find(a => a.id === resourceId)?.name || 'Resource',
          userName: actor?.name || employeeEmail,
          userEmail: employeeEmail,
          date,
          startTime,
          endTime,
          purpose,
          actor
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        await fetchAllData();
        addNotification('Booking Confirmed', `Booking confirmed for ${date} (${startTime}-${endTime})`, 'Bookings');
        return { success: true };
      } else {
        return { success: false, message: json.message || 'Booking conflict or error.' };
      }
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const cancelBooking = async (bookingId, actor) => {
    try {
      await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor })
      });
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Maintenance Management
  const raiseMaintenanceRequest = async (assetId, issue, priority, actor) => {
    try {
      const res = await fetch(`${API_BASE}/maintenances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, issue, priority, actor })
      });
      if (res.ok) {
        await fetchAllData();
        addNotification('Maintenance Raised', `Maintenance ticket raised successfully.`, 'Approvals');
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }
    return { success: false };
  };

  const updateMaintenanceStatus = async (id, newStatus, extra = {}, actor) => {
    try {
      await fetch(`${API_BASE}/maintenances/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...extra, actor })
      });
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Asset Audits
  const createAuditCycle = async (name, scopeDept, scopeLocation, auditorEmail, actor) => {
    try {
      await fetch(`${API_BASE}/audits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, scopeDept, scopeLocation, auditorEmail, actor })
      });
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateAuditChecklist = (auditId, assetId, itemStatus, issueText, actor) => {
    setAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          checklist: { ...(a.checklist || {}), [assetId]: itemStatus }
        };
      }
      return a;
    }));
  };

  const closeAuditCycle = (auditId, actor) => {
    setAudits(prev => prev.map(a => (a.id === auditId ? { ...a, status: 'Closed' } : a)));
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
        loading,
        fetchAllData,
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
