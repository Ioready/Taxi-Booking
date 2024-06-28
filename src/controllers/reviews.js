const db = require('../db');

// Create Review
exports.createReview = async (req, res) => {
  const {
    user_id,
    booking_id,
    car_id,
    rating,
    review_text
  } = req.body;

  try {
    // Insert review record into the database
    const result = await db.query(
      'INSERT INTO reviews(user_id, booking_id, car_id, rating, review_text) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, booking_id, car_id, rating, review_text]
    );

    // Check if the insertion was successful
    if (result.rowCount === 1) {
      return res.status(201).json({
        success: true,
        message: 'Review created successfully',
        review: result.rows[0] // Return the created review
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to create review'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Update Review
exports.updateReview = async (req, res) => {
  const review_id = req.params.review_id;
  const {
    user_id,
    booking_id,
    car_id,
    rating,
    review_text
  } = req.body;

  try {
    // Fetch current review record
    const reviewResult = await db.query('SELECT * FROM reviews WHERE review_id = $1', [review_id]);

    if (reviewResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const currentReview = reviewResult.rows[0];

    // Update parameters with current values if empty
    const updatedUserId = user_id || currentReview.user_id;
    const updatedBookingId = booking_id || currentReview.booking_id;
    const updatedCarId = car_id || currentReview.car_id;
    const updatedRating = rating || currentReview.rating;
    const updatedReviewText = review_text || currentReview.review_text;

    // Perform the update operation
    const result = await db.query(
      'UPDATE reviews SET user_id = $1, booking_id = $2, car_id = $3, rating = $4, review_text = $5 WHERE review_id = $6 RETURNING *',
      [updatedUserId, updatedBookingId, updatedCarId, updatedRating, updatedReviewText, review_id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        review: result.rows[0]
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to update review'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get All Reviews
exports.getReviews = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM reviews');
    return res.status(200).json({
      success: true,
      reviews: result.rows
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get Review By ID
exports.getReviewById = async (req, res) => {
  const review_id = req.params.review_id;

  try {
    // Fetch review record by ID
    const result = await db.query('SELECT * FROM reviews WHERE review_id = $1', [review_id]);

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        review: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  const review_id = req.params.review_id;

  try {
    // Fetch current review record
    const reviewResult = await db.query('SELECT * FROM reviews WHERE review_id = $1', [review_id]);

    if (reviewResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Perform the delete operation
    const deleteResult = await db.query('DELETE FROM reviews WHERE review_id = $1', [review_id]);

    if (deleteResult.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete review'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};
