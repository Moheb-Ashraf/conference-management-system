const express = require('express');
const conferenceController = require('../controllers/conferenceController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { ADMIN } = require('../constants/roles');
const categoryRoutes = require('./categoryRoutes');
const teamRoutes = require('./teamRoutes');
const transactionRoutes = require('./transactionRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const reportRoutes = require('./reportRoutes');



const router = express.Router();
router.use('/:conferenceId/categories', categoryRoutes);
router.use('/:conferenceId/teams', teamRoutes);
router.use('/:conferenceId/transactions', transactionRoutes);
router.use('/:conferenceId/dashboard', dashboardRoutes);
router.use('/:conferenceId/reports', reportRoutes);


router.use(protect);

router.route('/')
  .get(conferenceController.getAll)
  .post(restrictTo(ADMIN), conferenceController.create);

router.route('/:id')
  .get(conferenceController.getOne)
  .patch(restrictTo(ADMIN), conferenceController.update)
  .delete(restrictTo(ADMIN), conferenceController.archive);

module.exports = router;
