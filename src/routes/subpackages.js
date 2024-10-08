const { Router } = require("express");
const { config } = require("dotenv");
const { createSubscriptionPackage, getSubscriptionPackageById, getAllSubscriptionPackages, updateSubscriptionPackage, deleteSubscriptionPackage, updateSubscriptionPackageStatus } = require("../controllers/subpackages");
config();


const router = Router();


router.post("/create", createSubscriptionPackage);
router.get("/getById/:id", getSubscriptionPackageById);
router.get('/getAll', getAllSubscriptionPackages);
router.put('/update/:id', updateSubscriptionPackageStatus);
router.delete("/delete/:id", deleteSubscriptionPackage)




module.exports = router;
