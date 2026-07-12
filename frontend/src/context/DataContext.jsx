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

  const fetchAllData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/data`);
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
    } catch (err) {
      console.error('Failed to load ERP master data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
    try {
      const res = await fetch(`${API_BASE}/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedDept, actor })
      });
      if (res.ok) await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDepartmentStatus = async (id, actor) => {
    try {
      const res = await fetch(`${API_BASE}/departments/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor })
      });
      if (res.ok) await fetchAllData();
    } catch (e) {
      console.error(e);
    }
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
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedCat, actor })
      });
      if (res.ok) await fetchAllData();
    } catch (e) {
      console.error(e);
    }
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
    try {
      const res = await fetch(`${API_BASE}/employees/${encodeURIComponent(email)}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor })
      });
      if (res.ok) await fetchAllData();
    } catch (e) {
      console.error(e);
    }
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
    try {
      const res = await fetch(`${API_BASE}/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedFields, actor })
      });
      if (res.ok) await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Allocation & Returns & Transfers
  // 5. Allocation & Returns & Transfers
  const allocateAsset = async (assetId, employeeEmail, expectedReturnDate, actor) => {
    try {
      const res = await fetch(`${API_BASE}/assets/${assetId}/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeEmail,
          employeeName: employees.find(e => e.email === employeeEmail)?.name || employeeEmail,
          expectedReturnDate,
          actor
        })
      });
      if (res.ok) {
        await fetchAllData();
        return { success: true };
      }
      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.message || 'Failed to allocate asset' };
    } catch (e) {
      console.error(e);
      return { success: false, message: e.message };
    }
  };

  const returnAsset = async (assetId, checkInNotes, condition, actor) => {
    try {
      const res = await fetch(`${API_BASE}/assets/${assetId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkInNotes, condition, actor })
      });
      if (res.ok) {
        await fetchAllData();
        return { success: true };
      }
      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.message || 'Failed to process return' };
    } catch (e) {
      console.error(e);
      return { success: false, message: e.message };
    }
  };

  const requestTransfer = async (assetId, toEmployeeEmail, reason, actor) => {
    try {
      const res = await fetch(`${API_BASE}/transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, toEmployeeEmail, reason, actor })
      });
      if (res.ok) {
        await fetchAllData();
        return { success: true };
      }
      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.message || 'Failed to submit transfer request' };
    } catch (e) {
      console.error(e);
      return { success: false, message: e.message };
    }
  };

  const approveTransfer = async (transferId, actor) => {
    try {
      const res = await fetch(`${API_BASE}/transfers/${transferId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor })
      });
      if (res.ok) await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const rejectTransfer = async (transferId, actor) => {
    try {
      const res = await fetch(`${API_BASE}/transfers/${transferId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor })
      });
      if (res.ok) await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Resource Booking
  const bookResource = async (arg1, date, startTime, endTime, purpose, userEmail, actor) => {
    try {
      let payload = {};
      if (typeof arg1 === 'object' && arg1 !== null) {
        payload = { ...arg1, actor: date || actor };
      } else {
        const resourceObj = assets.find(a => a.id === arg1);
        payload = {
          resourceId: arg1,
          resourceName: resourceObj ? resourceObj.name : arg1,
          userName: actor?.name || userEmail || 'Employee',
          userEmail: userEmail || actor?.email,
          date,
          startTime,
          endTime,
          purpose,
          actor
        };
      }
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchAllData();
        return { success: true };
      }
      const data = await res.json();
      return { success: false, message: data.message || 'Booking conflict' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const cancelBooking = async (bookingId, cancelReason, actor) => {
    try {
      const reasonStr = typeof cancelReason === 'string' ? cancelReason : '';
      const actorObj = typeof cancelReason === 'object' ? cancelReason : actor;

      await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reasonStr, actor: actorObj })
      });
      await fetchAllData();
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false };
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

  const updateAuditChecklist = async (auditId, assetId, itemStatus, issueText, actor) => {
    try {
      await fetch(`${API_BASE}/audits/${auditId}/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, itemStatus, issueText, actor })
      });
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const closeAuditCycle = async (auditId, actor) => {
    try {
      await fetch(`${API_BASE}/audits/${auditId}/close`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor })
      });
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
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
