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

    // 3. حل مشكلة N+1 وتحسين الأداء باستخدام الـ Maps
    
    // إثراء بيانات الفرق (Ranking)
    const teams = await teamRepository.findByConferenceId(conferenceId);
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
    const memberIds = rawTopMembers.map(m => m.memberId);
    const members = await memberRepository.findManyByIds(memberIds);
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
    const categoryIds = rawCategories.map(c => c.categoryId);
    const categories = await categoryRepository.findManyByIds(categoryIds);
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const categoryStats = rawCategories.map(item => {
      const cat = categoryMap.get(item.categoryId);
      return {
        name: cat?.name || 'Unknown',
        color: cat?.color || '#cccccc',
        icon: cat?.icon || 'star',
        totalPoints: item._sum.points || 0
      };
    });

    return {
      summary,
      ranking,
      topMembers,
      categoryStats
    };
  }
}

module.exports = new DashboardService();