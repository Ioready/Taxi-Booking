const { Router } = require("express");
const { config } = require("dotenv");
const { createUserSubscription, getUserSubscriptionById, getAllUserSubscriptions, updateUserSubscription, deleteUserSubscription } = require("../controllers/userSubscription");
const { createFinancialTransaction, getFinancialTransactionById, getAllFinancialTransactions, updateFinancialTransaction, deleteFinancialTransaction } = require("../controllers/financial");
config();


const router = Router();


router.post("/create", createFinancialTransaction);
router.get("/getById/:id", getFinancialTransactionById);
router.get('/getAll', getAllFinancialTransactions);
router.put('/update/:id', updateFinancialTransaction);
router.delete("/delete/:id", deleteFinancialTransaction)



module.exports = router;
