const reportRepository = require('../repositories/reportRepository');
const conferenceRepository = require('../repositories/conferenceRepository');
const memberRepository = require('../repositories/memberRepository');
const teamRepository = require('../repositories/teamRepository');
const AppError = require('../utils/appError');

class ReportService {
  async getFullTransactionHistory(conferenceId, filters) {
    // 1. التحقق من وجود المؤتمر
    const conference = await conferenceRepository.findById(conferenceId);
    if (!conference) throw new AppError('المؤتمر غير موجود', 404);

    // 2. جلب البيانات
    const transactions = await reportRepository.getTransactionReport(conferenceId, filters);

    // 3. تنسيق البيانات للفرونت إند (Flattening)
    return transactions.map(t => ({
      id: t.id,
      date: t.createdAt,
      points: t.points,
      type: t.points > 0 ? 'BONUS' : 'PENALTY',
      memberName: t.member?.name || '--- (نقاط فريق)',
      teamName: t.team?.name || 'Unknown',
      category: t.category?.name || 'General',
      reason: t.reason?.text || t.customReason || 'بدون سبب محدد',
      leaderName: t.author?.name || 'System',
      notes: t.notes
    }));
  }

  async getDailyStats(conferenceId) {
    const stats = await reportRepository.getDailyActivityReport(conferenceId);
    return stats;
  }

  async getMemberBehaviorSummary(conferenceId, memberId) {
    const conference = await conferenceRepository.findById(conferenceId);
    if (!conference) throw new AppError('المؤتمر غير موجود', 404);

    const member = await memberRepository.findById(memberId);
    if (!member || member.team?.conferenceId !== conferenceId) {
      throw new AppError('المخدوم غير موجود أو لا ينتمي لهذا المؤتمر', 404);
    }

    const transactions = await reportRepository.getMemberTransactions(conferenceId, memberId);

    const totals = transactions.reduce((acc, tx) => {
      if (tx.isDeleted) return acc;
      acc.totalPoints += tx.points;
      if (tx.points > 0) acc.positivePoints += tx.points;
      else acc.negativePoints += Math.abs(tx.points);
      return acc;
    }, { totalPoints: 0, positivePoints: 0, negativePoints: 0 });

    const categoryBreakdown = Object.values(transactions.reduce((acc, tx) => {
      if (!tx.category) return acc;
      const key = tx.category.id;
      if (!acc[key]) {
        acc[key] = { categoryName: tx.category.name, totalPoints: 0, transactionsCount: 0 };
      }
      if (!tx.isDeleted) {
        acc[key].totalPoints += tx.points;
      }
      acc[key].transactionsCount += 1;
      return acc;
    }, {}));

    const reasonBreakdown = Object.values(transactions.reduce((acc, tx) => {
      if (!tx.reason) return acc;
      const key = tx.reason.id;
      if (!acc[key]) {
        acc[key] = { reasonText: tx.reason.text, totalPoints: 0, transactionsCount: 0 };
      }
      if (!tx.isDeleted) {
        acc[key].totalPoints += tx.points;
      }
      acc[key].transactionsCount += 1;
      return acc;
    }, {}));

    return {
      member: {
        id: member.id,
        name: member.name,
        teamId: member.team?.id,
        teamName: member.team?.name || '---'
      },
      totals: {
        ...totals,
        netPoints: totals.positivePoints - totals.negativePoints,
        activeTransactionsCount: transactions.filter(tx => !tx.isDeleted).length,
        deletedTransactionsCount: transactions.filter(tx => tx.isDeleted).length
      },
      categoryBreakdown,
      reasonBreakdown,
      history: transactions.map(tx => ({
        id: tx.id,
        points: tx.points,
        type: tx.points > 0 ? 'BONUS' : 'PENALTY',
        categoryName: tx.category?.name || 'عام',
        reasonText: tx.reason?.text || tx.customReason || 'بدون سبب',
        notes: tx.notes,
        isDeleted: tx.isDeleted,
        createdAt: tx.createdAt,
        authorName: tx.author?.name || 'System'
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    };
  }

  async getTeamBehaviorSummary(conferenceId, teamId) {
    const conference = await conferenceRepository.findById(conferenceId);
    if (!conference) throw new AppError('المؤتمر غير موجود', 404);

    const team = await teamRepository.findById(teamId);
    if (!team || team.conferenceId !== conferenceId) {
      throw new AppError('الفريق غير موجود أو لا ينتمي لهذا المؤتمر', 404);
    }

    const transactions = await reportRepository.getTeamTransactions(conferenceId, teamId);

    const totals = transactions.reduce((acc, tx) => {
      if (tx.isDeleted) return acc;
      acc.totalPoints += tx.points;
      if (tx.points > 0) acc.positivePoints += tx.points;
      else acc.negativePoints += Math.abs(tx.points);
      return acc;
    }, { totalPoints: 0, positivePoints: 0, negativePoints: 0 });

    const categoryBreakdown = Object.values(transactions.reduce((acc, tx) => {
      if (!tx.category) return acc;
      const key = tx.category.id;
      if (!acc[key]) {
        acc[key] = { categoryName: tx.category.name, totalPoints: 0, transactionsCount: 0 };
      }
      if (!tx.isDeleted) {
        acc[key].totalPoints += tx.points;
      }
      acc[key].transactionsCount += 1;
      return acc;
    }, {}));

    const memberBreakdown = Object.values(transactions.reduce((acc, tx) => {
      if (!tx.member) return acc;
      const key = tx.member.id;
      if (!acc[key]) {
        acc[key] = { memberName: tx.member.name, totalPoints: 0, transactionsCount: 0 };
      }
      if (!tx.isDeleted) {
        acc[key].totalPoints += tx.points;
      }
      acc[key].transactionsCount += 1;
      return acc;
    }, {}));

    return {
      team: {
        id: team.id,
        name: team.name,
        color: team.color
      },
      totals: {
        ...totals,
        netPoints: totals.positivePoints - totals.negativePoints,
        activeTransactionsCount: transactions.filter(tx => !tx.isDeleted).length,
        deletedTransactionsCount: transactions.filter(tx => tx.isDeleted).length
      },
      categoryBreakdown,
      memberBreakdown,
      history: transactions.map(tx => ({
        id: tx.id,
        points: tx.points,
        type: tx.points > 0 ? 'BONUS' : 'PENALTY',
        memberName: tx.member?.name || '---',
        categoryName: tx.category?.name || 'عام',
        reasonText: tx.reason?.text || tx.customReason || 'بدون سبب',
        notes: tx.notes,
        isDeleted: tx.isDeleted,
        createdAt: tx.createdAt
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    };
  }

  async getTeamsComparison(conferenceId) {
    const conference = await conferenceRepository.findById(conferenceId);
    if (!conference) throw new AppError('المؤتمر غير موجود', 404);

    const teams = await teamRepository.findByConferenceId(conferenceId);
    const transactions = await reportRepository.getConferenceTransactions(conferenceId);

    const teamStats = teams.map(team => {
      const teamTransactions = transactions.filter(tx => tx.teamId === team.id);
      const totals = teamTransactions.reduce((acc, tx) => {
        if (tx.isDeleted) return acc;
        acc.totalPoints += tx.points;
        if (tx.points > 0) acc.positivePoints += tx.points;
        else acc.negativePoints += Math.abs(tx.points);
        return acc;
      }, { totalPoints: 0, positivePoints: 0, negativePoints: 0 });

      const categoryBreakdown = Object.values(teamTransactions.reduce((acc, tx) => {
        if (!tx.category) return acc;
        const key = tx.category.id;
        if (!acc[key]) {
          acc[key] = { categoryName: tx.category.name, totalPoints: 0 };
        }
        if (!tx.isDeleted) {
          acc[key].totalPoints += tx.points;
        }
        return acc;
      }, {}));

      return {
        teamId: team.id,
        teamName: team.name,
        teamColor: team.color || '#000000',
        membersCount: team._count?.members || 0,
        totals: {
          ...totals,
          netPoints: totals.positivePoints - totals.negativePoints
        },
        categoryBreakdown
      };
    }).sort((a, b) => b.totals.totalPoints - a.totals.totalPoints);

    return { teams: teamStats };
  }
}

module.exports = new ReportService();