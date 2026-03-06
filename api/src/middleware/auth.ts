import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { HttpError } from '../utils/http';
import { AuthPayload } from '../types';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthPayload;
  }
}

function readToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return req.cookies?.token;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) {
    return next(new HttpError(401, 'Authentication required'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.auth = payload;
    return next();
  } catch {
    return next(new HttpError(401, 'Invalid authentication token'));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) {
    return next(new HttpError(401, 'Authentication required'));
  }

  if (req.auth.role !== Role.ADMIN) {
    return next(new HttpError(403, 'Admin role required'));
  }

  return next();
}
