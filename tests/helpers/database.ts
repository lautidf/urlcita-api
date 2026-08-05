import { prisma } from '../../src/lib/prisma';

export async function clearDatabase() {
  await prisma.link.deleteMany();
}