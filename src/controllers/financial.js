const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY)
const db = require('../db');

exports.payment = async (req, res) => {
  try {
      console.log(req.body);

      // Create a Checkout Session
      const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
              {
                  price_data: {
                      currency: 'usd',
                      product_data: {
                          name: req.body.productName || 'Car Booking',
                      },
                      unit_amount: req.body.amount, // Amount in the smallest currency unit
                  },
                  quantity: 1,
              }
          ],
          mode: 'payment',
          success_url: 'https://projectx-rho-ashen.vercel.app/user_dashboard/home/booking_successful?session_id={CHECKOUT_SESSION_ID}', // Pass session_id in the success URL
          cancel_url: 'https://projectx-rho-ashen.vercel.app/user_dashboard/home/booking_cancel',
          customer_email: req.body.stripeEmail,
          payment_intent_data: {
              application_fee_amount: 400, // Application fee amount in cents
              transfer_data: {
                  destination: 'acct_1PcSG2RumABdDmB0', // Connected account to receive funds
              }
          }
      });

      console.log(session)

      // Insert the transaction data into the database
      const query = `
          INSERT INTO FinancialTransactions (
              booking_id,
              user_id,
              amount,
              payment_type,
              stripe_session_id,
              stripe_payment_intent_id,
              currency,
              application_fee_amount,
              transfer_destination,
              status,
              customer_email
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;

      const values = [
          req.body.bookingId, // Assuming bookingId is passed in req.body
          req.body.userId, // Assuming userId is passed in req.body
          req.body.amount,
          'Booking', // Assuming payment type is always 'Booking' for this scenario
          session.id,
          session.payment_intent,
          'usd', // Currency hard-coded as USD
          300, // Application fee hard-coded as 300 cents
          'acct_1PcSG2RumABdDmB0', // Destination account hard-coded
          'pending', // Initial status set to 'pending'
          req.body.stripeEmail
      ];

      await db.query(query, values); // Assuming you have a db connection object to execute queries

      res.json({ url: session.url });
  } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.success = async (req, res) => {
  try {
      const sessionId = req.query.session_id; // Assuming the session_id is passed as a query parameter

      // Update the FinancialTransactions record with the successful payment details
      const query = `
          UPDATE FinancialTransactions
          SET status = $1, updated_at = NOW()
          WHERE stripe_session_id = $2
      `;

      const values = [
          'completed',  // Update the status to 'completed'
          sessionId     // Match the Stripe session ID to update the correct record
      ];

      await db.query(query, values); // Assuming you have a db connection object to execute queries

      return res.status(200).json({
        success: true
      });
  } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getFinancialTransactionByUserId = async (req, res) => {
  const { id } = req.params;
  // console.log(req, id)

  try {
    const result = await db.query(
      'SELECT * FROM FinancialTransactions WHERE user_id = $1',
      [id]
    );

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

exports.getFinancialTransactionByUserBookingId = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM FinancialTransactions WHERE booking_id = $1',
      [id]
    );

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
