const express = require('express');
const router = express.Router();
const {
  getErpData,
  createDepartment,
  createCategory,
  createEmployee,
  updateEmployeeRole,
  createAsset,
  allocateAsset,
  returnAsset,
  requestTransfer,
  approveTransfer,
  rejectTransfer,
  bookResource,
  cancelBooking,
  raiseMaintenance,
  updateMaintenance,
  createAudit
} = require('../controllers/erpController');

// Master data fetch
router.get('/data', getErpData);

// Departments
router.post('/departments', createDepartment);

// Categories
router.post('/categories', createCategory);

// Employees
router.post('/employees', createEmployee);
router.put('/employees/role', updateEmployeeRole);

// Assets & Allocation
router.post('/assets', createAsset);
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

module.exports = router;
