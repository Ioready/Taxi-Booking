const { Router } = require("express");
const { config } = require("dotenv");
config();


// ************* Start :: File Uploader **************

const multer = require("multer");
const fs = require('fs');
const path = require('path');
const { createCar, getCars, updateCar, deleteCar, getCarById } = require("../controllers/car");

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/car');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// ************* End :: File Uploader **************


const router = Router();


router.post("/create", upload.array('images', 5), createCar);
router.put("/update/:car_id", upload.array('images', 5), updateCar);
router.get("/getById/:car_id", getCarById);
router.get("/getall", getCars);
router.delete("/delete/:car_id", deleteCar)


module.exports = router;
