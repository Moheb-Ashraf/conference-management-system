const prisma = require('../config/prisma');

class ReportRepository {
  /**
   * جلب سجل العمليات المفصل مع الفلاتر
   */
  async getTransactionReport(conferenceId, filters = {}) {
    const { startDate, endDate, teamId, memberId, categoryId, createdById } = filters;

    return await prisma.transaction.findMany({
      where: {
        conferenceId,
        isDeleted: false,
        // فلاتر اختيارية
        ...(startDate && endDate && {
          createdAt: { gte: new Date(startDate), lte: new Date(endDate) }
        }),
        ...(teamId && { teamId }),
        ...(memberId && { memberId }),
        ...(categoryId && { categoryId }),
        ...(createdById && { createdById }),
      },
      include: {
        member: { select: { name: true } },
        team: { select: { name: true } },
        category: { select: { name: true } },
        reason: { select: { text: true } },
        author: { select: { name: true } } // القائد الذي أضاف العملية
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * تقرير الأداء اليومي (مجموع النقاط لكل يوم)
   */
  async getDailyActivityReport(conferenceId) {
    // استعلام SQL مباشر لأن Prisma groupBy لا تدعم استخراج التاريخ من DateTime بسهولة
    return await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date, 
        SUM(points) as total_points,
        COUNT(id) as transactions_count
      FROM transactions
      WHERE "conferenceId" = ${conferenceId} AND "isDeleted" = false
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;
  }

  async getMemberTransactions(conferenceId, memberId) {
    return await prisma.transaction.findMany({
      where: { conferenceId, memberId },
      include: {
        category: { select: { id: true, name: true } },
        reason: { select: { id: true, text: true } },
        author: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTeamTransactions(conferenceId, teamId) {
    return await prisma.transaction.findMany({
      where: { conferenceId, teamId },
      include: {
        member: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        reason: { select: { id: true, text: true } },
        author: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getConferenceTransactions(conferenceId) {
    return await prisma.transaction.findMany({
      where: { conferenceId },
      include: {
        member: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        reason: { select: { id: true, text: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

module.exports = new ReportRepository();