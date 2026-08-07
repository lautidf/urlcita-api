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
        select: {
          id: true,
          originalUrl: true,
          shortCode: true,
        }
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

export async function resolveAndRecordClick(shortCode: string) {
  const link = await prisma.link.findUnique({
    where: { shortCode },
  });

  if (!link) {
    throw new NotFoundError('Link not found.');
  }

  await prisma.click.create({
    data: {
      linkId: link.id
    }
  });

  return link.originalUrl;
}

export async function getAllForUser(userId: string) {
  const links = await prisma.link.findMany({
    where: {
      creatorId: userId
    },
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      createdAt: true,
    }
  });

  return links;
}

export async function getById(linkId: string, userId: string) {
  const link = await prisma.link.findFirst({
    where: {
      id: linkId,
      creatorId: userId
    },
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      createdAt: true,
    }
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

export async function getStatistics(linkId: string, userId: string) {
  const link = await prisma.link.findFirst({
    where: {
      id: linkId,
      creatorId: userId
    },
  });

  if (!link) {
    throw new NotFoundError('Link not found.');
  }
  
  const totalClicks = await prisma.click.count({
    where: {
      linkId
    }
  });

  const lastClick = await prisma.click.findFirst({
    where: {
      linkId
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      createdAt: true
    }
  });
  
  const clicksByDateResult = await prisma.$queryRaw<
    { date: Date; clicks: bigint }[]
  >`
  SELECT
    date_trunc('day', "createdAt") AS date,
    COUNT(*) AS clicks
  FROM "Click"
  WHERE "linkId" = ${linkId}
  GROUP BY date
  ORDER BY date;
  `;

  const clicksByDate = clicksByDateResult.map((row) => ({
    date: row.date.toISOString().split('T')[0],
    clicks: Number(row.clicks),
  }));

  const lastClickAt = lastClick ? lastClick.createdAt : null;
  
  const statistics = {
    totalClicks,
    lastClickAt,
    clicksByDate,
  }

  return statistics;
}

export const linkService = {
  create,
  resolveAndRecordClick,
  getAllForUser,
  getById,
  delete: remove,
  getStatistics,
};