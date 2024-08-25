const { Router } = require("express");
const { config } = require("dotenv");
const { createUserSubscription, getUserSubscriptionById, getAllUserSubscriptions, updateUserSubscription, deleteUserSubscription, payForSubscription } = require("../controllers/userSubscription");
config();


const router = Router();


router.post("/create", payForSubscription);
router.get("/getById/:id", getUserSubscriptionById);
router.get('/getAll', getAllUserSubscriptions);
router.put('/update/:id', updateUserSubscription);
router.delete("/delete/:id", deleteUserSubscription)



module.exports = router;
