import { Router, Request, Response } from 'express';
import prisma from '../../lib/db';
import { createDefectFromInspection } from '../../engines/defect.engine';
import { autoAssignTechnician } from '../../engines/assignment.engine';
import { calculateAuditScores } from '../../engines/score.engine';
import { generateFacilityCertificate } from '../../engines/certificate.engine';

const router = Router();

// GET /api/audits
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const auditorId = req.query.auditorId as string | undefined;
    const status = req.query.status as string | undefined;

    const where: any = {};
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
          include: { defect: true },
        },
        score: true,
        certificate: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(audits);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/audits
router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { venueId, auditorId, managerId, scheduledDate, startTime, dueDate } = req.body || {};

    const count = await prisma.audit.count();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const auditNo = `AUD-${dateStr}-${String(count + 1).padStart(3, '0')}`;

    const parsedScheduled = new Date(scheduledDate || Date.now());
    const parsedStart = startTime ? new Date(startTime) : parsedScheduled;
    const parsedDue = dueDate ? new Date(dueDate) : new Date(parsedStart.getTime() + 86400000 * 3); // Default 3 days

    const audit = await prisma.audit.create({
      data: {
        auditNo,
        venueId,
        auditorId,
        managerId: managerId || null,
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

    return res.json(audit);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/audits/:id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;

    const audit = await prisma.audit.findUnique({
      where: { id },
      include: {
        venue: {
          include: {
            assets: {
              include: {
                components: true,
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

    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    return res.json(audit);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/audits/:id/inspect
router.post('/:id/inspect', async (req: Request, res: Response): Promise<any> => {
  try {
    const auditId = req.params.id as string;
    const { items, isComplete } = req.body || {};

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const createdItems = [];

    for (const item of items) {
      const { assetId, componentId, componentName, status, photoUrl, geotagLat, geotagLng, remark } = item;
      const normalizedStatus = (status === 'DEFECTIVE' || status === 'FAIL') ? 'FAIL' : 'PASS';

      const inspectionItem = await prisma.inspectionItem.create({
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

      if (normalizedStatus === 'FAIL') {
        await createDefectFromInspection(
          inspectionItem.id,
          assetId,
          componentId,
          componentName || 'Component',
          remark || 'Defect detected during audit'
        );
        // Defect remains OPEN for manual manager technician assignment
      }

      createdItems.push(inspectionItem);
    }

    if (isComplete) {
      await prisma.audit.update({
        where: { id: auditId },
        data: {
          status: 'PENDING_REVIEW',
          completedDate: new Date(),
        },
      });

      await calculateAuditScores(auditId);
    } else {
      await prisma.audit.update({
        where: { id: auditId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return res.json({ success: true, itemsCount: createdItems.length, status: isComplete ? 'PENDING_REVIEW' : 'IN_PROGRESS' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/audits/:id/approve
router.post('/:id/approve', async (req: Request, res: Response): Promise<any> => {
  try {
    const auditId = req.params.id as string;
    const { assignments, managerId } = req.body || {};

    const existingAudit = await prisma.audit.findUnique({ where: { id: auditId } });
    if (!existingAudit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    if (existingAudit.status !== 'PENDING_REVIEW') {
      return res.status(400).json({ error: 'Audit must be submitted by auditor before manager can approve' });
    }

    // Update technician assignments if specified by manager
    if (Array.isArray(assignments) && assignments.length > 0) {
      for (const assign of assignments) {
        if (assign.defectId && assign.technicianId) {
          await prisma.defect.update({
            where: { id: assign.defectId },
            data: {
              technicianId: assign.technicianId,
              status: 'ASSIGNED',
            },
          });
        }
      }
    }

    // Update audit status to COMPLETED
    const audit = await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        managerId: managerId || null,
      },
      include: {
        score: true,
        certificate: true,
        inspectionItems: { include: { defect: true } },
      },
    });

    // Generate facility certificate upon manager sign-off
    await generateFacilityCertificate(auditId);

    const updatedAudit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: {
        score: true,
        certificate: true,
        inspectionItems: { include: { defect: true } },
      },
    });

    return res.json({ success: true, audit: updatedAudit });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/audits/:id/reject
router.post('/:id/reject', async (req: Request, res: Response): Promise<any> => {
  try {
    const auditId = req.params.id as string;

    const audit = await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'IN_PROGRESS',
      },
    });

    return res.json({ success: true, audit });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/audits/:id/missed-feedback
router.post('/:id/missed-feedback', async (req: Request, res: Response): Promise<any> => {
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

    return res.json({ success: true, audit });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
