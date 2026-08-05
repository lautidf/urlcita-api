import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';
import { create } from '../helpers/link.js';

describe('POST /links', () => {
  it('creates a new link', async () => {
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

  it('creates a link with a custom short code', async () => {
    const url = 'https://example.com';
    const shortCode = 'cust0m';

    const response = await request(app)
      .post('/links')
      .send({ url, shortCode });

    expect(response.status).toBe(201);
    expect(response.body.originalUrl).toBe(url);
    expect(response.body.shortCode).toBe(shortCode);

    const link = await prisma.link.findUnique({
      where: { id : response.body.id }
    });

    expect(link).not.toBeNull();
    expect(link?.originalUrl).toBe(url);
    expect(link?.shortCode).toBe(shortCode);
  });

  it('rejects request if short code already exists', async () => {
    const existingLink = await create();

    const response = await request(app)
      .post('/links')
      .send({
        url: 'https://example.com',
        shortCode: existingLink.shortCode
      });

    expect(response.status).toBe(409);
  });
});

describe('GET /:shortCode', () => {
  it('redirects to the original URL', async () => {
    const link = await create();

    const response = await request(app)
      .get(`/${link.shortCode}`);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(link.originalUrl);
  });
  
  it('returns 404 if short code does not exist', async () => {
    const response = await request(app)
      .get('/badc0d');

    expect(response.status).toBe(404);
  });
});