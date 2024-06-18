const db = require('../db');
const fs = require('fs');
const path = require('path');

// Create Incident Report
exports.createIncidentReport = async (req, res) => {
  const {
    booking_id,
    reporter_id,
    description
  } = req.body;

  try {
    // Extract file paths of uploaded images
    let media = [];
    if (req.files && req.files.length > 0) {
      // Construct file address with domain from environment variable
      const domain = process.env.DOMAIN;
      media = req.files.map(file => `${domain}/uploads/incident/${file.filename}`);
    }

    // Insert incident report record into the database
    const result = await db.query(
      'INSERT INTO IncidentReports(booking_id, reporter_id, description, media) VALUES ($1, $2, $3, $4) RETURNING *',
      [booking_id, reporter_id, description, media]
    );

    // Check if the insertion was successful
    if (result.rowCount === 1) {
      return res.status(201).json({
        success: true,
        message: 'Incident report created successfully',
        incidentReport: result.rows[0] // Return the created incident report
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to create incident report'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Update Incident Report
exports.updateIncidentReport = async (req, res) => {
  const report_id = req.params.report_id;
  const {
    booking_id,
    reporter_id,
    description,
    status
  } = req.body;

  try {
    // Fetch current incident report record
    const reportResult = await db.query('SELECT * FROM IncidentReports WHERE report_id = $1', [report_id]);

    if (reportResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Incident report not found'
      });
    }

    const currentReport = reportResult.rows[0];

    // Update parameters with current values if empty
    const updatedBookingId = booking_id || currentReport.booking_id;
    const updatedReporterId = reporter_id || currentReport.reporter_id;
    const updatedDescription = description || currentReport.description;
    const updatedStatus = status || currentReport.status;

    // Extract file paths of uploaded images
    let media = currentReport.media; // Initialize with current media
    if (req.files && req.files.length > 0) {
      // Construct file address with domain from environment variable
      const domain = process.env.DOMAIN;
      media = req.files.map(file => `${domain}/uploads/incident/${file.filename}`);
    }

    // Perform the update operation
    const result = await db.query(
      'UPDATE IncidentReports SET booking_id = $1, reporter_id = $2, description = $3, media = $4, status = $5 WHERE report_id = $6 RETURNING *',
      [updatedBookingId, updatedReporterId, updatedDescription, media, updatedStatus, report_id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Incident report updated successfully',
        incidentReport: result.rows[0]
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to update incident report'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get All Incident Reports
exports.getIncidentReports = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM IncidentReports');
    return res.status(200).json({
      success: true,
      incidentReports: result.rows
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get Incident Report By ID
exports.getIncidentReportById = async (req, res) => {
  const report_id = req.params.report_id;

  try {
    // Fetch incident report record by ID
    const result = await db.query('SELECT * FROM IncidentReports WHERE report_id = $1', [report_id]);

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        incidentReport: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Incident report not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Delete Incident Report
exports.deleteIncidentReport = async (req, res) => {
  const report_id = req.params.report_id;

  try {
    // Fetch current incident report record
    const reportResult = await db.query('SELECT * FROM IncidentReports WHERE report_id = $1', [report_id]);

    if (reportResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Incident report not found'
      });
    }

    // Extract file paths of media associated with the incident report
    const report = reportResult.rows[0];
    const media = report.media || [];

    // Perform the delete operation
    const deleteResult = await db.query('DELETE FROM IncidentReports WHERE report_id = $1', [report_id]);

    if (deleteResult.rowCount === 1) {
      // Delete associated media files from the filesystem
      media.forEach(file => {
        // Remove domain part from the file path
        const filePath = file.replace(`${process.env.DOMAIN}/uploads/`, 'uploads/');
        
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${filePath}`, err);
          } else {
            console.log(`File deleted: ${filePath}`);
          }
        });
      });

      return res.status(200).json({
        success: true,
        message: 'Incident report deleted successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete incident report'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};
