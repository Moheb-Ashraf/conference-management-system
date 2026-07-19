const express = require('express');
const transactionController = require('../controllers/transactionController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { ADMIN, LEADER } = require('../constants/roles');

const router = express.Router({ mergeParams: true });

router.use(protect);

// تسجيل النقاط متاح للأدمن والقادة
router.post('/', restrictTo(ADMIN, LEADER), transactionController.createTransaction);

// إلغاء عملية متاح للأدمن فقط لضمان الانضباط
router.delete('/:id', restrictTo(ADMIN), transactionController.deleteTransaction);

module.exports = router;