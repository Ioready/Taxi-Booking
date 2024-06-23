const { Router } = require("express");
const { config } = require("dotenv");
const { getBookingById, deleteBooking, createBooking, getAllBookings, approveBooking, cancelBooking, checkCarAvailability } = require("../controllers/booking");
config();


const router = Router();


router.post("/create", createBooking);
router.get("/getById/:id", getBookingById);
router.get('/getAll', getAllBookings);
router.put('/approve/:id', approveBooking);
router.put('/cancel/:id', cancelBooking);
router.delete("/delete/:id", deleteBooking)

router.get('/availability', checkCarAvailability);



module.exports = router;
