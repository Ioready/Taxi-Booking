const { Router } = require("express");
const {
  getUsers,
  login,
  protected,
  logout,
  registerHost,
  registerRenter,
} = require("../controllers/auth");
const {
  validationMiddleware,
} = require("../middlewares/validations-middleware");
const { registerValidation, loginValidation } = require("../validators/auth");
const { userAuth } = require("../middlewares/auth-middleware");



// ************* Start :: File Uploader **************

const { config } = require("dotenv");
config();

const multer = require("multer");
const fs = require('fs');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/user');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// ************* End :: File Uploader **************


const router = Router();

router.get("/get-users", getUsers);
router.get("/protected", userAuth, protected);

//                Users Registration 

// HOST
router.post("/register_host", upload.single('profile_picture') , registerValidation, validationMiddleware, registerHost);

// Client
router.post("/register_renter", upload.single('profile_picture') , registerValidation, validationMiddleware, registerRenter);

router.post("/login", loginValidation, validationMiddleware, login);
router.get("/logout", logout);

module.exports = router;
