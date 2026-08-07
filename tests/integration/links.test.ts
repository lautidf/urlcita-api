import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';
import { createLink } from '../helpers/link.js';
import { createAuthenticatedUser } from '../helpers/auth.js';
import { createUser } from '../helpers/user.js';
import { createId } from '@paralleldrive/cuid2';
import { createClick } from '../helpers/click.js';

function randomCUID() {
  return createId();
}

describe('POST /links', () => {
  it('rejects unauthenticated requests', async () => {
    const response = await request(app)
      .post('/links')
      .send({ url: 'https://example.com' });

    expect(response.status).toBe(401);
  });
  
  it('creates a new link', async () => {
    const { token } = await createAuthenticatedUser();
    const url = 'https://example.com';

    const response = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${token}`)
      .send({ url });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('shortCode');
    expect(response.body.originalUrl).toBe(url);

    const link = await prisma.link.findUnique({
      where: { id : response.body.id }
    });

    expect(link).not.toBeNull();
    expect(link?.originalUrl).toBe(url);
  });

  it('creates a link with a custom short code', async () => {
    const { token } = await createAuthenticatedUser();
    const url = 'https://example.com';
    const shortCode = 'cust0m';

    const response = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${token}`)
      .send({ url, shortCode });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
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
    const { token } = await createAuthenticatedUser();
    const existingLink = await createLink();

    const response = await request(app)
      .post('/links')
      .set('Authorization', `Bearer ${token}`)
      .send({
        url: 'https://example.com',
        shortCode: existingLink.shortCode
      });

    expect(response.status).toBe(409);
  });
});

describe('GET /:shortCode', () => {
  it('redirects to the original URL', async () => {
    const link = await createLink();

    const response = await request(app)
      .get(`/${link.shortCode}`);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(link.originalUrl);
  });

  it('records a click', async () => {
    const link = await createLink();

    await request(app)
      .get(`/${link.shortCode}`);

    const click = await prisma.click.findFirst({
      where: { linkId: link.id }
    });

    expect(click).not.toBeNull();
  });

  it('returns 404 if short code does not exist', async () => {
    const response = await request(app)
      .get('/badc0d');

    expect(response.status).toBe(404);
  });
});

describe('GET /links', () => {
  it('rejects unauthenticated requests', async () => {
    const response = await request(app)
      .get('/links');

    expect(response.status).toBe(401);
  });

  it('returns all links for the authenticated user', async () => {
    const { token, user } = await createAuthenticatedUser();
    const link1 = await createLink(user.id);
    const link2 = await createLink(user.id);

    const response = await request(app)
      .get('/links')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: link1.id,
        originalUrl: link1.originalUrl,
        shortCode: link1.shortCode,
        createdAt: link1.createdAt.toISOString()
      },
      {
        id: link2.id,
        originalUrl: link2.originalUrl,
        shortCode: link2.shortCode,
        createdAt: link2.createdAt.toISOString()
      }
    ]);
  });

  it('does not return links for other users', async () => {
    const { token } = await createAuthenticatedUser();
    const otherUser = await createUser();
    const otherUserLink = await createLink(otherUser.id);

    const response = await request(app)
      .get('/links')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: otherUserLink.id })
      ])
    );
  });

  it('returns an empty array if the user has no links', async () => {
    const { token } = await createAuthenticatedUser();

    const response = await request(app)
      .get('/links')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe('GET /links/:id', () => {
  it('rejects unauthenticated requests', async () => {
    const response = await request(app)
      .get('/links/1');

    expect(response.status).toBe(401);
  });
  
  it('returns the link if it belongs to the authenticated user', async () => {
    const { token, user } = await createAuthenticatedUser();
    const link = await createLink(user.id);

    const response = await request(app)
      .get(`/links/${link.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: link.id,
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      createdAt: link.createdAt.toISOString()
    });
  });
  
  it(
    'returns 404 if the link does not belong to the authenticated user', async () => {
    const { token } = await createAuthenticatedUser();
    const otherUser = await createUser();
    const otherUserLink = await createLink(otherUser.id);

    const response = await request(app)
      .get(`/links/${otherUserLink.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it('returns 404 if the link does not exist', async () => {
    const { token } = await createAuthenticatedUser();
    const response = await request(app)
      .get(`/links/${randomCUID()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});

describe('DELETE /links/:id', () => {
  it('rejects unauthenticated requests', async () => {
    const response = await request(app)
      .delete('/links/1');

    expect(response.status).toBe(401);
  });
  
  it('deletes the link if it belongs to the authenticated user', async () => {
    const { token, user } = await createAuthenticatedUser();
    const link = await createLink(user.id);

    const response = await request(app)
      .delete(`/links/${link.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);

    const deletedLink = await prisma.link.findUnique({
      where: { id: link.id }
    });

    expect(deletedLink).toBeNull();
  });
  
  it('returns 404 if the link does not belong to the authenticated user', async () => {
    const { token } = await createAuthenticatedUser();
    const otherUser = await createUser();
    const otherUserLink = await createLink(otherUser.id);

    const response = await request(app)
      .delete(`/links/${otherUserLink.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it('returns 404 if the link does not exist', async () => {
    const { token } = await createAuthenticatedUser();
    const response = await request(app)
      .delete(`/links/${randomCUID()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});

describe('GET /links/:id/stats', () => {
  it('rejects unauthenticated requests', async () => {
    const response = await request(app)
      .get('/links/1/stats');

    expect(response.status).toBe(401);
  });

  it('returns statistics for a link with no clicks', async () => {
    const { token, user } = await createAuthenticatedUser();
    const link = await createLink(user.id);

    const response = await request(app)
      .get(`/links/${link.id}/stats`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalClicks: 0,
      lastClickAt: null,
      clicksByDate: []
    });
  });

  it('returns statistics for a link with clicks', async () => {
    const { token, user } = await createAuthenticatedUser();
    const link = await createLink(user.id);
    await createClick(link.id, new Date('2026-08-01T00:00:00.000Z'));
    await createClick(link.id, new Date('2026-08-01T00:00:01.000Z'));
    await createClick(link.id, new Date('2026-08-03'));

    const response = await request(app)
      .get(`/links/${link.id}/stats`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalClicks: 3,
      lastClickAt: '2026-08-03T00:00:00.000Z',
      clicksByDate: [
        { date: '2026-08-01', clicks: 2 },
        { date: '2026-08-03', clicks: 1 }
      ]
    });
  });

  it('returns 404 if the link does not belong to the authenticated user', async () => {
    const { token } = await createAuthenticatedUser();
    const otherUser = await createUser();
    const otherUserLink = await createLink(otherUser.id);

    const response = await request(app)
      .get(`/links/${otherUserLink.id}/stats`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it('returns 404 if the link does not exist', async () => {
    const { token } = await createAuthenticatedUser();
    const response = await request(app)
      .get(`/links/${randomCUID()}/stats`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});