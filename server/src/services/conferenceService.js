const prisma = require('../config/prisma');
const conferenceRepository = require('../repositories/conferenceRepository');
const conferenceSettingsRepository = require('../repositories/conferenceSettingsRepository');
const auditRepository = require('../repositories/auditRepository');
const AppError = require('../utils/appError');
const { CREATE, UPDATE, ARCHIVE } = require('../constants/auditActions');
const { CONFERENCE } = require('../constants/entityTypes');
const { ARCHIVED } = require('../constants/conferenceStatus');

class ConferenceService {
  async createConference(data, userId) {
    return await prisma.$transaction(async (tx) => {
      const conference = await conferenceRepository.create(data, tx);

      await conferenceSettingsRepository.create({ conferenceId: conference.id }, tx);

      const fullConference = await conferenceRepository.findById(conference.id, tx);

      await auditRepository.create({
        userId,
        action: CREATE,
        entityType: CONFERENCE,
        entityId: conference.id,
        newValue: fullConference
      }, tx);

      return fullConference;
    });
  }

  async getAllConferences(userId, role) {
    if (!userId) throw new AppError('User ID is required', 400);
    return await conferenceRepository.findMany(userId, role);
  }

  async getConferenceById(id) {
    const conference = await conferenceRepository.findById(id);
    if (!conference) throw new AppError('المؤتمر غير موجود', 404);
    return conference;
  }

  async updateConference(id, data, userId) {
    return await prisma.$transaction(async (tx) => {
      const existing = await conferenceRepository.findById(id, tx);
      if (!existing) throw new AppError('المؤتمر غير موجود', 404);

      await conferenceRepository.update(id, data, tx);
      const updated = await conferenceRepository.findById(id, tx);

      await auditRepository.create({
        userId,
        action: UPDATE,
        entityType: CONFERENCE,
        entityId: id,
        oldValue: existing,
        newValue: updated
      }, tx);

      return updated;
    });
  }

  async archiveConference(id, userId) {
    return await prisma.$transaction(async (tx) => {
      const existing = await conferenceRepository.findById(id, tx);
      if (!existing) throw new AppError('المؤتمر غير موجود', 404);

      await conferenceRepository.update(id, { status: ARCHIVED }, tx);
      const updated = await conferenceRepository.findById(id, tx);

      await auditRepository.create({
        userId,
        action: ARCHIVE,
        entityType: CONFERENCE,
        entityId: id,
        oldValue: existing,
        newValue: updated
      }, tx);

      return updated;
    });
  }
}

module.exports = new ConferenceService();
