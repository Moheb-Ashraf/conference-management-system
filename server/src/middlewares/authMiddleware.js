const { verifyToken } = require('../utils/token');
const AppError = require('../utils/appError');
const userRepository = require('../repositories/userRepository');
const asyncHandler = require('./asyncHandler');

/**
 * @desc حماية المسارات - التحقق من التوكن وصلاحية المستخدم
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. استخراج التوكن من الهيدر (Authorization: Bearer <token>)
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('غير مسموح بالدخول، يرجى تسجيل الدخول أولاً', 401));
  }

  try {
    // 2. التحقق من صحة التوكن وفك التشفير
    // ملاحظة: الـ Payload يحتوي على { sub: id, role: role }
    const decoded = verifyToken(token);

    // 3. البحث عن المستخدم في قاعدة البيانات (لحمايتنا من التوكنات القديمة لمستخدمين محذوفين)
    // نستخدم الـ Repository لضمان فصل الطبقات
    const currentUser = await userRepository.findById(decoded.sub);

    if (!currentUser) {
      return next(new AppError('المستخدم صاحب هذا التوكن لم يعد موجوداً', 401));
    }

    // 4. التحقق من حالة الحساب (Is Active)
    // هذا يمنع أي مستخدم تم تعطيله من الوصول حتى لو كان التوكن صالحاً
    if (!currentUser.isActive) {
      return next(new AppError('هذا الحساب معطل حالياً، يرجى مراجعة الإدارة', 401));
    }

    // 5. تمرير بيانات المستخدم للطلب (Request Object)
    // الآن req.user جاهز للاستخدام في أي Controller لاحق
    req.user = currentUser;
    next();
  } catch (err) {
    // في حالة انتهاء صلاحية التوكن أو التلاعب به
    return next(new AppError('توكن غير صالح أو منتهي الصلاحية، يرجى تسجيل الدخول مجدداً', 401));
  }
});

/**
 * @desc تحديد الصلاحيات بناءً على الأدوار (Roles)
 * @param  {...string} roles - الأدوار المسموح لها (ADMIN, LEADER, etc)
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user يأتي من الـ protect middleware السابق له
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('ليس لديك الصلاحية الكافية للقيام بهذا الإجراء', 403)
      );
    }
    next();
  };
};