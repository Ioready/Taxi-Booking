const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY)
const db = require('../db');

// Create a new user subscription
exports.payForSubscription = async (req, res) => {
  const { user_id, package_id, email } = req.body;

  try {
    // Fetch the subscription package details from the database
    const packageResult = await db.query(
      'SELECT * FROM SubscriptionPackages WHERE package_id = $1',
      [package_id]
    );

    if (packageResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription package not found'
      });
    }

    const subscriptionPackage = packageResult.rows[0];
    const { price_id, duration } = subscriptionPackage;

    
    // Create a Checkout Session in Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: price_id, // Use the price ID for the subscription
        quantity: 1,
      }],
      mode: 'subscription', // Set mode to 'subscription' for recurring payments
      success_url: `https://www.bistekrentals.com/host_dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.bistekrentals.com/host_dashboard/cancel`,
      customer_email: email, // Optional: Pre-fill the email address for the customer
      subscription_data: {
        metadata: {
          user_id: user_id, // Store user ID for future reference
          package_id: package_id // Store package ID for future reference
        }
      }
    });
    let endDate = calculateEndDate(new Date(), duration)
    // console.log(calculateEndDate(duration))
    // Insert the subscription details into the database
    await db.query(
      'INSERT INTO UserSubscriptions (user_id, package_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5)',
      [
        user_id,
        package_id,
        new Date(), // Set start date to current time
        endDate, // Calculate end date based on the duration
        'pending' // Status is 'pending' until payment confirmation
      ]
    );
    // console.log(subscriptionPackage,session, 'db query', calculateEndDate(duration) )

    return res.status(200).json({
      success: true,
      checkoutUrl: session.url, // Send the checkout URL to the client
      sessionId: session.id // Send the session ID to the client
    });
  } catch (error) {
    console.error('Error processing payment:', error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Helper function to calculate end date based on duration
// function calculateEndDate(duration) {
//   const startDate = new Date();
//   let endDate;

//   switch (duration) {
//     case 'month':
//       endDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
//       break;
//     case 'year':
//       endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
//       break;
//     default:
//       endDate = startDate;
//   }

//   return endDate;
// }

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

// Update status
exports.updateSubscriptionStatus = async (req, res) => {
  const { subscription_id, status } = req.body;

  // List of valid status values
  const validStatuses = ['active', 'expired', 'cancelled', 'pending'];

  // Check if the provided status is valid
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status value. Valid statuses are: active, expired, cancelled, pending.'
    });
  }

  try {
    // Start a transaction
    await db.query('BEGIN');

    // Update the subscription status in the database
    const result = await db.query(
      'UPDATE UserSubscriptions SET status = $1 WHERE subscription_id = $2 RETURNING user_id, status',
      [status, subscription_id]
    );

    if (result.rowCount === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    const { user_id, status: updatedStatus } = result.rows[0];

    // Determine the value for is_subscribed based on the status
    const isSubscribed = updatedStatus === 'active';

    // Update the is_subscribed field in the Users table
    await db.query(
      'UPDATE Users SET is_subscribed = $1 WHERE user_id = $2',
      [isSubscribed, user_id]
    );

    // Commit the transaction
    await db.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Subscription status and user subscription status updated successfully',
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    await db.query('ROLLBACK');
    return res.status(500).json({
      success: false,
      error: 'An error occurred while updating the subscription status. Please try again later.'
    });
  }
};




function calculateEndDate(startDate, duration) {
  const endDate = new Date(startDate);

  switch (duration) {
    case 'month':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'year':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      endDate = startDate; // Default to start date for unknown durations
  }

  return endDate;
}

// Controller to handle subscription update or renewal
exports.updateOrRenewSubscription = async (req, res) => {
  const { user_id, package_id, email } = req.body;

  try {
    // Fetch the subscription package details from the database
    const packageResult = await db.query(
      'SELECT * FROM SubscriptionPackages WHERE package_id = $1',
      [package_id]
    );

    if (packageResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription package not found'
      });
    }

    const subscriptionPackage = packageResult.rows[0];
    const { price_id, duration } = subscriptionPackage;

    // Fetch the current active subscription for the user
    const currentSubscriptionResult = await db.query(
      'SELECT * FROM UserSubscriptions WHERE user_id = $1 AND package_id = $2 AND status = $3',
      [user_id, package_id, 'active']
    );

    let newStartDate = new Date();
    let newEndDate;

    if (currentSubscriptionResult.rowCount > 0) {
      // Existing active subscription found, update it
      const currentSubscription = currentSubscriptionResult.rows[0];
      newStartDate = new Date(); // Set the new start date to current date
      newEndDate = calculateEndDate(newStartDate, duration);

      // Create a new Checkout Session for the renewal
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: price_id, // Use the price ID for the subscription
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cancel`,
        customer_email: email,
        subscription_data: {
          metadata: {
            user_id: user_id,
            package_id: package_id
          }
        }
      });

      // Update the existing subscription record in the database
      await db.query(
        'UPDATE UserSubscriptions SET stripe_subscription_id = $1, start_date = $2, end_date = $3 WHERE user_id = $4 AND package_id = $5 AND status = $6',
        [session.id, newStartDate, newEndDate, user_id, package_id, 'active']
      );

      return res.status(200).json({
        success: true,
        sessionId: session.id // Send the session ID to the client
      });
    } else {
      // No active subscription found, create a new subscription record
      newEndDate = calculateEndDate(newStartDate, duration);

      // Create a new Checkout Session for the new subscription
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: price_id,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cancel`,
        customer_email: email,
        subscription_data: {
          metadata: {
            user_id: user_id,
            package_id: package_id
          }
        }
      });

      // Insert new subscription record into the database
      await db.query(
        'INSERT INTO UserSubscriptions (user_id, package_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5)',
        [user_id, package_id, newStartDate, newEndDate, 'pending'] // Status is 'pending' until payment confirmation
      );

      return res.status(200).json({
        success: true,
        sessionId: session.id // Send the session ID to the client
      });
    }
  } catch (error) {
    console.error('Error updating or renewing subscription:', error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// console.log(calculateEndDate('2025-06-17','month'))
// console.log(calculateEndDate('2025-06-17','year'))
