const { z } = require('zod');

const createConferenceSchema = z.object({
  name: z.string().min(1, 'اسم المؤتمر مطلوب'),
  theme: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional()
});

const updateConferenceSchema = createConferenceSchema.partial();

module.exports = {
  createConferenceSchema,
  updateConferenceSchema
};
