const jwt = require('jsonwebtoken');

/**
 * @desc توليد توكن دخول جديد للمستخدم
 * @param {Object} user - كائن المستخدم من قاعدة البيانات
 * @returns {String} JWT Token
 */
exports.generateAccessToken = (user) => {
  // نستخدم 'sub' كمعيار عالمي (Subject) للإشارة إلى معرف المستخدم
  // ونضيف 'role' للتحقق السريع من الصلاحيات في الواجهة الأمامية أو الميدلوير
  const payload = {
    sub: user.id,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d', // القيمة الافتراضية يوم واحد
  });
};

/**
 * @desc التحقق من صحة التوكن وفك تشفيره
 * @param {String} token - التوكن القادم من الهيدر
 * @returns {Object} Payload - البيانات المشفرة داخل التوكن
 * @throws {Error} في حال كان التوكن منتهي الصلاحية أو غير صالح
 */
exports.verifyToken = (token) => {
  // jwt.verify تقوم بالتأكد من التوقيع (Signature) وتاريخ الانتهاء تلقائياً
  return jwt.verify(token, process.env.JWT_SECRET);
};