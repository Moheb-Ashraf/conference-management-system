const conferenceService = require('../services/conferenceService');
const { createConferenceSchema, updateConferenceSchema } = require('../validators/conference.schema');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createConferenceSchema.parse(req.body);
  const conference = await conferenceService.createConference(validatedData, req.user.id);
  success(res, 'تم إنشاء المؤتمر بنجاح', { conference }, 201);
});

exports.getAll = asyncHandler(async (req, res) => {
  const conferences = await conferenceService.getAllConferences(req.user.id, req.user.role);
  success(res, 'قائمة المؤتمرات المتاحة', { conferences });
});

exports.getOne = asyncHandler(async (req, res) => {
  const conference = await conferenceService.getConferenceById(req.params.id);
  success(res, 'تفاصيل المؤتمر', { conference });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = updateConferenceSchema.parse(req.body);
  const conference = await conferenceService.updateConference(req.params.id, validatedData, req.user.id);
  success(res, 'تم تحديث المؤتمر بنجاح', { conference });
});

exports.archive = asyncHandler(async (req, res) => {
  const conference = await conferenceService.archiveConference(req.params.id, req.user.id);
  success(res, 'تم أرشفة المؤتمر بنجاح', { conference });
});
