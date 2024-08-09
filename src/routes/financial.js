const { Router } = require("express");
const { config } = require("dotenv");
const { createFinancialTransaction, getFinancialTransactionById, getAllFinancialTransactions, updateFinancialTransaction, deleteFinancialTransaction, payment, success, getFinancialTransactionByUserId, getFinancialTransactionByUserBookingId } = require("../controllers/financial");
config();


const router = Router();


router.post("/create", payment);
router.get("/getByUserId/:id", getFinancialTransactionByUserId);
router.get("/getByBookingId/:id", getFinancialTransactionByUserBookingId);
router.get('/getAll', getAllFinancialTransactions);
router.put('/update/:id', updateFinancialTransaction);
router.patch('/success', success)
router.delete("/delete/:id", deleteFinancialTransaction)



module.exports = router;
