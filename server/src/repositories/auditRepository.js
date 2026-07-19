const prisma = require('../config/prisma');

class AuditRepository {
  async create(data, tx = prisma) {
    return await tx.auditLog.create({ data });
  }
}
module.exports = new AuditRepository();