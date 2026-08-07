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

export const getOneParamsSchema = z.object({
  id: z.cuid2(),
});

export const getOneRequestSchema = z.object({
  params: getOneParamsSchema,
});

export const removeParamsSchema = z.object({
  id: z.cuid2(),
});

export const removeRequestSchema = z.object({
  params: removeParamsSchema,
});

export const getStatisticsParamsSchema = z.object({
  id: z.cuid2(),
});

export const getStatisticsRequestSchema = z.object({
  params: getStatisticsParamsSchema,
});