const dashboardRepository = require('../repositories/dashboardRepository');
const teamRepository = require('../repositories/teamRepository');
const memberRepository = require('../repositories/memberRepository');
const categoryRepository = require('../repositories/categoryRepository');
const conferenceRepository = require('../repositories/conferenceRepository');
const AppError = require('../utils/appError');

class DashboardService {
  async getConferenceStats(conferenceId) {
    // 1. التحقق من وجود المؤتمر (Validation)
    const conference = await conferenceRepository.findById(conferenceId);
    if (!conference) throw new AppError('المؤتمر غير موجود', 404);

    // 2. جلب كل البيانات الخام بالتوازي (Parallel Execution)
    const [summary, rawRanking, rawTopMembers, rawCategories] = await Promise.all([
      dashboardRepository.getSummary(conferenceId),
      dashboardRepository.getTeamsRanking(conferenceId),
      dashboardRepository.getTopMembers(conferenceId),
      dashboardRepository.getCategoriesStats(conferenceId)
    ]);

    // 3. جلب بيانات الإثراء بالتوازي (Teams / Members / Categories)
    const [teams, members, categories] = await Promise.all([
      teamRepository.findByConferenceId(conferenceId),
      memberRepository.findManyByIds(rawTopMembers.map(m => m.memberId)),
      categoryRepository.findByConferenceId(conferenceId) // كل الفئات، مش بس اللي ليها نقاط
    ]);

    // إثراء بيانات الفرق (Ranking)
    const teamMap = new Map(teams.map(t => [t.id, t]));
    const ranking = rawRanking.map((item, index) => {
      const team = teamMap.get(item.teamId);
      return {
        rank: index + 1,
        teamName: team?.name || 'Unknown',
        teamColor: team?.color || '#000000',
        totalPoints: item._sum.points || 0
      };
    });

    // إثراء بيانات المخدومين (Top Members)
    const memberMap = new Map(members.map(m => [m.id, m]));
    const topMembers = rawTopMembers.map((item, index) => {
      const member = memberMap.get(item.memberId);
      return {
        rank: index + 1,
        memberName: member?.name || 'Unknown',
        teamName: member?.team?.name || 'Unknown',
        totalPoints: item._sum.points || 0
      };
    });

    // إثراء بيانات الفئات (Category Distribution)
    // نبدأ من كل الفئات الخاصة بالمؤتمر، مش من rawCategories
    // عشان الفئات اللي مالهاش نقاط تظهر برضو بـ totalPoints = 0
    const pointsMap = new Map(rawCategories.map(c => [c.categoryId, c._sum.points || 0]));
    const categoryStats = categories.map(cat => ({
      name: cat.name,
      color: cat.color || '#cccccc',
      icon: cat.icon || 'star',
      totalPoints: pointsMap.get(cat.id) || 0
    }));

    return {
      summary,
      ranking,
      topMembers,
      categoryStats
    };
  }
}

module.exports = new DashboardService();