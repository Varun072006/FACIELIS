import { Router, Request, Response } from 'express';
import prisma from '../../lib/db';
import { comparePassword, signToken, verifyToken } from '../../lib/auth';
import { logAuditEvent } from '../middleware/auth.middleware';

const router = Router();

// In-memory brute force protection: max 10 failed attempts per 15 minutes per IP
const loginRateLimitMap = new Map<string, { failedAttempts: number; resetTime: number }>();
const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const rateRecord = loginRateLimitMap.get(clientIp);
  if (rateRecord && rateRecord.resetTime > now && rateRecord.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    const minutesLeft = Math.ceil((rateRecord.resetTime - now) / 60000);
    return res.status(429).json({
      error: `Too many failed login attempts from this IP. Please try again in ${minutesLeft} minute(s).`,
    });
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true, building: true, ownedVenues: true, organization: true },
    });

    if (!user || user.deletedAt) {
      // Record failed attempt
      const current = loginRateLimitMap.get(clientIp) || { failedAttempts: 0, resetTime: now + LOCKOUT_WINDOW_MS };
      loginRateLimitMap.set(clientIp, {
        failedAttempts: current.failedAttempts + 1,
        resetTime: current.resetTime > now ? current.resetTime : now + LOCKOUT_WINDOW_MS,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      // Record failed attempt
      const current = loginRateLimitMap.get(clientIp) || { failedAttempts: 0, resetTime: now + LOCKOUT_WINDOW_MS };
      loginRateLimitMap.set(clientIp, {
        failedAttempts: current.failedAttempts + 1,
        resetTime: current.resetTime > now ? current.resetTime : now + LOCKOUT_WINDOW_MS,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset rate limiter on successful authentication
    loginRateLimitMap.delete(clientIp);

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      departmentId: user.departmentId,
    });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('facielis_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProd ? 'strict' : 'lax',
      secure: isProd,
    });

    // Log successful login
    await logAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      req,
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
        department: user.department?.name,
        departmentId: user.departmentId,
        venueId: user.ownedVenues?.[0]?.id || null,
      },
      token,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('facielis_token', {
    path: '/',
    sameSite: isProd ? 'strict' : 'lax',
    secure: isProd,
  });
  return res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const cookieToken = req.cookies?.facielis_token;
    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { department: true, building: true, ownedVenues: true, organization: true },
    });

    if (!user || user.deletedAt) {
      return res.status(404).json({ error: 'User not found or deactivated' });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization?.name,
        department: user.department?.name,
        departmentId: user.departmentId,
        venueId: user.ownedVenues?.[0]?.id || null,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
