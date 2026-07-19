const prisma = require('../config/prisma');

class ConferenceSettingsRepository {
  async create(data, tx = prisma) {
    return await tx.conferenceSettings.create({ data });
  }

  async update(conferenceId, data, tx = prisma) {
    return await tx.conferenceSettings.update({
      where: { conferenceId },
      data
    });
  }
}

module.exports = new ConferenceSettingsRepository();