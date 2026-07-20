const memberService = require('../services/memberService');
const { createMemberSchema } = require('../validators/member.schema');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

exports.update = asyncHandler(async (req, res) => {
  const member = await memberService.updateMember(req.params.id, req.body, req.user.id);
  success(res, 'تم تحديث المخدوم بنجاح', { member });
});

exports.createMember = asyncHandler(async (req, res) => {
  const validatedData = createMemberSchema.parse(req.body);
  const member = await memberService.createMember(req.params.teamId, validatedData, req.user.id);
  success(res, 'تم إضافة المخدوم بنجاح', { member }, 201);
});

exports.getTeamMembers = asyncHandler(async (req, res) => {
  const members = await memberService.getTeamMembers(req.params.teamId);
  success(res, 'قائمة مخدومين الفريق', { members });
});

exports.getMember = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberById(req.params.id);
  success(res, 'بيانات المخدوم', { member });
});

exports.delete = asyncHandler(async (req, res) => {
  const member = await memberService.deleteMember(req.params.id, req.user.id);
  success(res, 'تم حذف المخدوم بنجاح', { member });
});