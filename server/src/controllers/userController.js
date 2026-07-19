const userService = require('../services/userService');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  success(res, 'قائمة المستخدمين', { users });
});

exports.create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  success(res, 'تم إنشاء الحساب بنجاح', { user }, 201);
});