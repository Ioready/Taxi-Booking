const { Router } = require("express");
const multer = require("multer");
const { createGlobal, updateGlobal, deleteGlobal, getGlobalById, getGlobals } = require("../controllers/global");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/global');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

const router = Router();

// Routes for Global
router.post("/create", upload.single('media'), createGlobal);          // Create Global
router.put("/update/:global_id", upload.single('media'), updateGlobal); // Update Global
router.delete("/delete/:global_id", deleteGlobal);                     // Delete Global
router.get("/getById/:global_id", getGlobalById);                      // Get Global by ID
router.get("/getall", getGlobals);                                     // Get All Globals

module.exports = router;
