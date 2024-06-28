const db = require('../db');

// Create a new booking
exports.createBooking = async (req, res) => {
  const {
    car_id,
    renter_id,
    booking_start,
    booking_end,
    status = 'Pending',  // Default to 'Pending' if not provided
    total_price
  } = req.body;

  if (!['Approved', 'Cancelled', 'Pending'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status value'
    });
  }

  try {
    // Insert booking record into the database
    const result = await db.query(
      'INSERT INTO Bookings(car_id, renter_id, booking_start, booking_end, status, total_price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [car_id, renter_id, booking_start, booking_end, status, total_price]
    );

    // Check if the insertion was successful
    if (result.rowCount === 1) {
      return res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking: result.rows[0] // Return the created booking record
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to create booking'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get a booking by ID
exports.getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM Bookings WHERE booking_id = $1',
      [id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        booking: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Bookings');

    return res.status(200).json({
      success: true,
      bookings: result.rows
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Approve a booking
exports.approveBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'UPDATE Bookings SET status = $1 WHERE booking_id = $2 RETURNING *',
      ['Approved', id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Booking approved successfully',
        booking: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'UPDATE Bookings SET status = $1 WHERE booking_id = $2 RETURNING *',
      ['Cancelled', id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        booking: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM Bookings WHERE booking_id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Booking deleted successfully'
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};




// Check availability of cars for a specified interval

// exports.checkCarAvailability = async (req, res) => {
//   const { start_date, end_date, model } = req.query;

//   // Validate input dates
//   if (!start_date || !end_date) {
//     return res.status(400).json({
//       success: false,
//       error: 'Start date and end date are required'
//     });
//   }

//   try {
//     let query = `
//       SELECT * FROM Cars 
//       WHERE car_id NOT IN (
//         SELECT car_id FROM Bookings 
//         WHERE 
//           (booking_start <= $1 AND booking_end >= $1) OR 
//           (booking_start <= $2 AND booking_end >= $2) OR
//           (booking_start >= $1 AND booking_end <= $2)
//       )`;
//     let queryParams = [start_date, end_date];

//     if (model) {
//       query += ` AND model = $3`;
//       queryParams.push(model);
//     }

//     const result = await db.query(query, queryParams);

//     return res.status(200).json({
//       success: true,
//       availableCars: result.rows
//     });
//   } catch (error) {
//     console.error(error.message);
//     return res.status(500).json({
//       error: error.message
//     });
//   }
// };

exports.checkCarAvailability = async (req, res) => {
  const { start_date, end_date, model } = req.query;

  // Validate input dates
  if (!start_date || !end_date) {
    return res.status(400).json({
      success: false,
      error: 'Start date and end date are required'
    });
  }

  try {
    let query = `
      SELECT * FROM Cars 
      WHERE car_id NOT IN (
        SELECT car_id FROM Bookings 
        WHERE 
          (booking_start <= $1 AND booking_end >= $1) OR 
          (booking_start <= $2 AND booking_end >= $2) OR
          (booking_start >= $1 AND booking_end <= $2)
      )
      AND status = 'Approved'`; // Only consider cars that are approved

    let queryParams = [start_date, end_date];

    if (model) {
      query += ` AND model = $3`;
      queryParams.push(model);
    }

    const result = await db.query(query, queryParams);

    return res.status(200).json({
      success: true,
      availableCars: result.rows
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

