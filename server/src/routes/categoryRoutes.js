const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { ADMIN, LEADER } = require('../constants/roles');

const router = express.Router({ mergeParams: true });

router.use(protect);

// تذكر: هذا الراوتر سيتم تركيبه تحت /conferences/:conferenceId/categories
router.route('/')
  .post(restrictTo(ADMIN), categoryController.createCategory)
  .get(categoryController.getConferenceCategories);

router.route('/:id')
  .patch(restrictTo(ADMIN), categoryController.updateCategory)
  .delete(restrictTo(ADMIN), categoryController.archiveCategory);

// الأسباب (Nested under categories if you want, or direct)
router.post('/:categoryId/reasons', restrictTo(ADMIN, LEADER), categoryController.createReason);

module.exports = router;