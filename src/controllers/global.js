const db = require('../db');
const fs = require('fs');
const path = require('path');


// Create Global with Image Upload
exports.createGlobal = [
  async (req, res) => {
    const { title, status } = req.body;
    let img_url = null;

    try {
      // Handle image URL if uploaded
      if (req.file) {
        const domain = process.env.DOMAIN;
        img_url = `${domain}/uploads/global/${req.file.filename}`;
      }

      // Insert global record into the database
      const result = await db.query(
        'INSERT INTO global (title, img_url, status) VALUES ($1, $2, $3) RETURNING *',
        [title, img_url, status || 'active']  // Default status to 'active'
      );

      if (result.rowCount === 1) {
        return res.status(201).json({
          success: true,
          message: 'Global record created successfully',
          global: result.rows[0]
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Failed to create global record'
        });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        error: error.message
      });
    }
  }
];

// Update Global with Image Upload
exports.updateGlobal = [
  async (req, res) => {
    const global_id = req.params.global_id;
    const { title, status } = req.body;
    let img_url = null;

    try {
      // Fetch current global record
      const globalResult = await db.query('SELECT * FROM global WHERE id = $1', [global_id]);

      if (globalResult.rowCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Global record not found'
        });
      }

      const currentGlobal = globalResult.rows[0];

      // Update parameters with current values if empty
      const updatedTitle = title || currentGlobal.title;
      img_url = req.file ? `${process.env.DOMAIN}/uploads/global/${req.file.filename}` : currentGlobal.img_url;
      const updatedStatus = status || currentGlobal.status;

      // Perform the update operation
      const result = await db.query(
        'UPDATE global SET title = $1, img_url = $2, status = $3 WHERE id = $4 RETURNING *',
        [updatedTitle, img_url, updatedStatus, global_id]
      );

      if (result.rowCount === 1) {
        return res.status(200).json({
          success: true,
          message: 'Global record updated successfully',
          global: result.rows[0]
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Failed to update global record'
        });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        error: error.message
      });
    }
  }
];

// Delete Global
exports.deleteGlobal = async (req, res) => {
  const global_id = req.params.global_id;

  try {
    // Fetch current global record
    const globalResult = await db.query('SELECT * FROM global WHERE id = $1', [global_id]);

    if (globalResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Global record not found'
      });
    }

    const global = globalResult.rows[0];
    const img_url = global.img_url;

    // Perform the delete operation
    const deleteResult = await db.query('DELETE FROM global WHERE id = $1', [global_id]);

    if (deleteResult.rowCount === 1) {
      // Delete associated image file from the filesystem if it exists
      if (img_url) {
        const imagePath = img_url.replace(`${process.env.DOMAIN}/uploads/global/`, 'uploads/global/');
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${imagePath}`, err);
          } else {
            console.log(`File deleted: ${imagePath}`);
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Global record deleted successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete global record'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};