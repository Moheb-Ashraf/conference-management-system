const prisma = require('../config/prisma');

class DashboardRepository {
  // ملخص سريع للأرقام الكبيرة
  async getSummary(conferenceId) {
    const [counts, posPoints, negPoints] = await Promise.all([
      // 1. حساب أعداد الفرق والمخدومين والعمليات
      prisma.$transaction([
        prisma.team.count({ where: { conferenceId } }),
        prisma.member.count({ where: { team: { conferenceId } } }),
        prisma.transaction.count({ where: { conferenceId, isDeleted: false } })
      ]),
      // 2. إجمالي النقاط الإيجابية
      prisma.transaction.aggregate({
        where: { conferenceId, isDeleted: false, points: { gt: 0 } },
        _sum: { points: true }
      }),
      // 3. إجمالي النقاط السلبية
      prisma.transaction.aggregate({
        where: { conferenceId, isDeleted: false, points: { lt: 0 } },
        _sum: { points: true }
      })
    ]);

    return {
      totalTeams: counts[0],
      totalMembers: counts[1],
      totalTransactions: counts[2],
      positivePoints: posPoints._sum.points || 0,
      negativePoints: Math.abs(negPoints._sum.points || 0)
    };
  }

  async getTeamsRanking(conferenceId) {
    return await prisma.transaction.groupBy({
      by: ['teamId'],
      where: { conferenceId, isDeleted: false },
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } }
    });
  }

  async getTopMembers(conferenceId, limit = 10) {
    return await prisma.transaction.groupBy({
      by: ['memberId'],
      where: { conferenceId, isDeleted: false, memberId: { not: null } },
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit
    });
  }

  async getCategoriesStats(conferenceId) {
    return await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { conferenceId, isDeleted: false },
      _sum: { points: true }
    });
  }
}

module.exports = new DashboardRepository();