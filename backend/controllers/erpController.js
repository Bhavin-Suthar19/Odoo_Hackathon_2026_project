/**
 * ============================================================================
 * ASSETFLOW ERP CONTROLLER (REAL SUPABASE CLOUD DATABASE INTEGRATION)
 * ============================================================================
 * Every endpoint reads/writes directly to Supabase cloud PostgreSQL tables.
 * ============================================================================
 */

const { supabase, isSupabaseConfigured } = require('../config/supabase');

// Helper to record activity log
const insertActivityLog = async (action, details, userObj) => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('activity_logs').insert([{
      action,
      details,
      user_name: userObj?.name || 'System',
      email: userObj?.email || 'system@company.com',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }]);
  } catch (e) {
    console.error('Error logging activity:', e.message);
  }
};

/**
 * @desc    Get all ERP data from Supabase Cloud
 * @route   GET /api/erp/data
 */
const getErpData = async (req, res, next) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Cloud Supabase client is not configured. Check backend/.env'
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

    const formattedAssets = (assets.data || []).map(a => ({
      ...a,
      acquisitionDate: a.acquisition_date,
      acquisitionCost: Number(a.acquisition_cost || 0),
      currentHolder: a.current_holder,
      currentHolderEmail: a.current_holder_email,
      expectedReturnDate: a.expected_return_date
    }));

    const formattedTransfers = (transfers.data || []).map(t => ({
      ...t,
      assetId: t.asset_id,
      assetTag: t.asset_tag,
      assetName: t.asset_name,
      fromUser: t.from_user,
      fromEmail: t.from_email,
      toUser: t.to_user,
      toEmail: t.to_email,
      requestDate: t.request_date
    }));

    const formattedBookings = (bookings.data || []).map(b => ({
      ...b,
      resourceId: b.resource_id,
      resourceName: b.resource_name,
      user: b.user_name,
      userEmail: b.user_email,
      startTime: b.start_time,
      endTime: b.end_time
    }));

    const formattedMaintenances = (maintenances.data || []).map(m => ({
      ...m,
      assetId: m.asset_id,
      assetTag: m.asset_tag,
      assetName: m.asset_name,
      raisedBy: m.raised_by,
      raisedByEmail: m.raised_by_email,
      requestDate: m.request_date
    }));

    const formattedAudits = (audits.data || []).map(aud => ({
      ...aud,
      scopeDept: aud.scope_dept,
      scopeLocation: aud.scope_location,
      assignedAuditor: aud.assigned_auditor,
      assignedAuditorEmail: aud.assigned_auditor_email,
      startDate: aud.start_date,
      endDate: aud.end_date,
      discrepancyReport: aud.discrepancy_report
    }));

    const formattedHistory = (history.data || []).map(h => ({
      ...h,
      assetId: h.asset_id
    }));

    const formattedLogs = (activityLogs.data || []).map(l => ({
      ...l,
      user: l.user_name
    }));

    return res.status(200).json({
      success: true,
      data: {
        departments: departments.data || [],
        categories: categories.data || [],
        employees: employees.data || [],
        assets: formattedAssets,
        transfers: formattedTransfers,
        bookings: formattedBookings,
        maintenances: formattedMaintenances,
        audits: formattedAudits,
        history: formattedHistory,
        notifications: notifications.data || [],
        activityLogs: formattedLogs
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create Department
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, head, headEmail, parent, actor } = req.body;
    const { data, error } = await supabase.from('departments').insert([{
      name,
      head: head || null,
      head_email: headEmail || null,
      parent: parent || null,
      status: 'Active'
    }]).select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Department Created', `Created department ${name}`, actor);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Department
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, head, headEmail, parent, actor } = req.body;
    const updateObj = {};
    if (name !== undefined) updateObj.name = name;
    if (head !== undefined) updateObj.head = head;
    if (headEmail !== undefined) updateObj.head_email = headEmail;
    if (parent !== undefined) updateObj.parent = parent;

    const { data, error } = await supabase.from('departments')
      .update(updateObj).eq('id', id).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Department Updated', `Updated department ${name || id}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * @desc    Toggle Department Status
 */
const toggleDepartmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { actor } = req.body;

    const { data: dept } = await supabase.from('departments').select('status').eq('id', id).single();
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    const newStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    const { data, error } = await supabase.from('departments')
      .update({ status: newStatus }).eq('id', id).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Department Status Toggled', `Toggled department ${id} to ${newStatus}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * @desc    Create Category
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, fields, actor } = req.body;
    const { data, error } = await supabase.from('asset_categories').insert([{
      name,
      fields: fields || []
    }]).select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Category Created', `Created asset category ${name}`, actor);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Category
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, fields, actor } = req.body;
    const updateObj = {};
    if (name !== undefined) updateObj.name = name;
    if (fields !== undefined) updateObj.fields = fields;

    const { data, error } = await supabase.from('asset_categories')
      .update(updateObj).eq('id', id).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Category Updated', `Updated category ${name || id}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * @desc    Create Employee
 */
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, role, department, actor } = req.body;
    const { data, error } = await supabase.from('employees').insert([{
      name,
      email: email.toLowerCase().trim(),
      role: role || 'Employee',
      department: department || 'Engineering',
      status: 'Active'
    }]).select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Employee Registered', `Registered employee ${name}`, actor);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Employee Role
 */
const updateEmployeeRole = async (req, res, next) => {
  try {
    const { email, role, actor } = req.body;
    const { data, error } = await supabase.from('employees')
      .update({ role })
      .eq('email', email.toLowerCase().trim())
      .select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Employee Role Updated', `Updated role for ${email} to ${role}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle Employee Status
 */
const toggleEmployeeStatus = async (req, res, next) => {
  try {
    const { email } = req.params;
    const { actor } = req.body;

    const { data: emp } = await supabase.from('employees').select('status, name').eq('email', email).single();
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    const { data, error } = await supabase.from('employees')
      .update({ status: newStatus }).eq('email', email).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Employee Status Changed', `Set ${emp.name} to ${newStatus}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * @desc    Create Asset
 */
const createAsset = async (req, res, next) => {
  try {
    const { name, category, serial, acquisitionCost, acquisitionDate, condition, location, shared, specs, actor } = req.body;

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
      serial: serial || 'N/A',
      acquisition_date: acquisitionDate || new Date().toISOString().substring(0, 10),
      acquisition_cost: Number(acquisitionCost) || 0,
      condition: condition || 'Excellent',
      location: location || 'HQ Office',
      status: 'Available',
      shared: Boolean(shared),
      specs: specs || {}
    };

    const { data, error } = await supabase.from('assets').insert([newAsset]).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Asset Registered', `Registered asset ${name} (${tag})`, actor);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Asset
 */
const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { actor, ...fields } = req.body;
    const updateObj = {};
    if (fields.name !== undefined) updateObj.name = fields.name;
    if (fields.condition !== undefined) updateObj.condition = fields.condition;
    if (fields.location !== undefined) updateObj.location = fields.location;
    if (fields.status !== undefined) updateObj.status = fields.status;
    if (fields.shared !== undefined) updateObj.shared = fields.shared;
    if (fields.specs !== undefined) updateObj.specs = fields.specs;

    const { data, error } = await supabase.from('assets')
      .update(updateObj).eq('id', id).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Asset Updated', `Updated asset ${id}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * @desc    Allocate Asset
 */
  const allocateAsset = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { employeeEmail, employeeName, expectedReturnDate, actor } = req.body;

      const { data: asset, error: fetchErr } = await supabase.from('assets').select('*').eq('id', id).single();
      if (fetchErr || !asset) return res.status(404).json({ success: false, message: 'Asset not found' });

      const isHolderOrAdmin =
        (actor && actor.email && asset.current_holder_email &&
         actor.email.toLowerCase() === asset.current_holder_email.toLowerCase()) ||
        (actor && actor.role === 'Admin');

      if (asset.status !== 'Available' && asset.status !== 'Reserved' && !isHolderOrAdmin) {
        return res.status(400).json({
          success: false,
          message: `Asset is already held by ${asset.current_holder || 'someone else'}. Transfer request required.`
        });
      }

      const { data, error } = await supabase.from('assets')
        .update({
          status: 'Allocated',
          current_holder: employeeName,
          current_holder_email: employeeEmail,
          expected_return_date: expectedReturnDate || null
        })
        .eq('id', id)
        .select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    await supabase.from('asset_history').insert([{
      asset_id: id,
      type: 'Allocation',
      details: `Allocated to ${employeeName} (${employeeEmail})`
    }]);

    await insertActivityLog('Asset Allocated', `Allocated ${asset.name} (${asset.tag}) to ${employeeName}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Return Asset
 */
const returnAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { checkInNotes, condition, actor } = req.body;

    const { data: asset, error: fetchErr } = await supabase.from('assets').select('*').eq('id', id).single();
    if (fetchErr || !asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const prevHolder = asset.current_holder || 'Previous holder';

    const { data, error } = await supabase.from('assets')
      .update({
        status: 'Available',
        current_holder: null,
        current_holder_email: null,
        expected_return_date: null,
        condition: condition || asset.condition
      })
      .eq('id', id)
      .select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    await supabase.from('asset_history').insert([{
      asset_id: id,
      type: 'Return',
      details: `Returned by ${prevHolder}. Notes: ${checkInNotes || 'None'}. Condition: ${condition || asset.condition}`
    }]);

    await insertActivityLog('Asset Returned', `Asset ${asset.tag} returned by ${prevHolder}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Request Transfer
 */
const requestTransfer = async (req, res, next) => {
  try {
    const { assetId, toEmployeeEmail, reason, actor } = req.body;

    const { data: asset } = await supabase.from('assets').select('*').eq('id', assetId).single();
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const { data: targetEmp } = await supabase.from('employees').select('*').eq('email', toEmployeeEmail).single();
    const toName = targetEmp ? targetEmp.name : toEmployeeEmail;

    const newTransfer = {
      asset_id: assetId,
      asset_tag: asset.tag,
      asset_name: asset.name,
      from_user: asset.current_holder || 'System',
      from_email: asset.current_holder_email || '',
      to_user: toName,
      to_email: toEmployeeEmail,
      reason,
      status: 'Requested',
      request_date: new Date().toISOString().substring(0, 10)
    };

    const { data, error } = await supabase.from('asset_transfers').insert([newTransfer]).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Transfer Requested', `Transfer requested for ${asset.tag} to ${toName}`, actor);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Approve Transfer
 */
const approveTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { actor } = req.body;

    const { data: transfer } = await supabase.from('asset_transfers').select('*').eq('id', id).single();
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });

    await supabase.from('assets').update({
      status: 'Allocated',
      current_holder: transfer.to_user,
      current_holder_email: transfer.to_email,
      expected_return_date: null
    }).eq('id', transfer.asset_id);

    const { data, error } = await supabase.from('asset_transfers')
      .update({ status: 'Approved' })
      .eq('id', id)
      .select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    await supabase.from('asset_history').insert([{
      asset_id: transfer.asset_id,
      type: 'Transfer',
      details: `Transferred from ${transfer.from_user} to ${transfer.to_user}`
    }]);

    await insertActivityLog('Transfer Approved', `Approved transfer of ${transfer.asset_tag} to ${transfer.to_user}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reject Transfer
 */
const rejectTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { actor } = req.body;

    const { data, error } = await supabase.from('asset_transfers')
      .update({ status: 'Rejected' })
      .eq('id', id)
      .select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Transfer Rejected', `Rejected transfer request ${id}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Book Resource
 */
const bookResource = async (req, res, next) => {
  try {
    const { resourceId, resourceName, userName, userEmail, date, startTime, endTime, purpose, actor } = req.body;

    const { data: existingBookings } = await supabase
      .from('resource_bookings')
      .select('*')
      .eq('resource_id', resourceId)
      .eq('date', date)
      .neq('status', 'Cancelled');

    if (existingBookings) {
      const s1 = parseInt(startTime.replace(':', ''), 10);
      const e1 = parseInt(endTime.replace(':', ''), 10);

      for (const b of existingBookings) {
        const s2 = parseInt(b.start_time.replace(':', ''), 10);
        const e2 = parseInt(b.end_time.replace(':', ''), 10);
        if (s1 < e2 && s2 < e1) {
          return res.status(409).json({
            success: false,
            message: 'This resource is already booked during the requested time slot.'
          });
        }
      }
    }

    const { data, error } = await supabase.from('resource_bookings').insert([{
      resource_id: resourceId,
      resource_name: resourceName,
      user_name: userName,
      user_email: userEmail,
      date,
      start_time: startTime,
      end_time: endTime,
      status: 'Upcoming',
      purpose
    }]).select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Resource Booked', `Booked ${resourceName} for ${date} (${startTime}-${endTime})`, actor);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Cancel Booking
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, actor } = req.body;

    const { data, error } = await supabase.from('resource_bookings')
      .update({ status: 'Cancelled' })
      .eq('id', id)
      .select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    const detailsText = reason ? `Cancelled booking ${id} — Message to user: ${reason}` : `Cancelled booking ID ${id}`;
    await insertActivityLog('Booking Cancelled', detailsText, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Raise Maintenance Request
 */
const raiseMaintenance = async (req, res, next) => {
  try {
    const { assetId, issue, priority, actor } = req.body;
    const { data: asset } = await supabase.from('assets').select('*').eq('id', assetId).single();
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const { data, error } = await supabase.from('maintenance_requests').insert([{
      asset_id: assetId,
      asset_tag: asset.tag,
      asset_name: asset.name,
      issue,
      priority: priority || 'Medium',
      status: 'Pending',
      raised_by: actor.name,
      raised_by_email: actor.email,
      request_date: new Date().toISOString().substring(0, 10)
    }]).select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Maintenance Requested', `Raised ticket for asset ${asset.tag}`, actor);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Maintenance Status
 */
const updateMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, technician, notes, actor } = req.body;

    const { data: ticket } = await supabase.from('maintenance_requests').select('*').eq('id', id).single();
    if (!ticket) return res.status(404).json({ success: false, message: 'Maintenance ticket not found' });

    const updateObj = { status };
    if (technician !== undefined) updateObj.technician = technician;
    if (notes !== undefined) updateObj.notes = notes;

    const { data, error } = await supabase.from('maintenance_requests')
      .update(updateObj)
      .eq('id', id)
      .select().single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    if (status === 'Approved' || status === 'In Progress') {
      await supabase.from('assets').update({ status: 'Under Maintenance' }).eq('id', ticket.asset_id);
    } else if (status === 'Resolved') {
      await supabase.from('assets').update({
        status: 'Available',
        current_holder: null,
        current_holder_email: null
      }).eq('id', ticket.asset_id);
    }

    await insertActivityLog('Maintenance Updated', `Updated ticket ${id} to ${status}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create Audit Cycle
 */
const createAudit = async (req, res, next) => {
  try {
    const { name, scopeDept, scopeLocation, auditorEmail, actor } = req.body;

    const { data: auditor } = await supabase.from('employees').select('*').eq('email', auditorEmail).single();
    const auditorName = auditor ? auditor.name : auditorEmail;

    const { data: scopedAssets } = await supabase.from('assets')
      .select('*')
      .ilike('location', `%${scopeLocation || ''}%`);

    const checklist = {};
    if (scopedAssets) {
      scopedAssets.forEach(a => { checklist[a.id] = 'Pending Verification'; });
    }

    const newAudit = {
      name,
      scope_dept: scopeDept || 'All Departments',
      scope_location: scopeLocation || 'HQ',
      assigned_auditor: auditorName,
      assigned_auditor_email: auditorEmail,
      start_date: new Date().toISOString().substring(0, 10),
      end_date: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      status: 'Active',
      checklist,
      discrepancy_report: { flaggedCount: 0, items: [] }
    };

    const { data, error } = await supabase.from('audit_cycles').insert([newAudit]).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Audit Cycle Created', `Created audit cycle ${name}`, actor);
    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Audit Checklist
 */
const updateAuditChecklist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assetId, itemStatus, issueText, actor } = req.body;

    const { data: audit } = await supabase.from('audit_cycles').select('checklist, discrepancy_report').eq('id', id).single();
    if (!audit) return res.status(404).json({ success: false, message: 'Audit cycle not found' });

    const newChecklist = { ...(audit.checklist || {}), [assetId]: itemStatus };
    let discReport = audit.discrepancy_report || { flaggedCount: 0, items: [] };

    if (itemStatus === 'Damaged' || itemStatus === 'Missing') {
      const items = discReport.items || [];
      const alreadyFlagged = items.some(i => i.assetId === assetId);
      if (!alreadyFlagged) {
        items.push({ assetId, issue: issueText || `Marked ${itemStatus}` });
        discReport = { flaggedCount: items.length, items };
      }
    }

    const { data, error } = await supabase.from('audit_cycles')
      .update({ checklist: newChecklist, discrepancy_report: discReport })
      .eq('id', id).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Audit Checklist Updated', `Updated checklist for audit ${id}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * @desc    Close Audit Cycle
 */
const closeAuditCycle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { actor } = req.body;

    const { data, error } = await supabase.from('audit_cycles')
      .update({ status: 'Closed' }).eq('id', id).select().single();
    if (error) return res.status(400).json({ success: false, message: error.message });

    await insertActivityLog('Audit Cycle Closed', `Closed audit cycle ${id}`, actor);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
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
};
