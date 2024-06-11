const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { registerHost } = require('../controllers/auth');

// Route for file upload
router.post('/upload', fileController.upload.single('file'), fileController.uploadFile);

router.post('/register', fileController.upload.single('profile_picture'), registerHost)
// Route to list all files
router.get('/list', fileController.listFiles);

// Route to retrieve a specific file
router.get('/get/:filename', fileController.getFile);

module.exports = router;
 