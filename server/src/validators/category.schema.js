const { z } = require('zod');

exports.createCategorySchema = z.object({
  name: z.string().min(2, "الاسم قصير جداً"),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().optional().default(0)
});

exports.updateCategorySchema = exports.createCategorySchema.partial();