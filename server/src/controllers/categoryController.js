const categoryService = require('../services/categoryService');
const { createCategorySchema, updateCategorySchema } = require('../validators/category.schema');
const { createReasonSchema, updateReasonSchema } = require('../validators/reason.schema');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

exports.createCategory = asyncHandler(async (req, res) => {
  const validatedData = createCategorySchema.parse(req.body);
  const category = await categoryService.createCategory(req.params.conferenceId, validatedData, req.user.id);
  success(res, 'تم إنشاء الفئة بنجاح', { category }, 201);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const validatedData = updateCategorySchema.parse(req.body);
  const category = await categoryService.updateCategory(req.params.id, validatedData, req.user.id);
  success(res, 'تم تحديث الفئة بنجاح', { category });
});

exports.createReason = asyncHandler(async (req, res) => {
  const validatedData = createReasonSchema.parse(req.body);
  const reason = await categoryService.addReason(req.params.categoryId, validatedData, req.user.id);
  success(res, 'تم إضافة السبب بنجاح', { reason }, 201);
});

exports.updateReason = asyncHandler(async (req, res) => {
  const validatedData = updateReasonSchema.parse(req.body);
  const reason = await categoryService.updateReason(req.params.id, validatedData, req.user.id);
  success(res, 'تم تحديث السبب بنجاح', { reason });
});

exports.getConferenceCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getConferenceCategories(req.params.conferenceId);
  success(res, 'فئات النقاط للمؤتمر', { categories });
});
exports.archiveCategory = asyncHandler(async (req, res) => {
  await categoryService.archiveCategory(req.params.id, req.user.id);
  success(res, 'تم أرشفة الفئة بنجاح');
});