import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../prisma';
import { env } from '../config/env';
import { asyncHandler, HttpError } from '../utils/http';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const oauthSchema = z.object({
  provider: z.enum(['google', 'facebook', 'apple']),
  providerAccountId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(120).optional()
});

function signToken(userId: string, role: Role) {
  return jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res: any, token: string) {
  const isProd = env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new HttpError(409, 'Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name }
    });

    const token = signToken(user.id, user.role);
    setAuthCookie(res, token);

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  })
);

router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpError(401, 'Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, 'Invalid credentials');
    }

    const token = signToken(user.id, user.role);
    setAuthCookie(res, token);

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  })
);

router.post(
  '/oauth',
  validateBody(oauthSchema),
  asyncHandler(async (req, res) => {
    const { email, name } = req.body;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash
        }
      });
    }

    const token = signToken(user.id, user.role);
    setAuthCookie(res, token);

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  })
);

router.post(
  '/logout',
  asyncHandler(async (_req, res) => {
    const isProd = env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd
    });
    res.json({ success: true });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    res.json({ user });
  })
);

export default router;
