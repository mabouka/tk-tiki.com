import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';

const state = {
  users: [] as any[],
  boards: [] as any[],
  contactMessages: [] as any[],
  claims: [] as any[]
};

vi.mock('../src/prisma', () => {
  const prisma = {
    user: {
      findUnique: vi.fn(async ({ where }) => state.users.find((u) => u.email === where.email || u.id === where.id) ?? null),
      create: vi.fn(async ({ data }) => {
        const user = { id: `u${state.users.length + 1}`, role: 'USER', ...data };
        state.users.push(user);
        return user;
      })
    },
    board: {
      findUnique: vi.fn(async ({ where }) => state.boards.find((b) => b.publicId === where.publicId) ?? null),
      updateMany: vi.fn(async ({ where, data }) => {
        const board = state.boards.find((b) => b.id === where.id && b.status === where.status && b.ownerUserId === where.ownerUserId);
        if (!board) return { count: 0 };
        Object.assign(board, data);
        return { count: 1 };
      })
    },
    boardClaim: {
      create: vi.fn(async ({ data }) => {
        const claim = { id: `c${state.claims.length + 1}`, ...data };
        state.claims.push(claim);
        return claim;
      })
    },
    scanLog: {
      create: vi.fn(async () => ({}))
    },
    contactMessage: {
      create: vi.fn(async ({ data }) => {
        const msg = { id: `m${state.contactMessages.length + 1}`, ...data };
        state.contactMessages.push(msg);
        return msg;
      }),
      update: vi.fn(async ({ where, data }) => {
        const msg = state.contactMessages.find((m) => m.id === where.id);
        if (msg) Object.assign(msg, data);
        return msg;
      })
    },
    $transaction: vi.fn(async (cb) => cb(prisma))
  };

  return { prisma };
});

vi.mock('../src/services/mail', () => ({
  sendOwnerContactEmail: vi.fn(async () => undefined)
}));

describe('API flows', () => {
  beforeEach(async () => {
    state.users.length = 0;
    state.boards.length = 0;
    state.contactMessages.length = 0;
    state.claims.length = 0;

    state.users.push({
      id: 'owner-1',
      email: 'owner@tk.com',
      passwordHash: await bcrypt.hash('User12345!', 10),
      role: 'USER'
    });

    state.boards.push({
      id: 'board-1',
      publicId: 'a3r34R',
      serialNumber: 'SN001',
      status: 'unclaimed',
      isPublic: true,
      ownerUserId: null,
      publicUrl: 'https://tk.com/board/a3r34R',
      boardVariant: {
        id: 'v1',
        sizeCm: 156,
        widthCm: 42,
        notes: null,
        boardModel: { code: 'TK01', name: 'TK 01', description: null }
      },
      ownerUser: null
    });
  });

  it('register and login', async () => {
    const { app } = await import('../src/app');

    const reg = await request(app).post('/api/auth/register').send({
      email: 'new@tk.com',
      password: 'Strong123!',
      name: 'New User'
    });

    expect(reg.status).toBe(201);
    expect(reg.body.user.email).toBe('new@tk.com');

    const login = await request(app).post('/api/auth/login').send({
      email: 'owner@tk.com',
      password: 'User12345!'
    });

    expect(login.status).toBe(200);
    expect(login.body.user.email).toBe('owner@tk.com');
  });

  it('public board endpoint', async () => {
    const { app } = await import('../src/app');
    const res = await request(app).get('/api/boards/a3r34R/public');

    expect(res.status).toBe(200);
    expect(res.body.board.publicId).toBe('a3r34R');
    expect(res.body.board.variant.model.code).toBe('TK01');
  });

  it('claim flow', async () => {
    const { app } = await import('../src/app');
    const userReg = await request(app).post('/api/auth/register').send({
      email: 'claim@tk.com',
      password: 'Strong123!'
    });

    const cookie = userReg.headers['set-cookie'][0];

    const claim = await request(app).post('/api/boards/a3r34R/claim').set('Cookie', cookie).send({});

    expect(claim.status).toBe(201);
    expect(state.boards[0].ownerUserId).toBeTruthy();
    expect(state.boards[0].status).toBe('active');
  });

  it('contact form flow', async () => {
    const { app } = await import('../src/app');
    state.boards[0].ownerUserId = 'owner-1';
    state.boards[0].ownerUser = state.users[0];
    state.boards[0].status = 'active';

    const res = await request(app).post('/api/boards/a3r34R/contact').send({
      senderName: 'Finder Person',
      senderEmail: 'finder@example.com',
      message: 'I found your board near the north beach.',
      locationText: 'North beach',
      website: ''
    });

    expect(res.status).toBe(201);
    expect(state.contactMessages.length).toBe(1);
    expect(state.contactMessages[0].senderName).toBe('Finder Person');
  });
});
