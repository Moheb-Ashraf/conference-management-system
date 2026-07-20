const reportService = require('../services/reportService');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

exports.getTransactionHistory = asyncHandler(async (req, res) => {
  const { conferenceId } = req.params;
  // استلام الفلاتر من الـ Query Params
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    teamId: req.query.teamId,
    memberId: req.query.memberId,
    categoryId: req.query.categoryId,
    createdById: req.query.createdById
  };

  const report = await reportService.getFullTransactionHistory(conferenceId, filters);
  success(res, 'تقرير سجل العمليات', report);
});

exports.getDailyReport = asyncHandler(async (req, res) => {
  const { conferenceId } = req.params;
  const report = await reportService.getDailyStats(conferenceId);
  success(res, 'تقرير النشاط اليومي', report);
});

exports.getMemberBehaviorSummary = asyncHandler(async (req, res) => {
  const { conferenceId, memberId } = req.params;
  const report = await reportService.getMemberBehaviorSummary(conferenceId, memberId);
  success(res, 'ملخص سلوك المخدوم', report);
});

exports.getTeamBehaviorSummary = asyncHandler(async (req, res) => {
  const { conferenceId, teamId } = req.params;
  const report = await reportService.getTeamBehaviorSummary(conferenceId, teamId);
  success(res, 'ملخص أداء الفريق', report);
});

exports.getTeamsComparison = asyncHandler(async (req, res) => {
  const { conferenceId } = req.params;
  const report = await reportService.getTeamsComparison(conferenceId);
  success(res, 'مقارنة الفرق', report);
});