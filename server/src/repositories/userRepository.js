const prisma = require('../config/prisma');

class UserRepository {
  async findAll(tx = prisma) {
    return await tx.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        conferences: { select: { id: true, name: true } } // جلب المؤتمرات المسندة
      }
    });
  }

  async create(data, tx = prisma) {
    const { conferenceIds, ...userData } = data;
    return await tx.user.create({
      data: {
        ...userData,
        conferences: {
          connect: conferenceIds?.map(id => ({ id })) // ربط المستخدم بالمؤتمرات
        }
      }
    });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: { conferences: true }
    });
  }
}

module.exports = new UserRepository();