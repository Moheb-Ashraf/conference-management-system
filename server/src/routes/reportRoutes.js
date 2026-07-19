const express = require('express');
const reportController = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/transactions', reportController.getTransactionHistory);
router.get('/daily', reportController.getDailyReport);

module.exports = router;