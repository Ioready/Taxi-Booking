const db = require('../db');

// Create a new subscription package
exports.createSubscriptionPackage = async (req, res) => {
  const { name, duration, discount_percentage, price } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO SubscriptionPackages (name, duration, discount_percentage, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, duration, discount_percentage, price]
    );

    if (result.rowCount === 1) {
      return res.status(201).json({
        success: true,
        message: 'Subscription package created successfully',
        package: result.rows[0]
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to create subscription package'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get a subscription package by ID
exports.getSubscriptionPackageById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM SubscriptionPackages WHERE package_id = $1',
      [id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        package: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Subscription package not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get all subscription packages
exports.getAllSubscriptionPackages = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM SubscriptionPackages');

    return res.status(200).json({
      success: true,
      packages: result.rows
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Update a subscription package
exports.updateSubscriptionPackage = async (req, res) => {
  const { id } = req.params;
  const { name, duration, discount_percentage, price } = req.body;

  try {
    const result = await db.query(
      'UPDATE SubscriptionPackages SET name = $1, duration = $2, discount_percentage = $3, price = $4 WHERE package_id = $5 RETURNING *',
      [name, duration, discount_percentage, price, id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Subscription package updated successfully',
        package: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Subscription package not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Delete a subscription package
exports.deleteSubscriptionPackage = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM SubscriptionPackages WHERE package_id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Subscription package deleted successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Subscription package not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};
