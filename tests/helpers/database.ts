import { prisma } from '../../src/lib/prisma.js';

export async function clearDatabase() {
  await prisma.link.deleteMany();
  await prisma.user.deleteMany();
}