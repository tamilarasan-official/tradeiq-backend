import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(3),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  email: z.email(),
  panNumber: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/),
  password: z.string().min(8),
  studyGroup: z.enum(['APP', 'CONTROL', 'NONE']).default('APP'),
});

const googleSchema = z.object({
  firebaseUid: z.string().min(3),
  email: z.email(),
  fullName: z.string().min(1).default('TradeIQ Investor'),
  mobile: z.string().optional(),
});

function createAccessToken(userId: unknown) {
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, {
    expiresIn: '365d',
  });
}

router.post('/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await User.create({
      ...input,
      authProvider: 'PASSWORD',
      passwordHash,
    });
    res.status(201).json({
      accessToken: createAccessToken(user._id),
      userId: user._id,
      kycStatus: user.kycStatus,
      user,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = z
      .object({ identifier: z.string(), password: z.string() })
      .parse(req.body);
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }],
    });

    if (!user || !(await bcrypt.compare(password, String(user.passwordHash)))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ accessToken: createAccessToken(user._id), user });
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const input = googleSchema.parse(req.body);
    const user = await User.findOneAndUpdate(
      { $or: [{ firebaseUid: input.firebaseUid }, { email: input.email }] },
      {
        $set: {
          firebaseUid: input.firebaseUid,
          email: input.email,
          fullName: input.fullName,
          mobile: input.mobile,
          authProvider: 'GOOGLE',
        },
        $setOnInsert: {
          studyGroup: 'APP',
          kycStatus: 'PENDING',
          biometricEnabled: false,
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.json({ accessToken: createAccessToken(user._id), user });
  } catch (error) {
    next(error);
  }
});

router.post('/google-login', async (req, res, next) => {
  try {
    const input = googleSchema.parse(req.body);
    const user = await User.findOne({
      $or: [{ firebaseUid: input.firebaseUid }, { email: input.email }],
    });

    if (!user) {
      return res.status(404).json({
        code: 'ACCOUNT_REQUIRED',
        message: 'Create your TradeIQ account before using Google sign-in.',
      });
    }

    user.firebaseUid = input.firebaseUid;
    user.authProvider = 'GOOGLE';
    if (!user.fullName && input.fullName) {
      user.fullName = input.fullName;
    }
    await user.save();

    res.json({ accessToken: createAccessToken(user._id), user });
  } catch (error) {
    next(error);
  }
});

router.post('/otp/send', (_req, res) => {
  res.json({ message: 'OTP provider placeholder configured' });
});

router.post('/otp/verify', (_req, res) => {
  res.json({ verified: true });
});

router.post('/refresh', (_req, res) => {
  res.status(501).json({ message: 'Refresh token rotation pending' });
});

router.post('/logout', (_req, res) => {
  res.status(204).send();
});

router.post('/mpin/set', (_req, res) => {
  res.status(501).json({ message: 'MPIN setup pending' });
});

router.post('/mpin/verify', (_req, res) => {
  res.json({ verified: true });
});

export default router;
