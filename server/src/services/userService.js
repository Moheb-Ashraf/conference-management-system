const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');

class UserService {
  async getAllUsers() {
    return await userRepository.findAll();
  }

  async createUser(data) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError('البريد الإلكتروني مسجل بالفعل', 400);

    const hashedPassword = await bcrypt.hash(data.password, 12);
    return await userRepository.create({ ...data, password: hashedPassword });
  }
}

module.exports = new UserService();