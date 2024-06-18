const { Router } = require("express");
const { config } = require("dotenv");
const { createUserSubscription, getUserSubscriptionById, getAllUserSubscriptions, updateUserSubscription, deleteUserSubscription } = require("../controllers/userSubscription");
const { createFinancialTransaction, getFinancialTransactionById, getAllFinancialTransactions, updateFinancialTransaction, deleteFinancialTransaction } = require("../controllers/financial");
const { createTollReport, getTollReportById, getTollReports, updateTollReport, deleteTollReport } = require("../controllers/tollReport");
const { createJourneyUpdate, getJourneyUpdateById, getJourneyUpdates, updateJourneyUpdate, deleteJourneyUpdate } = require("../controllers/journeyUpdate");
config();


const router = Router();


router.post("/create", createJourneyUpdate);
router.get("/getById/:update_id", getJourneyUpdateById);
router.get('/getAll', getJourneyUpdates);
router.put('/update/:update_id', updateJourneyUpdate);
router.delete("/delete/:update_id", deleteJourneyUpdate)



module.exports = router;
