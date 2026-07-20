const express = require('express');
const reportController = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/transactions', reportController.getTransactionHistory);
router.get('/daily', reportController.getDailyReport);
router.get('/members/:memberId/behavior', reportController.getMemberBehaviorSummary);
router.get('/teams/comparison', reportController.getTeamsComparison);
router.get('/teams/:teamId/summary', reportController.getTeamBehaviorSummary);

module.exports = router;