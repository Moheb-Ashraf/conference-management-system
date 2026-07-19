const prisma = require('../config/prisma');

class ConferenceRepository {
  async create(data, tx = prisma) {
    return await tx.conference.create({ data });
  }

  async findMany(userId, role, tx = prisma) {
  // إذا كان أدمن، يرى كل المؤتمرات. إذا كان قائداً، يرى المنسوب له فقط.
  const where = role === 'ADMIN' ? { isArchived: false } : { 
    isArchived: false,
    users: { some: { id: userId } } // فلترة حسب المستخدم
  };

  return await tx.conference.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
}

  async findById(id, tx = prisma) {
    return await tx.conference.findUnique({
      where: { id },
      include: { settings: true }
    });
  }

  async update(id, data, tx = prisma) {
    return await tx.conference.update({ where: { id }, data });
  }
}
module.exports = new ConferenceRepository();