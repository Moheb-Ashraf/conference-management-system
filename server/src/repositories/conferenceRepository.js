const prisma = require('../config/prisma');

class ConferenceRepository {
  async create(data, tx = prisma) {
    return await tx.conference.create({ data });
  }

  async findMany(userId, role, tx = prisma) {
    const where = role === 'ADMIN'
      ? { status: { not: 'ARCHIVED' } }
      : {
          status: { not: 'ARCHIVED' },
          users: { some: { id: userId } }
        };

    return await tx.conference.findMany({
      where,
      include: { settings: true },
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