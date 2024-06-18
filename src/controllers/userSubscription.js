const db = require('../db');

// Create a new user subscription
exports.createUserSubscription = async (req, res) => {
  const { user_id, package_id, start_date, end_date, status = 'active' } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO UserSubscriptions (user_id, package_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, package_id, start_date, end_date, status]
    );

    if (result.rowCount === 1) {
      return res.status(201).json({
        success: true,
        message: 'User subscription created successfully',
        subscription: result.rows[0]
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to create user subscription'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get a user subscription by ID
exports.getUserSubscriptionById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM UserSubscriptions WHERE subscription_id = $1',
      [id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        subscription: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'User subscription not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get all user subscriptions
exports.getAllUserSubscriptions = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM UserSubscriptions');

    return res.status(200).json({
      success: true,
      subscriptions: result.rows
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Update a user subscription
exports.updateUserSubscription = async (req, res) => {
  const { id } = req.params;
  const { user_id, package_id, start_date, end_date, status } = req.body;

  try {
    const result = await db.query(
      'UPDATE UserSubscriptions SET user_id = $1, package_id = $2, start_date = $3, end_date = $4, status = $5 WHERE subscription_id = $6 RETURNING *',
      [user_id, package_id, start_date, end_date, status, id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'User subscription updated successfully',
        subscription: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'User subscription not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Delete a user subscription
exports.deleteUserSubscription = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM UserSubscriptions WHERE subscription_id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'User subscription deleted successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'User subscription not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};
