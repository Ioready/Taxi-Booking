const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY)
const db = require('../db');


// Create a new subscription package
exports.createSubscriptionPackage = async (req, res) => {
  const {
    name,
    duration, // e.g., "month", "year"
    price,
    no_of_cars,
    description,
    features,
    type,
    tax_name,
    tax_percentage,
  } = req.body;

  try {
    // Create a product in Stripe
    const product = await stripe.products.create({
      name: name,
      description: description || '',
    });

    // Create a price in Stripe
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100), // Convert dollars to cents
      currency: 'usd',
      recurring: { interval: duration }, // Use the duration field for interval
      product: product.id,
    });

    // Insert into the PostgreSQL database
    const result = await db.query(
      'INSERT INTO SubscriptionPackages (name, duration, price, no_of_cars, description, features, type, tax_name, tax_percentage, product_id, price_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [name, duration, price, no_of_cars, description, features, type, tax_name, tax_percentage, product.id, stripePrice.id]
    );

    console.log(stripePrice)

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
    console.error('Error creating subscription package:', error.message);
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
  const {
    name,
    duration, // e.g., "month", "year"
    price,
    no_of_cars,
    description,
    features,
    type,
    tax_name,
    tax_percentage,
    status // e.g., "active", "inactive"
  } = req.body;

  try {
    // Fetch the current subscription package details
    const packageResult = await db.query(
      'SELECT * FROM SubscriptionPackages WHERE package_id = $1',
      [id]
    );

    if (packageResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription package not found'
      });
    }

    const subscriptionPackage = packageResult.rows[0];
    const { product_id, price_id } = subscriptionPackage;

    // Update product and price in Stripe if necessary
    if (name || description || price || duration) {
      if (price_id) {
        await stripe.prices.update(price_id, {
          unit_amount: Math.round(price * 100), // Convert dollars to cents
          recurring: { interval: duration }, // Use the duration field for interval
        });
      }

      if (product_id) {
        await stripe.products.update(product_id, {
          name: name || subscriptionPackage.name,
          description: description || subscriptionPackage.description,
        });
      }
    }

    // Update the subscription package in the database
    const updateResult = await db.query(
      'UPDATE SubscriptionPackages SET name = $1, duration = $2, price = $3, no_of_cars = $4, description = $5, features = $6, type = $7, tax_name = $8, tax_percentage = $9, status = $10 WHERE package_id = $11 RETURNING *',
      [name || subscriptionPackage.name, duration || subscriptionPackage.duration, price || subscriptionPackage.price, no_of_cars || subscriptionPackage.no_of_cars, description || subscriptionPackage.description, features || subscriptionPackage.features, type || subscriptionPackage.type, tax_name || subscriptionPackage.tax_name, tax_percentage || subscriptionPackage.tax_percentage, status || subscriptionPackage.status, package_id]
    );

    if (updateResult.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Subscription package updated successfully',
        package: updateResult.rows[0]
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to update subscription package'
      });
    }
  } catch (error) {
    console.error('Error updating subscription package:', error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};


// Update a subscription package
// exports.updateSubscriptionPackage = async (req, res) => {
//   const { package_id } = req.params;
//   const {
//     name,
//     duration, // e.g., "month", "year"
//     price,
//     no_of_cars,
//     description,
//     features,
//     type,
//     tax_name,
//     tax_percentage,
//     status // e.g., "active", "inactive"
//   } = req.body;

//   try {
//     // Fetch the current subscription package details
//     const packageResult = await db.query(
//       'SELECT * FROM SubscriptionPackages WHERE package_id = $1',
//       [package_id]
//     );

//     if (packageResult.rowCount === 0) {
//       return res.status(404).json({
//         success: false,
//         error: 'Subscription package not found'
//       });
//     }

//     const subscriptionPackage = packageResult.rows[0];
//     const { product_id, price_id } = subscriptionPackage;

//     // Update product and price in Stripe if necessary
//     if (name || description || price || duration) {
//       if (price_id) {
//         await stripe.prices.update(price_id, {
//           unit_amount: Math.round(price * 100), // Convert dollars to cents
//           recurring: { interval: duration }, // Use the duration field for interval
//         });
//       }

//       if (product_id) {
//         await stripe.products.update(product_id, {
//           name: name || subscriptionPackage.name,
//           description: description || subscriptionPackage.description,
//         });
//       }
//     }

//     // Update the subscription package in the database
//     const updateResult = await db.query(
//       'UPDATE SubscriptionPackages SET name = $1, duration = $2, price = $3, no_of_cars = $4, description = $5, features = $6, type = $7, tax_name = $8, tax_percentage = $9, status = $10 WHERE package_id = $11 RETURNING *',
//       [name || subscriptionPackage.name, duration || subscriptionPackage.duration, price || subscriptionPackage.price, no_of_cars || subscriptionPackage.no_of_cars, description || subscriptionPackage.description, features || subscriptionPackage.features, type || subscriptionPackage.type, tax_name || subscriptionPackage.tax_name, tax_percentage || subscriptionPackage.tax_percentage, status || subscriptionPackage.status, package_id]
//     );

//     if (updateResult.rowCount === 1) {
//       return res.status(200).json({
//         success: true,
//         message: 'Subscription package updated successfully',
//         package: updateResult.rows[0]
//       });
//     } else {
//       return res.status(500).json({
//         success: false,
//         error: 'Failed to update subscription package'
//       });
//     }
//   } catch (error) {
//     console.error('Error updating subscription package:', error.message);
//     return res.status(500).json({
//       error: error.message
//     });
//   }
// };


// Delete a subscription package
exports.deleteSubscriptionPackage = async (req, res) => {
  const { id } = req.params;
  // console.log(id)

  try {
    // Fetch the subscription package from the database
    const packageResult = await db.query(
      'SELECT * FROM SubscriptionPackages WHERE package_id = $1',
      [id]
    );

    // console.log(packageResult)

    if (packageResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription package not found'
      });
    }



    const subscriptionPackage = packageResult.rows[0];
    const { product_id, price_id } = subscriptionPackage;

    // Fetch active subscriptions associated with this package
    // const subscriptionResult = await db.query(
    //   'SELECT stripe_subscription_id FROM UserSubscriptions WHERE package_id = $1 AND status = $2',
    //   [id, 'active']
    // );

    // if (subscriptionResult.rowCount > 0) {
    //   // Cancel active subscriptions in Stripe
    //   for (const { stripe_subscription_id } of subscriptionResult.rows) {
    //     await stripe.subscriptions.update(stripe_subscription_id, {
    //       cancel_at_period_end: true,
    //     });
    //   }

    //   // Optionally, notify users about the cancellation or transition
    //   // e.g., send an email or notification
    // }

    // Delete the price and product from Stripe
    if (price_id) {
      await stripe.prices.del(price_id);
    }

    if (product_id) {
      await stripe.products.del(product_id);
    }

    // Delete the subscription package from the database
    await db.query(
      'DELETE FROM SubscriptionPackages WHERE package_id = $1',
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Subscription package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscription package:', error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};