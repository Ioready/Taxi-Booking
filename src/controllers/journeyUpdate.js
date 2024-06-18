const db = require('../db');

// Create Journey Update
exports.createJourneyUpdate = async (req, res) => {
  const {
    booking_id,
    update_type,
    message
  } = req.body;

  try {
    // Insert journey update record into the database
    const result = await db.query(
      'INSERT INTO JourneyUpdates(booking_id, update_type, message) VALUES ($1, $2, $3) RETURNING *',
      [booking_id, update_type, message]
    );

    // Check if the insertion was successful
    if (result.rowCount === 1) {
      return res.status(201).json({
        success: true,
        message: 'Journey update created successfully',
        journeyUpdate: result.rows[0] // Return the created journey update
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to create journey update'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Update Journey Update
exports.updateJourneyUpdate = async (req, res) => {
  const update_id = req.params.update_id;
  const {
    booking_id,
    update_type,
    message
  } = req.body;

  try {
    // Fetch current journey update record
    const updateResult = await db.query('SELECT * FROM JourneyUpdates WHERE update_id = $1', [update_id]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Journey update not found'
      });
    }

    const currentUpdate = updateResult.rows[0];

    // Update parameters with current values if empty
    const updatedBookingId = booking_id || currentUpdate.booking_id;
    const updatedUpdateType = update_type || currentUpdate.update_type;
    const updatedMessage = message || currentUpdate.message;

    // Perform the update operation
    const result = await db.query(
      'UPDATE JourneyUpdates SET booking_id = $1, update_type = $2, message = $3 WHERE update_id = $4 RETURNING *',
      [updatedBookingId, updatedUpdateType, updatedMessage, update_id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Journey update updated successfully',
        journeyUpdate: result.rows[0]
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to update journey update'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get All Journey Updates
exports.getJourneyUpdates = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM JourneyUpdates');
    return res.status(200).json({
      success: true,
      journeyUpdates: result.rows
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get Journey Update By ID
exports.getJourneyUpdateById = async (req, res) => {
  const update_id = req.params.update_id;

  try {
    // Fetch journey update record by ID
    const result = await db.query('SELECT * FROM JourneyUpdates WHERE update_id = $1', [update_id]);

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        journeyUpdate: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Journey update not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Delete Journey Update
exports.deleteJourneyUpdate = async (req, res) => {
  const update_id = req.params.update_id;

  try {
    // Fetch current journey update record
    const updateResult = await db.query('SELECT * FROM JourneyUpdates WHERE update_id = $1', [update_id]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Journey update not found'
      });
    }

    // Perform the delete operation
    const deleteResult = await db.query('DELETE FROM JourneyUpdates WHERE update_id = $1', [update_id]);

    if (deleteResult.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Journey update deleted successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete journey update'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};
