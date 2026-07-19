const dashboardService = require('../services/dashboardService');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

exports.getDashboardData = asyncHandler(async (req, res) => {
  const { conferenceId } = req.params;
  const stats = await dashboardService.getConferenceStats(conferenceId);
  success(res, 'بيانات لوحة التحكم', stats);
});