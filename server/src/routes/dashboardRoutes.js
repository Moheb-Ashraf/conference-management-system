const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(protect);

// مسار واحد يرجع كل بيانات الداشبورد للمؤتمر
router.get('/', dashboardController.getDashboardData);

module.exports = router;