const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const AppError = require('../utils/appError');
const { generateAccessToken } = require('../utils/token');
const userRepository = require('../repositories/userRepository');
const auditRepository = require('../repositories/auditRepository');
const { LOGIN } = require('../constants/auditActions');
const { USER } = require('../constants/entityTypes');

class AuthService {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('بيانات الدخول غير صحيحة', 401);
    }
    if (!user.isActive) throw new AppError('الحساب معطل', 401);

    const accessToken = generateAccessToken(user);

    // تسجيل Audit (Non-blocking)
    auditRepository.create({
      userId: user.id,
      action: LOGIN,
      entityType: USER,
      entityId: user.id
    }).catch(e => logger.error('Audit failed:', e));

    return { accessToken, user: { id: user.id, name: user.name, role: user.role } };
  }
}
module.exports = new AuthService();