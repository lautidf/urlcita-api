import { randomUUID } from 'node:crypto';
import { prisma } from '../../src/lib/prisma.js';
import { hashPassword } from '../../src/modules/auth/password.js';

function randomString() {
  return randomUUID();
}

export async function createUser(password?: string) {
  console.log(password);
  if (!password) password = 'Password123!';
  console.log(password);
  const passwordHash = await hashPassword(password);

  const dbUser = await prisma.user.create({
    data: {
      email: `${randomString()}@example.com`,
      name: 'Test User',
      passwordHash,
    }
  });
  
  const user = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    password,
  };
  
  return user;
}