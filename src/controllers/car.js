const db = require('../db');
const fs = require('fs');
const path = require('path');

// Create Car
exports.createCar = async (req, res) => {
  const {
    owner_id,
    model,
    year,
    registration_number,
    availability,
    daily_rate,
    no_of_seats,
    fuel,
    color,
    mileage,
    condition
  } = req.body;

  try {
    // Extract file paths of uploaded images
    let images = '';
    if (req.files && req.files.length > 0) {
      const domain = process.env.DOMAIN;
      images = req.files.map(file => `${domain}/uploads/car/${file.filename}`);
    }

    // Insert car record into the database
    const result = await db.query(
      'INSERT INTO Cars(owner_id, images, model, year, registration_number, availability, daily_rate, no_of_seats, fuel, color, mileage, condition) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [owner_id, images, model, year, registration_number, availability, daily_rate, no_of_seats, fuel, color, mileage, condition]
    );

    // Check if the insertion was successful
    if (result.rowCount === 1) {
      return res.status(201).json({
        success: true,
        message: 'Car record created successfully',
        car: result.rows[0]
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to create car record'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Update Car
exports.updateCar = async (req, res) => {
  const car_id = req.params.car_id;
  const {
    owner_id,
    model,
    year,
    registration_number,
    availability,
    daily_rate,
    no_of_seats,
    fuel,
    color,
    mileage,
    condition
  } = req.body;

  try {
    // Fetch current car record
    const carResult = await db.query('SELECT * FROM Cars WHERE car_id = $1', [car_id]);

    if (carResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Car record not found'
      });
    }

    const currentCar = carResult.rows[0];

    // Update parameters with current values if empty
    const updatedOwnerId = owner_id || currentCar.owner_id;
    const updatedModel = model || currentCar.model;
    const updatedYear = year || currentCar.year;
    const updatedRegistrationNumber = registration_number || currentCar.registration_number;
    const updatedAvailability = availability || currentCar.availability;
    const updatedDailyRate = daily_rate || currentCar.daily_rate;
    const updatedNoOfSeats = no_of_seats || currentCar.no_of_seats;
    const updatedFuel = fuel || currentCar.fuel;
    const updatedColor = color || currentCar.color;
    const updatedMileage = mileage || currentCar.mileage;
    const updatedCondition = condition || currentCar.condition;

    // Extract file paths of uploaded images
    let images = currentCar.images; // Initialize with current images
    if (req.files && req.files.length > 0) {
      const domain = process.env.DOMAIN;
      images = req.files.map(file => `${domain}/uploads/car/${file.filename}`);
    }

    // Perform the update operation
    const result = await db.query(
      'UPDATE Cars SET owner_id = $1, images = $2, model = $3, year = $4, registration_number = $5, availability = $6, daily_rate = $7, no_of_seats = $8, fuel = $9, color = $10, mileage = $11, condition = $12 WHERE car_id = $13 RETURNING *',
      [updatedOwnerId, images, updatedModel, updatedYear, updatedRegistrationNumber, updatedAvailability, updatedDailyRate, updatedNoOfSeats, updatedFuel, updatedColor, updatedMileage, updatedCondition, car_id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Car record updated successfully',
        car: result.rows[0]
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to update car record'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Approve Car
exports.approveCar = async (req, res) => {
  const car_id = req.params.car_id;

  try {
    const result = await db.query(
      'UPDATE Cars SET status = $1 WHERE car_id = $2 RETURNING *',
      ['Approved', car_id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        message: 'Car approved successfully',
        car: result.rows[0]
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to approve car'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get All Cars
exports.getCars = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Cars');
    return res.status(200).json({
      success: true,
      cars: result.rows
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get Car By ID
exports.getCarById = async (req, res) => {
  const car_id = req.params.car_id;

  try {
    const result = await db.query('SELECT * FROM Cars WHERE car_id = $1', [car_id]);

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        car: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Car record not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};

// Delete Car
exports.deleteCar = async (req, res) => {
  const car_id = req.params.car_id;

  try {
    // Fetch current car record
    const carResult = await db.query('SELECT * FROM Cars WHERE car_id = $1', [car_id]);

    if (carResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Car record not found'
      });
    }

    // Extract file paths of images associated with the car
    const car = carResult.rows[0];
    const images = car.images || [];

    // Perform the delete operation
    const deleteResult = await db.query('DELETE FROM Cars WHERE car_id = $1', [car_id]);

    if (deleteResult.rowCount === 1) {
      // Delete associated image files from the filesystem
      images.forEach(image => {
        const imagePath = image.replace(`${process.env.DOMAIN}/uploads/`, 'uploads/');
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${imagePath}`, err);
          } else {
            console.log(`File deleted: ${imagePath}`);
          }
        });
      });

      return res.status(200).json({
        success: true,
        message: 'Car record deleted successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete car record'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};
