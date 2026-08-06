import { prisma } from '../../lib/prisma.js';
import { PrismaClientKnownRequestError } from '../../generated/prisma/internal/prismaNamespace.js';
import { ConflictError, NotFoundError } from '../../errors/errors.js';
import { generateShortCode } from './short-code.js';

type CreateInput = {
  url: string;
  shortCode?: string;
  creatorId: string;
};

export async function create({ url, shortCode, creatorId }: CreateInput) {
  const MAX_ATTEMPTS = 5;

  if (shortCode) {
    const existingLink = await prisma.link.findUnique({
      where: { shortCode },
    });

    if (existingLink) {
      throw new ConflictError(
        'A link with the specified short code already exists.'
      );
    }
  } else {
    shortCode = generateShortCode();
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const link = await prisma.link.create({
        data: {
          originalUrl: url,
          shortCode,
          creatorId,
        },
      });

      return link;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new Error('Failed to generate a unique short code.');
}

export async function getOriginalUrl(shortCode: string) {
  const link = await prisma.link.findUnique({
    where: { shortCode },
  });

  if (!link) {
    throw new NotFoundError('Link not found.');
  }

  return link.originalUrl;
}

export async function getAllForUser(userId: string) {
  const links = await prisma.link.findMany({
    where: { creatorId: userId },
  });

  return links;
}

export async function getOne(linkId: string, userId: string) {
  const link = await prisma.link.findFirst({
    where: {
      id: linkId,
      creatorId: userId
    },
  });

  if (!link) {
    throw new NotFoundError('Link not found.');
  }

  return link;
}

export async function remove(linkId: string, userId: string) {
  const link = await prisma.link.findFirst({
    where: {
      id: linkId,
      creatorId: userId
    },
  });

  if (!link) {
    throw new NotFoundError('Link not found.');
  }

  try {
    await prisma.link.delete({
      where: { id: linkId },
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundError('Link not found.');
    }

    throw error;
  }
}

export const linkService = {
  create,
  getOriginalUrl,
  getAllForUser,
  getOne,
  delete: remove,
};