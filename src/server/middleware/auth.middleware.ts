import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../../lib/auth';
import prisma from '../../lib/db';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): any {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const cookieToken = req.cookies?.facielis_token;
    const token = bearerToken || cookieToken;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }

    req.user = payload;
    next();
  } catch (error: any) {
    return res.status(500).json({ error: 'Authentication middleware error: ' + error.message });
  }
}

export function requireRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. User session missing.' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. Role '${req.user.role}' is not authorized to perform this operation. Required: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
}

export async function logAuditEvent({
  organizationId,
  userId,
  action,
  entityType,
  entityId,
  details,
  req,
}: {
  organizationId?: string | null;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  req?: Request;
}) {
  try {
    const ipAddress = (req?.headers['x-forwarded-for'] as string) || req?.socket?.remoteAddress || '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        organizationId: organizationId || null,
        userId: userId || null,
        action,
        entityType,
        entityId,
        detailsJson: details ? JSON.stringify(details) : null,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.substring(0, 45) : null,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
