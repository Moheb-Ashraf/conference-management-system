const prisma = require('../config/prisma');

class MemberRepository {
  async create(data, tx = prisma) {
    return await tx.member.create({ data });
  }

  async findById(id, tx = prisma) {
    return await tx.member.findUnique({
      where: { id },
      include: { team: true }
    });
  }

  async findManyByIds(ids, tx = prisma) {
  return await tx.member.findMany({
    where: { id: { in: ids } },
    include: { team: { select: { name: true } } }
  });
}

  async findByTeamId(teamId, tx = prisma) {
    return await tx.member.findMany({
      where: { teamId },
      orderBy: { name: 'asc' }
    });
  }

  async update(id, data, tx = prisma) {
    return await tx.member.update({ where: { id }, data });
  }

  async delete(id, tx = prisma) {
    return await tx.member.delete({ where: { id } });
  }
}

module.exports = new MemberRepository();