import { prisma } from '../../src/lib/prisma.js';
import { generateShortCode } from '../../src/modules/links/short-code.js';

export async function create() {
  const link = await prisma.link.create({
    data: {
      originalUrl: 'https://example.com',
      shortCode: generateShortCode(),
    },
  });

  return link;
}