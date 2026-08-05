import { prisma } from '../../lib/prisma.js';
import { PrismaClientKnownRequestError } from '../../generated/prisma/internal/prismaNamespace.js';
import { ConflictError } from '../../errors/errors.js';
import { generateShortCode } from './short-code.js';

export async function create(url: string, shortCode?: string) {
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

export const linkService = {
  create,
};