const { z } = require('zod');

exports.createReasonSchema = z.object({
  text: z.string().min(2, "نص السبب قصير جداً"),
  defaultPoints: z.number().int(),
  isPositive: z.boolean().default(true)
});

exports.updateReasonSchema = exports.createReasonSchema.partial();