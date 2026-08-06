import { prisma } from '../../src/lib/prisma.js';
import { generateShortCode } from '../../src/modules/links/short-code.js';
import { createUser } from './user.js';

export async function createLink(creatorId?: string) {
  const link = await prisma.link.create({
    data: {
      originalUrl: 'https://example.com',
      shortCode: generateShortCode(),
      creatorId: creatorId || (await createUser().then(user => user.id)),
    },
  });

  return link;
}