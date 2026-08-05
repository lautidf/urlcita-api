import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('POST /links', () => {
  it('should create a new link', async () => {
    const url = 'https://example.com';

    const response = await request(app)
      .post('/links')
      .send({ url });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('shortCode');
    expect(response.body.originalUrl).toBe(url);

    const link = await prisma.link.findUnique({
      where: { id : response.body.id }
    });

    expect(link).not.toBeNull();
    expect(link?.originalUrl).toBe(url);
  });
});