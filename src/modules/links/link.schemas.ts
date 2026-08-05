import z from 'zod';

export const createBodySchema = z.object({
  url: z.url(),
  shortCode: z.string().regex(/^[a-zA-Z0-9]+$/).length(6).optional(),
});

export const createRequestSchema = z.object({
  body: createBodySchema,
});