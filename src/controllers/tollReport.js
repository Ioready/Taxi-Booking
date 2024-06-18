const db = require('../db');

// Create Toll Report
exports.createTollReport = async (req, res) => {
  const {
    booking_id,
    reporter_id,
    toll_location,
    toll_amount
  } = req.body;

  try {
    // Insert toll report record into the database
    const result = await db.query(
      'INSERT INTO TollReports(booking_id, reporter_id, toll_location, toll_amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [booking_id, reporter_id, toll_location, toll_amount]
    );

    // Check if the insertion was successful
    if (result.rowCount === 1) {
      return res.status(201).json({
        success: true,
        message: 'Toll report created successfully',
        tollReport: result.rows[0] // Return the created toll report
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to create toll report'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Update Toll Report
exports.updateTollReport = async (req, res) => {
  const toll_report_id = req.params.toll_report_id;
  const {
    booking_id,
    reporter_id,
    toll_location,
    toll_amount,
    status
  } = req.body;

  try {
    // Fetch current toll report record
    const reportResult = await db.query('SELECT * FROM TollReports WHERE toll_report_id = $1', [toll_report_id]);

    if (reportResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Toll report not found'
      });
    }

    const currentReport = reportResult.rows[0];

    // Update parameters with current values if empty
    const updatedBookingId = booking_id || currentReport.booking_id;
    const updatedReporterId = reporter_id || currentReport.reporter_id;
    const updatedTollLocation = toll_location || currentReport.toll_location;
    const updatedTollAmount = toll_amount || currentReport.toll_amount;
    const updatedStatus = status || currentReport.status;

    // Perform the update operation
    const result = await db.query(
      'UPDATE TollReports SET booking_id = $1, reporter_id = $2, toll_location = $3, toll_amount = $4, status = $5 WHERE toll_report_id = $6 RETURNING *',
      [updatedBookingId, updatedReporterId, updatedTollLocation, updatedTollAmount, updatedStatus, toll_report_id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Toll report updated successfully',
        tollReport: result.rows[0]
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to update toll report'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get All Toll Reports
exports.getTollReports = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM TollReports');
    return res.status(200).json({
      success: true,
      tollReports: result.rows
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get Toll Report By ID
exports.getTollReportById = async (req, res) => {
  const toll_report_id = req.params.toll_report_id;

  try {
    // Fetch toll report record by ID
    const result = await db.query('SELECT * FROM TollReports WHERE toll_report_id = $1', [toll_report_id]);

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        tollReport: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Toll report not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Delete Toll Report
exports.deleteTollReport = async (req, res) => {
  const toll_report_id = req.params.toll_report_id;

  try {
    // Fetch current toll report record
    const reportResult = await db.query('SELECT * FROM TollReports WHERE toll_report_id = $1', [toll_report_id]);

    if (reportResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Toll report not found'
      });
    }

    // Perform the delete operation
    const deleteResult = await db.query('DELETE FROM TollReports WHERE toll_report_id = $1', [toll_report_id]);

    if (deleteResult.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Toll report deleted successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete toll report'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};
