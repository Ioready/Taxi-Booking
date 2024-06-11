const db = require('../db');
const fs = require('fs');
const path = require('path');

// Create
exports.createCar = async (req, res) => {
  const {
    owner_id,
    model,
    year,
    registration_number,
    availability,
    daily_rate
  } = req.body;

  try {
    // Extract file paths of uploaded images
    let images = '';
    if (req.files && req.files.length > 0) {
        // Construct file address with domain from environment variable
        const domain = process.env.DOMAIN;
        images = req.files.map(file => `${domain}/uploads/car/${file.filename}`);
      }

    // Insert car record into the database
    const result = await db.query(
      'INSERT INTO Cars(owner_id, images, model, year, registration_number, availability, daily_rate) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [owner_id, images, model, year, registration_number, availability, daily_rate]
    );

    // Check if the insertion was successful
    if (result.rowCount === 1) {
      return res.status(201).json({
        success: true,
        message: 'Car record created successfully',
        car: result.rows[0] // Return the created car record
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


// Update 
exports.updateCar = async (req, res) => {
    const car_id = req.params.car_id;
    console.log(car_id)
    const {
      owner_id,
      model,
      year,
      registration_number,
      availability,
      daily_rate
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
  
      // Extract file paths of uploaded images
      let images = currentCar.images; // Initialize with current images
      if (req.files && req.files.length > 0) {
        // Construct file address with domain from environment variable
        const domain = process.env.DOMAIN ;
        images = req.files.map(file => `${domain}/uploads/car/${file.filename}`);
      }
  
      // Perform the update operation
      const result = await db.query(
        'UPDATE Cars SET owner_id = $1, images = $2, model = $3, year = $4, registration_number = $5, availability = $6, daily_rate = $7 WHERE car_id = $8 RETURNING *',
        [updatedOwnerId, images, updatedModel, updatedYear, updatedRegistrationNumber, updatedAvailability, updatedDailyRate, car_id]
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


// Get All
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


//Get By Id
 exports.getCarById = async (req, res) => {
    const car_id = req.params.car_id;
  
    try {
      // Fetch car record by ID
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
          // Remove domain part from the image path
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