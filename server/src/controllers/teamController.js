const teamService = require('../services/teamService');
const { createTeamSchema } = require('../validators/team.schema');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

exports.createTeam = asyncHandler(async (req, res) => {
  const validatedData = createTeamSchema.parse(req.body);
  const team = await teamService.createTeam(req.params.conferenceId, validatedData, req.user.id);
  success(res, 'تم إنشاء الفريق بنجاح', { team }, 201);
});

exports.getConferenceTeams = asyncHandler(async (req, res) => {
  const teams = await teamService.getConferenceTeams(req.params.conferenceId);
  success(res, 'قائمة فرق المؤتمر', { teams });
});