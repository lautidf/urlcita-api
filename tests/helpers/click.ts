import { prisma } from '../../src/lib/prisma.js';

export async function createClick(linkId: string, date: Date = new Date()) {
  const click = await prisma.click.create({
    data: {
      linkId,
      createdAt: date
    }
  });

  return click;
}