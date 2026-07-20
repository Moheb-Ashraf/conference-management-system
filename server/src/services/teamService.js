const prisma = require('../config/prisma');
const teamRepository = require('../repositories/teamRepository');
const conferenceRepository = require('../repositories/conferenceRepository');
const auditRepository = require('../repositories/auditRepository');
const AppError = require('../utils/appError');
const { CREATE, UPDATE } = require('../constants/auditActions');
const { TEAM } = require('../constants/entityTypes');

class TeamService {
  async createTeam(conferenceId, data, userId) {
    return await prisma.$transaction(async (tx) => {
      const conference = await conferenceRepository.findById(conferenceId, tx);
      if (!conference) throw new AppError('المؤتمر غير موجود', 404);

      const team = await teamRepository.create({ ...data, conferenceId }, tx);
      
      await auditRepository.create({
        userId, action: CREATE, entityType: TEAM, entityId: team.id, newValue: team
      }, tx);

      return team;
    });
  }

  async getConferenceTeams(conferenceId) {
    return await teamRepository.findByConferenceId(conferenceId);
  }

  async updateTeam(id, data, userId) {
    const existing = await teamRepository.findById(id);
    if (!existing) throw new AppError('الفريق غير موجود', 404);

    return await prisma.$transaction(async (tx) => {
      const updated = await teamRepository.update(id, data, tx);
      await auditRepository.create({
        userId,
        action: UPDATE,
        entityType: TEAM,
        entityId: id,
        oldValue: existing,
        newValue: updated
      }, tx);

      return updated;
    });
  }
}
module.exports = new TeamService();