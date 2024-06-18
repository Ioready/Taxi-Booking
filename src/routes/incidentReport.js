const { Router } = require("express");
const { config } = require("dotenv");
config();


// ************* Start :: File Uploader **************

const multer = require("multer");
const fs = require('fs');
const path = require('path');
const { createIncidentReport, updateIncidentReport, getIncidentReportById, getIncidentReports, deleteIncidentReport } = require("../controllers/incidentReport");

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/incident');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// ************* End :: File Uploader **************


const router = Router();


router.post("/create", upload.array('media', 5), createIncidentReport);
router.put("/update/:report_id", upload.array('media', 5), updateIncidentReport);
router.get("/getById/:report_id", getIncidentReportById);
router.get("/getall", getIncidentReports);
router.delete("/delete/:report_id", deleteIncidentReport)


module.exports = router;
