const transactionService = require('../services/transactionService');
const { createTransactionSchema } = require('../validators/transaction.schema');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

exports.createTransaction = asyncHandler(async (req, res) => {
  const validatedData = createTransactionSchema.parse(req.body);
  const transaction = await transactionService.addTransaction(
    req.params.conferenceId, 
    validatedData, 
    req.user.id
  );
  success(res, 'تم تسجيل النقاط بنجاح', { transaction }, 201);
});

exports.deleteTransaction = asyncHandler(async (req, res) => {
  await transactionService.softDeleteTransaction(req.params.id, req.user.id);
  success(res, 'تم إلغاء العملية بنجاح');
});