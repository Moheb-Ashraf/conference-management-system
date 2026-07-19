const prisma = require('../config/prisma');

class TransactionRepository {
  async create(data, tx = prisma) {
    return await tx.transaction.create({ data });
  }

  async findById(id, tx = prisma) {
    return await tx.transaction.findUnique({
      where: { id },
      include: { member: true, team: true, category: true, reason: true }
    });
  }

  // جلب العمليات لمؤتمر معين (لأغراض التقارير والداشبورد)
  async findByConference(conferenceId, tx = prisma) {
    return await tx.transaction.findMany({
      where: { conferenceId, isDeleted: false },
      include: { member: true, team: true, reason: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id, data, tx = prisma) {
    return await tx.transaction.update({ where: { id }, data });
  }
}

module.exports = new TransactionRepository();