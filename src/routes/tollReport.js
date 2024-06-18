const { Router } = require("express");
const { config } = require("dotenv");
const { createUserSubscription, getUserSubscriptionById, getAllUserSubscriptions, updateUserSubscription, deleteUserSubscription } = require("../controllers/userSubscription");
const { createFinancialTransaction, getFinancialTransactionById, getAllFinancialTransactions, updateFinancialTransaction, deleteFinancialTransaction } = require("../controllers/financial");
const { createTollReport, getTollReportById, getTollReports, updateTollReport, deleteTollReport } = require("../controllers/tollReport");
config();


const router = Router();


router.post("/create", createTollReport);
router.get("/getById/:toll_report_id", getTollReportById);
router.get('/getAll', getTollReports);
router.put('/update/:toll_report_id', updateTollReport);
router.delete("/delete/:toll_report_id", deleteTollReport)



module.exports = router;
