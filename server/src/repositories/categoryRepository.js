const prisma = require('../config/prisma');

class CategoryRepository {
  async create(data, tx = prisma) {
    return await tx.category.create({ data });
  }

  async findById(id, tx = prisma) {
    return await tx.category.findUnique({ where: { id } });
  }

  async findManyByIds(ids, tx = prisma) {
  return await tx.category.findMany({
    where: { id: { in: ids } }
  });
}

  async findByConferenceId(conferenceId, tx = prisma) {
    return await tx.category.findMany({
      where: { conferenceId },
      include: { reasons: true },
      orderBy: { order: 'asc' }
    });
  }

  async update(id, data, tx = prisma) {
    return await tx.category.update({ where: { id }, data });
  }
}
module.exports = new CategoryRepository();