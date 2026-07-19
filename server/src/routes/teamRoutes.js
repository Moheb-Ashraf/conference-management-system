const express = require('express');
const teamController = require('../controllers/teamController');
const memberRoutes = require('./memberRoutes'); // أضف هذا السطر
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { ADMIN, LEADER } = require('../constants/roles');

const router = express.Router({ mergeParams: true });

router.use(protect);

// تركيب مسارات المخدومين تحت الفريق
router.use('/:teamId/members', memberRoutes);

router.route('/')
  .post(restrictTo(ADMIN, LEADER), teamController.createTeam)
  .get(teamController.getConferenceTeams);

module.exports = router;