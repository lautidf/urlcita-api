import z from 'zod';

const shortCodeSchema = z.string().regex(/^[a-zA-Z0-9]+$/).length(6);

const linkIdSchema = z.cuid2();

export const createRequestSchema = z.object({
  body: z.object({
    url: z.url(),
    shortCode: shortCodeSchema.optional(),
  })
});

export const redirectRequestSchema = z.object({
  params: z.object({
    shortCode: shortCodeSchema
  })
});

export const getOneRequestSchema = z.object({
  params: z.object({
    id: linkIdSchema
  })
});

export const removeRequestSchema = z.object({
  params: z.object({
    id: linkIdSchema
  })
});

export const getStatisticsRequestSchema = z.object({
  params: z.object({
    id: linkIdSchema
  })
});