import { Request, Response } from 'express';
import { createRequestSchema, getOneRequestSchema, redirectRequestSchema, removeRequestSchema } from './link.schemas.js';
import { linkService } from './link.service.js';

export async function create(req: Request, res: Response) {
  const { body } = createRequestSchema.parse(req);
  const { user } = req;

  const { url, shortCode } = body;

  const link = await linkService.create({
    url,
    shortCode,
    creatorId: user.id
  });

  res.status(201).json(link);
}

export async function redirect(req: Request, res: Response) {
  const { params } = redirectRequestSchema.parse(req);

  const { shortCode } = params;

  const originalUrl = await linkService.getOriginalUrl(shortCode);

  res.redirect(originalUrl);
}

export async function getAllForUser(req: Request, res: Response) {
  const { user } = req;

  const links = await linkService.getAllForUser(user.id);

  res.status(200).json(links);
}

export async function getOne(req: Request, res: Response) {
  const { params } = getOneRequestSchema.parse(req);

  const { id } = params;

  const link = await linkService.getOne(id, req.user.id);

  res.status(200).json(link);
}

export async function remove(req: Request, res: Response) {
  const { params } = removeRequestSchema.parse(req);

  const { id } = params;

  await linkService.delete(id, req.user.id);

  res.status(204).send();
}