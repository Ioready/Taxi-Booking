const { Router } = require("express");
const { config } = require("dotenv");
const { createReview, getReviewById, getReviews, deleteReview, updateReview } = require("../controllers/reviews");
config();


const router = Router();


router.post("/create", createReview);
router.post("/update/:review_id", updateReview);
router.get("/getById/:review_id", getReviewById);
router.get('/getAll', getReviews);
router.delete("/delete/:review_id", deleteReview)


module.exports = router;
