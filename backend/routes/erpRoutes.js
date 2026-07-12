const express = require('express');
const router = express.Router();
const {
  getErpData,
  createAsset,
  allocateAsset,
  bookResource
} = require('../controllers/erpController');

router.get('/data', getErpData);
router.post('/assets', createAsset);
router.post('/assets/:id/allocate', allocateAsset);
router.post('/bookings', bookResource);

module.exports = router;
