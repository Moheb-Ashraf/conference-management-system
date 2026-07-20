const teamService = require('../services/teamService');
const { createTeamSchema } = require('../validators/team.schema');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

exports.update = asyncHandler(async (req, res) => {
  const team = await teamService.updateTeam(req.params.id, req.body, req.user.id);
  success(res, 'تم تحديث الفريق بنجاح', { team });
});

exports.createTeam = asyncHandler(async (req, res) => {
  const validatedData = createTeamSchema.parse(req.body);
  const team = await teamService.createTeam(req.params.conferenceId, validatedData, req.user.id);
  success(res, 'تم إنشاء الفريق بنجاح', { team }, 201);
});

exports.getConferenceTeams = asyncHandler(async (req, res) => {
  const teams = await teamService.getConferenceTeams(req.params.conferenceId);
  success(res, 'قائمة فرق المؤتمر', { teams });
});

exports.delete = asyncHandler(async (req, res) => {
  const team = await teamService.deleteTeam(req.params.id, req.user.id);
  success(res, 'تم حذف الفريق بنجاح', { team });
});