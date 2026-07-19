const reportRepository = require('../repositories/reportRepository');
const conferenceRepository = require('../repositories/conferenceRepository');
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
}

module.exports = new ReportService();