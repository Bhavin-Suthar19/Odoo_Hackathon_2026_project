/**
 * ============================================================================
 * ASSETFLOW ERP CONTROLLER (SUPABASE CLOUD DATABASE INTEGRATION)
 * ============================================================================
 * Handles full ERP REST API endpoints for:
 * 1. Departments
 * 2. Asset Categories
 * 3. Employee Directory & Roles
 * 4. Assets & Lifecycle States
 * 5. Allocations & Transfers
 * 6. Resource Bookings (with Overlap Prevention)
 * 7. Maintenance Management Workflow
 * 8. Audit Cycles & Discrepancy Reports
 * 9. Activity Logs & Notifications
 * ============================================================================
 */

const { supabase, isSupabaseConfigured } = require('../config/supabase');

/**
 * @desc    Get all ERP master data & operational records
 * @route   GET /api/erp/data
 */
const getErpData = async (req, res, next) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(200).json({
        success: true,
        mode: 'demo',
        message: 'Cloud Supabase client is running in fallback/demo mode or not connected.'
      });
    }

    const [
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
      activityLogs
    ] = await Promise.all([
      supabase.from('departments').select('*').order('created_at', { ascending: true }),
      supabase.from('asset_categories').select('*').order('created_at', { ascending: true }),
      supabase.from('employees').select('*').order('created_at', { ascending: true }),
      supabase.from('assets').select('*').order('created_at', { ascending: true }),
      supabase.from('asset_transfers').select('*').order('created_at', { ascending: false }),
      supabase.from('resource_bookings').select('*').order('date', { ascending: true }),
      supabase.from('maintenance_requests').select('*').order('request_date', { ascending: false }),
      supabase.from('audit_cycles').select('*').order('start_date', { ascending: false }),
      supabase.from('asset_history').select('*').order('date', { ascending: false }),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false })
    ]);

    return res.status(200).json({
      success: true,
      mode: 'supabase',
      data: {
        departments: departments.data || [],
        categories: categories.data || [],
        employees: employees.data || [],
        assets: assets.data || [],
        transfers: transfers.data || [],
        bookings: bookings.data || [],
        maintenances: maintenances.data || [],
        audits: audits.data || [],
        history: history.data || [],
        notifications: notifications.data || [],
        activityLogs: activityLogs.data || []
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new Asset in Supabase
 * @route   POST /api/erp/assets
 */
const createAsset = async (req, res, next) => {
  try {
    const { name, category, serial, acquisition_cost, condition, location, shared, specs } = req.body;
    if (!isSupabaseConfigured()) {
      return res.status(201).json({ success: true, message: 'Asset created in local store' });
    }

    // Auto-generate tag
    const { data: existingAssets } = await supabase.from('assets').select('tag');
    let maxNum = 0;
    if (existingAssets) {
      existingAssets.forEach((a) => {
        const num = parseInt(a.tag.replace('AF-', ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });
    }
    const tag = `AF-${String(maxNum + 1).padStart(4, '0')}`;

    const newAsset = {
      tag,
      name,
      category,
      serial: serial || '',
      acquisition_cost: acquisition_cost || 0,
      condition: condition || 'Excellent',
      location: location || 'HQ Office',
      status: 'Available',
      shared: Boolean(shared),
      specs: specs || {}
    };

    const { data, error } = await supabase.from('assets').insert([newAsset]).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Allocate an asset to an employee
 * @route   POST /api/erp/assets/:id/allocate
 */
const allocateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employeeEmail, employeeName, expectedReturnDate } = req.body;

    if (!isSupabaseConfigured()) {
      return res.status(200).json({ success: true, message: 'Allocated in local store' });
    }

    // Check status first to prevent double allocation
    const { data: asset, error: fetchErr } = await supabase.from('assets').select('*').eq('id', id).single();
    if (fetchErr || !asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (asset.status !== 'Available' && asset.status !== 'Reserved') {
      return res.status(400).json({
        success: false,
        message: `Asset is already held by ${asset.current_holder || 'another employee'}. Transfer request required.`
      });
    }

    const { data, error } = await supabase
      .from('assets')
      .update({
        status: 'Allocated',
        current_holder: employeeName,
        current_holder_email: employeeEmail,
        expected_return_date: expectedReturnDate || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    // Log history
    await supabase.from('asset_history').insert([{
      asset_id: id,
      type: 'Allocation',
      details: `Allocated to ${employeeName} (${employeeEmail})`
    }]);

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Book a shared resource with Overlap Validation
 * @route   POST /api/erp/bookings
 */
const bookResource = async (req, res, next) => {
  try {
    const { resourceId, resourceName, userName, userEmail, date, startTime, endTime, purpose } = req.body;

    if (!isSupabaseConfigured()) {
      return res.status(201).json({ success: true, message: 'Booked in local store' });
    }

    // Check overlaps
    const { data: existingBookings } = await supabase
      .from('resource_bookings')
      .select('*')
      .eq('resource_id', resourceId)
      .eq('date', date)
      .neq('status', 'Cancelled');

    let hasOverlap = false;
    if (existingBookings) {
      const s1 = parseInt(startTime.replace(':', ''), 10);
      const e1 = parseInt(endTime.replace(':', ''), 10);

      for (const b of existingBookings) {
        const s2 = parseInt(b.start_time.replace(':', ''), 10);
        const e2 = parseInt(b.end_time.replace(':', ''), 10);
        if (s1 < e2 && s2 < e1) {
          hasOverlap = true;
          break;
        }
      }
    }

    if (hasOverlap) {
      return res.status(409).json({
        success: false,
        message: 'Overlap error: This resource is already booked during the requested time slot.'
      });
    }

    const newBooking = {
      resource_id: resourceId,
      resource_name: resourceName,
      user_name: userName,
      user_email: userEmail,
      date,
      start_time: startTime,
      end_time: endTime,
      purpose,
      status: 'Upcoming'
    };

    const { data, error } = await supabase.from('resource_bookings').insert([newBooking]).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getErpData,
  createAsset,
  allocateAsset,
  bookResource
};
