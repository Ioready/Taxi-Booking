const { Router } = require("express");
const { config } = require("dotenv");
const { createFinancialTransaction, getFinancialTransactionById, getAllFinancialTransactions, updateFinancialTransaction, deleteFinancialTransaction, payment, success } = require("../controllers/financial");
config();


const router = Router();


router.post("/create", payment);
router.get("/getById/:id", getFinancialTransactionById);
router.get('/getAll', getAllFinancialTransactions);
router.put('/update/:id', updateFinancialTransaction);
router.patch('/success', success)
router.delete("/delete/:id", deleteFinancialTransaction)



module.exports = router;
