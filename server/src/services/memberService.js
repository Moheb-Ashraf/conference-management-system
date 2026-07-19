const prisma = require('../config/prisma');
const memberRepository = require('../repositories/memberRepository');
const teamRepository = require('../repositories/teamRepository');
const auditRepository = require('../repositories/auditRepository');
const AppError = require('../utils/appError');
const { CREATE, UPDATE } = require('../constants/auditActions');
const { MEMBER } = require('../constants/entityTypes');

class MemberService {
  async createMember(teamId, data, userId) {
    return await prisma.$transaction(async (tx) => {
      // 1. التحقق من وجود الفريق داخل الـ Transaction
      const team = await teamRepository.findById(teamId, tx);
      if (!team) throw new AppError('الفريق غير موجود', 404);

      // 2. إنشاء المخدوم (Pure CRUD)
      const member = await memberRepository.create({ ...data, teamId }, tx);

      // 3. تسجيل في الـ Audit Log
      await auditRepository.create({
        userId,
        action: CREATE,
        entityType: MEMBER,
        entityId: member.id,
        newValue: member
      }, tx);

      return member;
    });
  }

  async getTeamMembers(teamId) {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new AppError('الفريق غير موجود', 404);
    
    return await memberRepository.findByTeamId(teamId);
  }

  async getMemberById(id) {
    const member = await memberRepository.findById(id);
    if (!member) throw new AppError('المخدوم غير موجود', 404);
    return member;
  }
}

module.exports = new MemberService();