const reportRepository = require('../repositories/reportRepository');
const conferenceRepository = require('../repositories/conferenceRepository');
const memberRepository = require('../repositories/memberRepository');
const teamRepository = require('../repositories/teamRepository');
const categoryRepository = require('../repositories/categoryRepository');
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

    // جلب كل الفئات (مع الأسباب) الخاصة بالمؤتمر عشان نعمل seed للـ breakdown
    const categories = await categoryRepository.findByConferenceId(conferenceId);

    const totals = transactions.reduce((acc, tx) => {
      if (tx.isDeleted) return acc;
      acc.totalPoints += tx.points;
      if (tx.points > 0) acc.positivePoints += tx.points;
      else acc.negativePoints += Math.abs(tx.points);
      return acc;
    }, { totalPoints: 0, positivePoints: 0, negativePoints: 0 });

    // Seed: كل فئة تبدأ بـ 0 نقطة و0 عملية، حتى لو معندهاش transactions
    const categoryAcc = {};
    categories.forEach(cat => {
      categoryAcc[cat.id] = { categoryName: cat.name, totalPoints: 0, transactionsCount: 0 };
    });
    transactions.forEach(tx => {
      if (!tx.category) return;
      const key = tx.category.id;
      if (!categoryAcc[key]) {
        // احتياطي لو فيه فئة اتحذفت بس لسه ليها transactions قديمة
        categoryAcc[key] = { categoryName: tx.category.name, totalPoints: 0, transactionsCount: 0 };
      }
      if (!tx.isDeleted) categoryAcc[key].totalPoints += tx.points;
      categoryAcc[key].transactionsCount += 1;
    });
    const categoryBreakdown = Object.values(categoryAcc);

    // Seed: كل سبب من كل الفئات يبدأ بـ 0
    const reasonAcc = {};
    categories.forEach(cat => {
      (cat.reasons || []).forEach(reason => {
        reasonAcc[reason.id] = { reasonText: reason.text, totalPoints: 0, transactionsCount: 0 };
      });
    });
    transactions.forEach(tx => {
      if (!tx.reason) return;
      const key = tx.reason.id;
      if (!reasonAcc[key]) {
        reasonAcc[key] = { reasonText: tx.reason.text, totalPoints: 0, transactionsCount: 0 };
      }
      if (!tx.isDeleted) reasonAcc[key].totalPoints += tx.points;
      reasonAcc[key].transactionsCount += 1;
    });
    const reasonBreakdown = Object.values(reasonAcc);

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

    // جلب كل الفئات الخاصة بالمؤتمر عشان نعمل seed للـ breakdown
    const categories = await categoryRepository.findByConferenceId(conferenceId);

    const totals = transactions.reduce((acc, tx) => {
      if (tx.isDeleted) return acc;
      acc.totalPoints += tx.points;
      if (tx.points > 0) acc.positivePoints += tx.points;
      else acc.negativePoints += Math.abs(tx.points);
      return acc;
    }, { totalPoints: 0, positivePoints: 0, negativePoints: 0 });

    // Seed: كل فئة تبدأ بـ 0 نقطة و0 عملية
    const categoryAcc = {};
    categories.forEach(cat => {
      categoryAcc[cat.id] = { categoryName: cat.name, totalPoints: 0, transactionsCount: 0 };
    });
    transactions.forEach(tx => {
      if (!tx.category) return;
      const key = tx.category.id;
      if (!categoryAcc[key]) {
        categoryAcc[key] = { categoryName: tx.category.name, totalPoints: 0, transactionsCount: 0 };
      }
      if (!tx.isDeleted) categoryAcc[key].totalPoints += tx.points;
      categoryAcc[key].transactionsCount += 1;
    });
    const categoryBreakdown = Object.values(categoryAcc);

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

    // جلب كل الفئات مرة واحدة بره اللوب على الفرق (توفيرًا للأداء)
    const categories = await categoryRepository.findByConferenceId(conferenceId);

    const teamStats = teams.map(team => {
      const teamTransactions = transactions.filter(tx => tx.teamId === team.id);
      const totals = teamTransactions.reduce((acc, tx) => {
        if (tx.isDeleted) return acc;
        acc.totalPoints += tx.points;
        if (tx.points > 0) acc.positivePoints += tx.points;
        else acc.negativePoints += Math.abs(tx.points);
        return acc;
      }, { totalPoints: 0, positivePoints: 0, negativePoints: 0 });

      // Seed: كل الفئات تبدأ بـ 0 لكل فريق، حتى لو مالوش عمليات في الفئة دي
      const categoryAcc = {};
      categories.forEach(cat => {
        categoryAcc[cat.id] = { categoryName: cat.name, totalPoints: 0 };
      });
      teamTransactions.forEach(tx => {
        if (!tx.category) return;
        const key = tx.category.id;
        if (!categoryAcc[key]) {
          categoryAcc[key] = { categoryName: tx.category.name, totalPoints: 0 };
        }
        if (!tx.isDeleted) {
          categoryAcc[key].totalPoints += tx.points;
        }
      });
      const categoryBreakdown = Object.values(categoryAcc);

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