import z from 'zod';

export const createBodySchema = z.object({
  url: z.url(),
});

export const createRequestSchema = z.object({
  body: createBodySchema,
});