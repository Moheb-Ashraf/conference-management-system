const AppError = require('../utils/appError');
const { error } = require('../utils/apiResponse');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // 1. أخطاء التحقق من البيانات (Zod)
  if (err.name === 'ZodError') {
    const errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return error(res, 'خطأ في التحقق من البيانات', 400, errors);
  }

  // 2. أخطاء قاعدة البيانات (Prisma)
  if (err.code === 'P2002') {
    return error(res, 'هذا السجل موجود بالفعل (Duplicate Entry)', 400);
  }

  // 3. الأخطاء المعرفة مسبقاً (AppError)
  if (err instanceof AppError) {
    return error(res, err.message, err.statusCode);
  }

  // 4. الأخطاء غير المتوقعة (Internal Server Error)
  console.error('💥 ERROR:', err);
  return error(
    res, 
    process.env.NODE_ENV === 'development' ? err.message : 'حدث خطأ داخلي في الخادم',
    err.statusCode
  );
};