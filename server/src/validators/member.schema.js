const { z } = require('zod');

exports.createMemberSchema = z.object({
  name: z.string().min(3, "اسم المخدوم يجب أن يكون 3 أحرف على الأقل"),
  code: z.string().optional(),
  phone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  birthDate: z.string().optional().transform(val => val ? new Date(val) : null),
  church: z.string().optional()
});

exports.updateMemberSchema = exports.createMemberSchema.partial();