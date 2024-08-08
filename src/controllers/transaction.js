const stripe = require('stripe')('your_stripe_secret_key');
const db = require('../db');

const payment = async (req, res) => {
  try {
    const {
      stripeEmail,
      stripeToken,
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
      source: stripeToken,
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

module.exports = {
  payment,
};
