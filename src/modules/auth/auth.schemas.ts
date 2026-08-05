import z from 'zod';

export const registerUserBodySchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  password: z.string().min(8)
});

export const registerUserRequestSchema = z.object({
  body: registerUserBodySchema
});

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});

export const loginRequestSchema = z.object({
  body: loginBodySchema
});