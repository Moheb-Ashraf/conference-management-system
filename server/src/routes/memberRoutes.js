const express = require('express');
const memberController = require('../controllers/memberController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { ADMIN, LEADER } = require('../constants/roles');

const router = express.Router({ mergeParams: true });

router.use(protect);

// المسارات ستكون تحت /teams/:teamId/members
router.route('/')
  .post(restrictTo(ADMIN, LEADER), memberController.createMember)
  .get(memberController.getTeamMembers);

router.route('/:id')
  .get(memberController.getMember)
  .patch(restrictTo(ADMIN, LEADER), memberController.update);

module.exports = router;