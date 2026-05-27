import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env.js';

export type AuthenticatedRequest = Request & {
  userId: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;
  const headerUserId = req.header('x-user-id');

  if (bearerToken) {
    try {
      const payload = jwt.verify(bearerToken, env.JWT_SECRET);
      if (typeof payload === 'object' && typeof payload.sub === 'string') {
        (req as AuthenticatedRequest).userId = payload.sub;
        return next();
      }
    } catch {
      return res.status(401).json({ message: 'Invalid or expired access token' });
    }
  }

  if (headerUserId && Types.ObjectId.isValid(headerUserId)) {
    (req as AuthenticatedRequest).userId = headerUserId;
    return next();
  }

  return res.status(401).json({ message: 'Authentication required' });
}
