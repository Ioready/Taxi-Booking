const { Router } = require("express");
const {
  getUsers,
  login,
  protected,
  logout,
  registerHost,
  registerRenter,
  getUserById,
  getUserByToken,
  loginRole,
  getRenters,
  getHosts,
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

router.get("/get-renters", getRenters);
router.get("/get-hosts", getHosts);
router.get("/get-users/:id", getUserById);
router.get("/protected", userAuth, protected);

//                Users Registration 

// HOST
// router.post("/register_host", upload.single('profile_picture') , registerValidation, validationMiddleware, registerHost);
router.post("/register_host", upload.fields([
  { name: 'profile_picture', maxCount: 1 },
  { name: 'licence_picture', maxCount: 1 }
]), registerValidation, validationMiddleware, registerHost);



// Client
router.post("/register_renter", upload.fields([
  { name: 'profile_picture', maxCount: 1 },
  { name: 'licence_picture', maxCount: 1 }]) , registerValidation, validationMiddleware, registerRenter);

router.post("/login", loginValidation, validationMiddleware, login);
router.post("/role_login", loginRole);
router.get("/logout", logout);
router.post("/token", getUserByToken);

module.exports = router;
