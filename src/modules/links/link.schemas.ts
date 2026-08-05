import z from 'zod';

const shortCodeSchema = z.string().regex(/^[a-zA-Z0-9]+$/).length(6);

export const createBodySchema = z.object({
  url: z.url(),
  shortCode: shortCodeSchema.optional(),
});

export const createRequestSchema = z.object({
  body: createBodySchema,
});

export const redirectParamsSchema = z.object({
  shortCode: shortCodeSchema,
});

export const redirectRequestSchema = z.object({
  params: redirectParamsSchema,
});