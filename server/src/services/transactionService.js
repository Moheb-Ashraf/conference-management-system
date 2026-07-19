const prisma = require('../config/prisma');
const transactionRepository = require('../repositories/transactionRepository');
const memberRepository = require('../repositories/memberRepository');
const teamRepository = require('../repositories/teamRepository');
const auditRepository = require('../repositories/auditRepository');
const AppError = require('../utils/appError');
const { getIO } = require('../config/socket'); // استيراد محرك السوكيت
const { CREATE, ARCHIVE } = require('../constants/auditActions');
const { TRANSACTION } = require('../constants/entityTypes');
const { MEMBER } = require('../constants/transactionSources');

class TransactionService {
  /**
   * إضافة عملية نقاط جديدة (لعضو أو لفريق)
   */
  async addTransaction(conferenceId, data, userId) {
    // 1. تنفيذ العملية داخل Transaction لضمان النزاهة
    const transaction = await prisma.$transaction(async (tx) => {
      
      // أ. التحقق من أن الفريق ينتمي لهذا المؤتمر (Security Scoping)
      const team = await teamRepository.findById(data.teamId, tx);
      if (!team || team.conferenceId !== conferenceId) {
        throw new AppError('هذا الفريق لا ينتمي للمؤتمر المحدد', 400);
      }

      // ب. إذا كانت النقاط لمخدوم، نتحقق من تبعيته للفريق
      if (data.source === MEMBER && data.memberId) {
        const member = await memberRepository.findById(data.memberId, tx);
        if (!member || member.teamId !== data.teamId) {
          throw new AppError('هذا المخدوم لا ينتمي للفريق المحدد', 400);
        }
      }

      // ج. تسجيل العملية في جدول الـ Transactions
      const newTransaction = await transactionRepository.create({
        ...data,
        conferenceId,
        createdById: userId
      }, tx);

      // د. تسجيل في الـ Audit Log للرقابة
      await auditRepository.create({
        userId,
        action: CREATE,
        entityType: TRANSACTION,
        entityId: newTransaction.id,
        newValue: newTransaction
      }, tx);

      return newTransaction;
    });

    // 2. إطلاق حدث Real-time بعد نجاح التخزين في قاعدة البيانات
    try {
      const io = getIO();
      io.to(conferenceId).emit('points_updated', {
        message: 'تم تحديث النقاط بنجاح',
        teamId: transaction.teamId,
        points: transaction.points,
        source: transaction.source
      });
    } catch (socketError) {
      console.error('⚠️ Socket emit failed, but transaction was successful:', socketError);
    }

    return transaction;
  }

  /**
   * إلغاء عملية نقاط (Soft Delete)
   */
  async softDeleteTransaction(id, userId) {
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      
      // أ. جلب البيانات القديمة للـ Audit وللتأكد من وجودها
      const oldTransaction = await transactionRepository.findById(id, tx);
      if (!oldTransaction) {
        throw new AppError('العملية غير موجودة', 404);
      }

      // ب. تحديث الحالة إلى "محذوف" بدلاً من المسح الفيزيائي
      const updated = await transactionRepository.update(id, { 
        isDeleted: true,
        deletedAt: new Date()
      }, tx);

      // ج. تسجيل الـ Audit مع حفظ الحالة القديمة والجديدة
      await auditRepository.create({
        userId,
        action: ARCHIVE,
        entityType: TRANSACTION,
        entityId: id,
        oldValue: oldTransaction,
        newValue: updated
      }, tx);

      return updated;
    });

    // د. إرسال تنبيه للسوكيت لإعادة حساب الإجمالي في المتصفح (عكس النقاط)
    try {
      const io = getIO();
      io.to(updatedTransaction.conferenceId).emit('points_updated', {
        message: 'تم إلغاء عملية نقاط',
        teamId: updatedTransaction.teamId,
        points: -updatedTransaction.points, // نرسل القيمة بالسالب لعكس العملية في الفرونت إند
        source: updatedTransaction.source,
        isDeletion: true
      });
    } catch (socketError) {
      console.error('⚠️ Socket emit failed:', socketError);
    }

    return updatedTransaction;
  }
}

module.exports = new TransactionService();