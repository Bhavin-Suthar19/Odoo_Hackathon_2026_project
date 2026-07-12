const express = require('express');
const router = express.Router();
const {
  getErpData,
  createDepartment,
  updateDepartment,
  toggleDepartmentStatus,
  createCategory,
  updateCategory,
  createEmployee,
  updateEmployeeRole,
  toggleEmployeeStatus,
  createAsset,
  updateAsset,
  allocateAsset,
  returnAsset,
  requestTransfer,
  approveTransfer,
  rejectTransfer,
  bookResource,
  cancelBooking,
  raiseMaintenance,
  updateMaintenance,
  createAudit,
  updateAuditChecklist,
  closeAuditCycle
} = require('../controllers/erpController');

// Master data fetch
router.get('/data', getErpData);

// Departments
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.put('/departments/:id/toggle', toggleDepartmentStatus);

// Categories
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);

// Employees
router.post('/employees', createEmployee);
router.put('/employees/role', updateEmployeeRole);
router.put('/employees/:email/toggle', toggleEmployeeStatus);

// Assets
router.post('/assets', createAsset);
router.put('/assets/:id', updateAsset);
router.post('/assets/:id/allocate', allocateAsset);
router.post('/assets/:id/return', returnAsset);

// Transfers
router.post('/transfers', requestTransfer);
router.put('/transfers/:id/approve', approveTransfer);
router.put('/transfers/:id/reject', rejectTransfer);

// Resource Bookings
router.post('/bookings', bookResource);
router.put('/bookings/:id/cancel', cancelBooking);

// Maintenance
router.post('/maintenances', raiseMaintenance);
router.put('/maintenances/:id/status', updateMaintenance);

// Audits
router.post('/audits', createAudit);
router.put('/audits/:id/checklist', updateAuditChecklist);
router.put('/audits/:id/close', closeAuditCycle);

module.exports = router;
