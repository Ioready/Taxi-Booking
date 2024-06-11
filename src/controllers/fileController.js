const multer = require('multer');
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

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Handle file upload
const uploadFile = (req, res) => {
    res.status(200).json({
        message: 'File uploaded successfully',
        file: req.file
    });
};

// List files in the uploads directory
const listFiles = (req, res) => {
    fs.readdir('uploads/', (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory' });
        }
        res.status(200).json({ files });
    });
};

// Retrieve a specific file
const getFile = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join('uploads', filename);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.sendFile(path.resolve(filePath));
    });
};

module.exports = {
    upload,
    uploadFile,
    listFiles,
    getFile
};
