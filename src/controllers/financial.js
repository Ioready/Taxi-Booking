const db = require('../db');

// Create a new financial transaction
exports.createFinancialTransaction = async (req, res) => {
  const { booking_id, user_id, amount, transaction_type, payment_method } = req.body;

  try {
    const result = await db.query(
      'INSERT INTO FinancialTransactions (booking_id, user_id, amount, transaction_type, payment_method) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [booking_id, user_id, amount, transaction_type, payment_method]
    );

    if (result.rowCount === 1) {
      return res.status(201).json({
        success: true,
        message: 'Financial transaction created successfully',
        transaction: result.rows[0]
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to create financial transaction'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get a financial transaction by ID
exports.getFinancialTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM FinancialTransactions WHERE transaction_id = $1',
      [id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        transaction: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Financial transaction not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get all financial transactions
exports.getAllFinancialTransactions = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM FinancialTransactions');

    return res.status(200).json({
      success: true,
      transactions: result.rows
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Update a financial transaction
exports.updateFinancialTransaction = async (req, res) => {
  const { id } = req.params;
  const { booking_id, user_id, amount, transaction_type, payment_method } = req.body;

  try {
    const result = await db.query(
      'UPDATE FinancialTransactions SET booking_id = $1, user_id = $2, amount = $3, transaction_type = $4, payment_method = $5 WHERE transaction_id = $6 RETURNING *',
      [booking_id, user_id, amount, transaction_type, payment_method, id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Financial transaction updated successfully',
        transaction: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Financial transaction not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Delete a financial transaction
exports.deleteFinancialTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM FinancialTransactions WHERE transaction_id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Financial transaction deleted successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Financial transaction not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};
