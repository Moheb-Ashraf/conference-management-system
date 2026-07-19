const { z } = require('zod');

exports.createTeamSchema = z.object({
  name: z.string().min(2, "اسم الفريق قصير جداً"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "كود اللون غير صالح").optional(),
  icon: z.string().optional()
});

exports.updateTeamSchema = exports.createTeamSchema.partial();