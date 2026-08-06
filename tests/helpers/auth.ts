import { generateAccessToken } from '../../src/modules/auth/jwt.js';
import { createUser } from './user.js';

export async function createAuthenticatedUser() {
  const user = await createUser();

  const token = generateAccessToken(user.id, user.email);

  return {
    user,
    token
  };
}