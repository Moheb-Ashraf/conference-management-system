const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { ADMIN } = require('../constants/roles');

const router = express.Router();

router.use(protect);
router.use(restrictTo(ADMIN)); // للأدمن فقط

router.route('/')
  .get(userController.getAll)
  .post(userController.create);

module.exports = router;