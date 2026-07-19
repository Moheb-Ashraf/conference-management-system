const prisma = require('../config/prisma');

class ConferenceRepository {
  async create(data, tx = prisma) {
    return await tx.conference.create({ data });
  }

  async findMany(where = {}, tx = prisma) {
    return await tx.conference.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' },
      include: { settings: true } 
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