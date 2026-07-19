const authService = require('../services/authService');
const { loginSchema } = require('../validators/auth.schema');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

exports.login = asyncHandler(async (req, res) => {
  // 1. التحقق من البيانات المدخلة
  const validatedData = loginSchema.parse(req.body);

  // 2. تنفيذ عملية تسجيل الدخول عبر الـ Service
  const result = await authService.login(validatedData.email, validatedData.password);

  // 3. إرسال الرد الموحد
  success(res, 'تم تسجيل الدخول بنجاح', result);
});

exports.getMe = asyncHandler(async (req, res) => {
  // المستخدم موجود بالفعل في req.user بفضل الـ protect middleware
  success(res, 'بيانات المستخدم الحالي', { user: req.user });
});