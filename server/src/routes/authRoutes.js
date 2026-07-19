const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// مسار عام لتسجيل الدخول
router.post('/login', authController.login);

// مسار محمي لجلب بيانات المستخدم الحالي
router.get('/me', protect, authController.getMe);

module.exports = router;