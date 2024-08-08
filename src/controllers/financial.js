const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY)
const db = require('../db');

exports.payment = async (req, res) => {
  try {
    const {
      stripeEmail,
      // stripeToken,
      amount,
      productName,
      userId,
      bookingId,
      paymentType,
      name,
      addressLine1,
      postalCode,
      city,
      state,
      country,
    } = req.body;

    // Create a new customer
    const customer = await stripe.customers.create({
      email: stripeEmail,
      source: req.body.stripeToken,
      name: name,
      address: {
        line1: addressLine1,
        postal_code: postalCode,
        city: city,
        state: state,
        country: country,
      },
    });

    // Create a charge for the customer
    const charge = await stripe.charges.create({
      amount: amount * 100, // Stripe works with the smallest currency unit
      description: productName,
      currency: 'USD',
      customer: customer.id,
    });

    // Save the transaction to the database
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const insertStripeTransactionQuery = `
        INSERT INTO stripe_transactions (user_id, stripe_id, bal_id, amount, url, email, customer_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
      `;
      const stripeTransactionValues = [
        userId,
        charge.id,
        charge.balance_transaction,
        charge.amount,
        charge.receipt_url,
        charge.billing_details.email,
        customer.id,
      ];
      const stripeTransactionResult = await client.query(insertStripeTransactionQuery, stripeTransactionValues);
      const transactionId = stripeTransactionResult.rows[0].id;

      const insertFinancialTransactionQuery = `
        INSERT INTO FinancialTransactions (booking_id, user_id, transaction_id, amount, payment_type)
        VALUES ($1, $2, $3, $4, $5);
      `;
      const financialTransactionValues = [
        bookingId,
        userId,
        transactionId,
        charge.amount,
        paymentType,
      ];
      await client.query(insertFinancialTransactionQuery, financialTransactionValues);

      await client.query('COMMIT');

      res.redirect("/success");
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction failed', error);
      res.redirect("/failure");
    } finally {
      client.release();
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/failure");
  }
};


// Create a new financial transaction
// exports.createFinancialTransaction = async (req, res) => {
//   const { booking_id, user_id, amount, transaction_type, payment_method } = req.body;

//   try {
//     const result = await db.query(
//       'INSERT INTO FinancialTransactions (booking_id, user_id, amount, transaction_type, payment_method) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//       [booking_id, user_id, amount, transaction_type, payment_method]
//     );

//     if (result.rowCount === 1) {
//       return res.status(201).json({
//         success: true,
//         message: 'Financial transaction created successfully',
//         transaction: result.rows[0]
//       });
//     } else {
//       return res.status(500).json({
//         success: false,
//         error: 'Failed to create financial transaction'
//       });
//     }
//   } catch (error) {
//     console.error(error.message);
//     return res.status(500).json({
//       error: error.message
//     });
//   }
// };

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
