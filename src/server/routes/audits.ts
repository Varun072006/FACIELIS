import { Router, Response } from 'express';
import prisma from '../../lib/db';
import { createDefectFromInspection } from '../../engines/defect.engine';
import { calculateAuditScores } from '../../engines/score.engine';
import { generateFacilityCertificate } from '../../engines/certificate.engine';
import { broadcastNotification } from '../socket';
import { authenticate, requireRoles, logAuditEvent, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all audit routes
router.use(authenticate);

// GET /api/audits
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const auditorId = req.query.auditorId as string | undefined;
    const status = req.query.status as string | undefined;
    const organizationId = req.user?.organizationId;

    const where: any = { deletedAt: null };
    if (organizationId) where.organizationId = organizationId;
    if (auditorId) where.auditorId = auditorId;
    if (status) where.status = status;

    const audits = await prisma.audit.findMany({
      where,
      include: {
        venue: {
          include: {
            floor: {
              include: { building: true },
            },
          },
        },
        auditor: true,
        inspectionItems: {
          select: { id: true },
        },
        score: true,
        certificate: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.setHeader('Cache-Control', 'private, max-age=5, stale-while-revalidate=30');
    return res.json(audits);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/audits
router.post('/', requireRoles('SUPER_ADMIN', 'MANAGER'), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { venueId, auditorId, managerId, scheduledDate, startTime, dueDate } = req.body || {};
    const organizationId = req.user?.organizationId;

    if (!venueId || !auditorId) {
      return res.status(400).json({ error: 'Venue ID and Auditor ID are required' });
    }

    const count = await prisma.audit.count();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const auditNo = `AUD-${dateStr}-${String(count + 1).padStart(3, '0')}`;

    const parsedScheduled = new Date(scheduledDate || Date.now());
    const parsedStart = startTime ? new Date(startTime) : parsedScheduled;
    const parsedDue = dueDate ? new Date(dueDate) : new Date(parsedStart.getTime() + 86400000 * 3);

    const audit = await prisma.audit.create({
      data: {
        auditNo,
        venueId,
        organizationId: organizationId || null,
        auditorId,
        managerId: managerId || req.user?.userId || null,
        scheduledDate: parsedScheduled,
        startTime: parsedStart,
        dueDate: parsedDue,
        status: 'SCHEDULED',
      },
      include: {
        venue: true,
        auditor: true,
      },
    });

    await logAuditEvent({
      organizationId,
      userId: req.user?.userId,
      action: 'AUDIT_SCHEDULED',
      entityType: 'Audit',
      entityId: audit.id,
      details: { auditNo: audit.auditNo, venueId: audit.venueId, auditorId: audit.auditorId },
      req,
    });

    return res.json(audit);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/audits/:id
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;

    const audit = await prisma.audit.findUnique({
      where: { id },
      include: {
        venue: {
          include: {
            assets: {
              where: { deletedAt: null },
              include: {
                components: { where: { deletedAt: null } },
                assetCategory: {
                  include: { referenceImages: true },
                },
              },
              orderBy: { serialNo: 'asc' },
            },
            floor: { include: { building: true } },
            crossAuditQuestions: true,
          },
        },
        auditor: true,
        inspectionItems: {
          include: {
            defect: { include: { department: true, repair: true } },
            component: true,
          },
        },
        score: true,
        certificate: true,
      },
    });

    if (!audit || audit.deletedAt) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    return res.json(audit);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/audits/:id/inspect - Atomic Batch Inspection Processing
router.post('/:id/inspect', requireRoles('SUPER_ADMIN', 'MANAGER', 'AUDITOR'), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const auditId = req.params.id as string;
    const { items, isComplete, gpsLat, gpsLng, deviceInfo } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Inspection items array is required' });
    }

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: { venue: true },
    });

    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    // Atomic execution with Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Clear any prior draft items for this audit to prevent duplicates
      await tx.inspectionItem.deleteMany({
        where: { auditId },
      });

      const createdInspectionItems = [];

      for (const item of items) {
        const { assetId, componentId, status, photoUrl, geotagLat, geotagLng, remark } = item;
        const normalizedStatus = (status === 'DEFECTIVE' || status === 'FAIL') ? 'FAIL' : 'PASS';

        const inspectionItem = await tx.inspectionItem.create({
          data: {
            auditId,
            assetId,
            componentId,
            status: normalizedStatus,
            photoUrl: photoUrl || null,
            geotagLat: geotagLat || null,
            geotagLng: geotagLng || null,
            remark: remark || null,
          },
        });

        createdInspectionItems.push(inspectionItem);
      }

      const updateData: any = {
        status: isComplete ? 'PENDING_REVIEW' : 'IN_PROGRESS',
        gpsLat: gpsLat || null,
        gpsLng: gpsLng || null,
        deviceInfo: deviceInfo || null,
      };

      if (isComplete) {
        updateData.completedDate = new Date();
      }

      await tx.audit.update({
        where: { id: auditId },
        data: updateData,
      });

      return createdInspectionItems;
    });

    // Create defect records asynchronously for failed items using rule engine
    const failedItems = items.filter((i: any) => i.status === 'DEFECTIVE' || i.status === 'FAIL');
    for (const failedItem of failedItems) {
      const dbItem = result.find((r) => r.componentId === failedItem.componentId);
      if (dbItem) {
        await createDefectFromInspection(
          dbItem.id,
          failedItem.assetId,
          failedItem.componentId,
          failedItem.componentName || 'Component',
          failedItem.remark || 'Defect detected during audit'
        );
      }
    }

    if (failedItems.length > 0) {
      broadcastNotification('room:role:MANAGER', 'notification:new', {
        title: `🚨 ${failedItems.length} Defects Logged in ${audit.venue.name}`,
        message: `Auditor submitted checklist with ${failedItems.length} defects requiring routing.`,
        type: 'DEFECT',
        timestamp: new Date().toISOString(),
      });
    }

    if (isComplete) {
      await calculateAuditScores(auditId);

      broadcastNotification('room:role:MANAGER', 'notification:new', {
        title: '📋 Inspection Checklist Submitted',
        message: `Auditor submitted checklist for audit ${audit.auditNo}. Awaiting sign-off.`,
        type: 'AUDIT',
        timestamp: new Date().toISOString(),
      });

      await logAuditEvent({
        organizationId: req.user?.organizationId,
        userId: req.user?.userId,
        action: 'AUDIT_SUBMITTED',
        entityType: 'Audit',
        entityId: auditId,
        details: { totalItems: items.length, defectCount: failedItems.length },
        req,
      });
    }

    return res.json({
      success: true,
      itemsCount: result.length,
      defectCount: failedItems.length,
      status: isComplete ? 'PENDING_REVIEW' : 'IN_PROGRESS',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/audits/:id/approve
router.post('/:id/approve', requireRoles('SUPER_ADMIN', 'MANAGER'), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const auditId = req.params.id as string;
    const { assignments, managerId } = req.body || {};

    const existingAudit = await prisma.audit.findUnique({ where: { id: auditId } });
    if (!existingAudit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    if (existingAudit.status !== 'PENDING_REVIEW') {
      return res.status(400).json({ error: 'Audit must be in PENDING_REVIEW status for manager sign-off' });
    }

    // Process manual technician assignments if provided
    if (Array.isArray(assignments) && assignments.length > 0) {
      for (const assign of assignments) {
        if (assign.defectId && assign.technicianId) {
          await prisma.defect.update({
            where: { id: assign.defectId },
            data: {
              technicianId: assign.technicianId,
              assignedAt: new Date(),
              status: 'ASSIGNED',
            },
          });

          broadcastNotification(`room:user:${assign.technicianId}`, 'notification:new', {
            title: '⚡ New Repair Job Assigned',
            message: `Manager assigned you to repair defect ${assign.defectId.substring(0, 8)}.`,
            type: 'ASSIGNMENT',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // Complete audit
    const audit = await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        managerId: managerId || req.user?.userId || null,
      },
      include: {
        score: true,
        certificate: true,
        inspectionItems: { include: { defect: true } },
      },
    });

    // Auto-generate certified facility certificate
    const cert = await generateFacilityCertificate(auditId, req.user?.userId);

    await logAuditEvent({
      organizationId: req.user?.organizationId,
      userId: req.user?.userId,
      action: 'AUDIT_APPROVED',
      entityType: 'Audit',
      entityId: auditId,
      details: { certificateNo: cert?.certificateNo, overallScore: cert?.overallScore, status: cert?.fitnessStatus },
      req,
    });

    broadcastNotification('room:role:OWNER', 'notification:new', {
      title: '🏆 Facility Audit Approved & Certified',
      message: `Manager signed off audit for your venue. Fitness score: ${cert?.overallScore}% (${cert?.fitnessStatus})`,
      type: 'CERTIFICATE',
      timestamp: new Date().toISOString(),
    });

    return res.json({ success: true, audit });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/audits/:id/reject
router.post('/:id/reject', requireRoles('SUPER_ADMIN', 'MANAGER'), async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const auditId = req.params.id as string;
    const { reason } = req.body || {};

    const audit = await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'IN_PROGRESS',
      },
    });

    await logAuditEvent({
      organizationId: req.user?.organizationId,
      userId: req.user?.userId,
      action: 'AUDIT_REJECTED_TO_AUDITOR',
      entityType: 'Audit',
      entityId: auditId,
      details: { reason: reason || 'Audit checklist returned for revisions' },
      req,
    });

    return res.json({ success: true, audit });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/audits/:id/missed-feedback
router.post('/:id/missed-feedback', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const auditId = req.params.id as string;
    const { reason } = req.body || {};

    const audit = await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'MISSED',
        missedReason: reason || 'Audit window expired without completion',
        missedAt: new Date(),
      },
      include: {
        venue: true,
        auditor: true,
      },
    });

    await logAuditEvent({
      organizationId: req.user?.organizationId,
      userId: req.user?.userId,
      action: 'AUDIT_MISSED_LOGGED',
      entityType: 'Audit',
      entityId: auditId,
      details: { reason: audit.missedReason },
      req,
    });

    return res.json({ success: true, audit });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
