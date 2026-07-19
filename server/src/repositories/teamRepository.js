const prisma = require('../config/prisma');

class TeamRepository {
  async create(data, tx = prisma) {
    return await tx.team.create({ data });
  }

  async findById(id, tx = prisma) {
    return await tx.team.findUnique({ where: { id } });
  }

  async findByConferenceId(conferenceId, tx = prisma) {
    return await tx.team.findMany({
      where: { conferenceId },
      include: { _count: { select: { members: true } } }
    });
  }

  async update(id, data, tx = prisma) {
    return await tx.team.update({ where: { id }, data });
  }
}
module.exports = new TeamRepository();