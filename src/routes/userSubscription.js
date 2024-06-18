const { Router } = require("express");
const { config } = require("dotenv");
const { createUserSubscription, getUserSubscriptionById, getAllUserSubscriptions, updateUserSubscription, deleteUserSubscription } = require("../controllers/userSubscription");
config();


const router = Router();


router.post("/create", createUserSubscription);
router.get("/getById/:id", getUserSubscriptionById);
router.get('/getAll', getAllUserSubscriptions);
router.put('/update/:id', updateUserSubscription);
router.delete("/delete/:id", deleteUserSubscription)



module.exports = router;
