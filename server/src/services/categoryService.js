const prisma = require('../config/prisma');
const categoryRepository = require('../repositories/categoryRepository');
const reasonRepository = require('../repositories/reasonRepository');
const conferenceRepository = require('../repositories/conferenceRepository');
const auditRepository = require('../repositories/auditRepository');
const AppError = require('../utils/appError');
const { CREATE, UPDATE, DELETE, ARCHIVE } = require('../constants/auditActions');
const { CATEGORY, REASON } = require('../constants/entityTypes');

class CategoryService {
  async createCategory(conferenceId, data, userId) {
    return await prisma.$transaction(async (tx) => {
      // التحقق داخل الـ Transaction لضمان الـ Isolation
      const conference = await conferenceRepository.findById(conferenceId, tx);
      if (!conference) throw new AppError('المؤتمر غير موجود', 404);

      const category = await categoryRepository.create({ ...data, conferenceId }, tx);
      
      await auditRepository.create({
        userId, action: CREATE, entityType: CATEGORY, entityId: category.id, newValue: category
      }, tx);
      
      return category;
    });
  }

  async updateCategory(id, data, userId) {
    return await prisma.$transaction(async (tx) => {
      const oldCategory = await categoryRepository.findById(id, tx);
      if (!oldCategory) throw new AppError('الفئة غير موجودة', 404);

      const updated = await categoryRepository.update(id, data, tx);

      await auditRepository.create({
        userId, action: UPDATE, entityType: CATEGORY, entityId: id, oldValue: oldCategory, newValue: updated
      }, tx);
      
      return updated;
    });
  }

  async archiveCategory(id, userId) {
    return await prisma.$transaction(async (tx) => {
      const category = await categoryRepository.findById(id, tx);
      if (!category) throw new AppError('الفئة غير موجودة', 404);

      // أرشفتها (بفرض وجود حقل isActive أو status)
      const archived = await categoryRepository.update(id, { isActive: false }, tx);

      await auditRepository.create({
        userId, action: ARCHIVE, entityType: CATEGORY, entityId: id
      }, tx);

      return archived;
    });
  }

  async addReason(categoryId, data, userId) {
    return await prisma.$transaction(async (tx) => {
      const category = await categoryRepository.findById(categoryId, tx);
      if (!category) throw new AppError('الفئة غير موجودة', 404);

      const reason = await reasonRepository.create({ ...data, categoryId }, tx);
      
      await auditRepository.create({
        userId, action: CREATE, entityType: REASON, entityId: reason.id, newValue: reason
      }, tx);
      
      return reason;
    });
  }

  async getConferenceCategories(conferenceId) {
    // التحقق من وجود المؤتمر أولاً
    const conference = await conferenceRepository.findById(conferenceId);
    if (!conference) throw new AppError('المؤتمر غير موجود', 404);
    
    return await categoryRepository.findByConferenceId(conferenceId);
  }
}
module.exports = new CategoryService();