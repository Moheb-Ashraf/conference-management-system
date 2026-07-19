const prisma = require('../config/prisma');

class ReasonRepository {
  async create(data, tx = prisma) {
    return await tx.reason.create({ data });
  }

  async findById(id, tx = prisma) {
    return await tx.reason.findUnique({ where: { id } });
  }

  async update(id, data, tx = prisma) {
    return await tx.reason.update({ where: { id }, data });
  }

  async delete(id, tx = prisma) {
    return await tx.reason.delete({ where: { id } });
  }
}
module.exports = new ReasonRepository();