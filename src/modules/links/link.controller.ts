import { Request, Response } from 'express';
import { createRequestSchema, redirectRequestSchema } from './link.schemas.js';
import { linkService } from './link.service.js';

export async function create(req: Request, res: Response) {
  const { body } = createRequestSchema.parse(req);

  const { url, shortCode } = body;

  const link = await linkService.create(url, shortCode);

  res.status(201).json(link);
}

export async function redirect(req: Request, res: Response) {
  const { params } = redirectRequestSchema.parse(req);

  const { shortCode } = params;

  const originalUrl = await linkService.getOriginalUrl(shortCode);

  res.redirect(originalUrl);
}