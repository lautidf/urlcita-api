import { Request, Response } from 'express';
import { createRequestSchema } from './link.schemas.js';
import { linkService } from './link.service.js';

export async function create(req: Request, res: Response) {
  const { body } = createRequestSchema.parse(req);

  const { url } = body;

  const link = await linkService.create(url);

  res.status(201).json(link);
}