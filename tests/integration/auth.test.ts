import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';
import { createUser } from '../helpers/user.js';

describe('POST /register', () => {
  it('creates a new user', async () => {
    await request(app)
      .post('/register')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!'
      })
      .expect(201);

      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
      });

      expect(user).not.toBeNull();
  });

  it('rejects duplicate emails', async () => {
    const existingUser = await createUser();

    await request(app)
      .post('/register')
      .send({
        email: existingUser.email,
        name: 'Duplicate User',
        password: 'Password123!'
      })
      .expect(409)

    const user = await prisma.user.findFirst({
      where: { name: 'Duplicate User' }
    });

    expect(user).toBeNull();
  });
});

describe('POST /login', () => {
  it('returns a JWT for valid credentials', async () => {
    const user = await createUser();
    console.log(user.password);

    const response = await request(app)
      .post('/login')
      .send({
        email: user.email,
        password: user.password
      })
      .expect(200)

    expect(response.body).toHaveProperty('token');
  });

  it('rejects invalid credentials', async () => {
    const password = 'Password123!';
    const wrongPassword = 'WrongPassword123!';
    
    const user = await createUser(password);

    await request(app)
      .post('/login')
      .send({
        email: user.email,
        password: wrongPassword
      })
      .expect(401)
  });
});