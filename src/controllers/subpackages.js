const db = require('../db');

// Create a new subscription package
exports.createSubscriptionPackage = async (req, res) => {
  const { name, duration, price, no_of_cars, description, features, type, tax_name, tax_percentage } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO SubscriptionPackages (name, duration, price, no_of_cars, description, features, type, tax_name, tax_percentage) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [name, duration, price, no_of_cars, description, features, type, tax_name, tax_percentage]
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
  const { name, duration, price, no_of_cars, description, features, type, tax_name, tax_percentage } = req.body;

  try {
    const result = await db.query(
      'UPDATE SubscriptionPackages SET name = $1, duration = $2, price = $3, no_of_cars = $4, description = $5, features = $6, type = $7, tax_name = $8, tax_percentage = $9 WHERE package_id = $10 RETURNING *',
      [name, duration, price, no_of_cars, description, features, type, tax_name, tax_percentage, id]
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
