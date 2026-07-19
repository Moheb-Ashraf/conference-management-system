const prisma = require('../config/prisma');

class UserRepository {
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true
      }
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
  }
}
module.exports = new UserRepository();