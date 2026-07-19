const { z } = require('zod');

exports.createTransactionSchema = z.object({
  points: z.number().int("النقاط يجب أن تكون رقماً صحيحاً"),
  source: z.enum(['MEMBER', 'TEAM']),
  notes: z.string().optional(),
  customReason: z.string().optional(),
  
  teamId: z.string().uuid("معرف الفريق غير صالح"),
  memberId: z.string().uuid("معرف المخدوم غير صالح").optional().nullable(),
  categoryId: z.string().uuid("معرف الفئة غير صالح"),
  reasonId: z.string().uuid("معرف السبب غير صالح").optional().nullable(),
});