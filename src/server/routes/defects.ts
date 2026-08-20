import { Router, Response } from 'express';
import prisma from '../../lib/db';
import { checkAndUpdateOverdueDefects } from '../../engines/sla.engine';
import { authenticate, requireRoles, logAuditEvent, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication to all defect routes
router.use(authenticate);

// GET /api/defects
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const technicianId = req.query.technicianId as string | undefined;
    const departmentId = req.query.departmentId as string | undefined;
    const status = req.query.status as string | undefined;
    const organizationId = req.user?.organizationId;

    // Run background SLA check
    checkAndUpdateOverdueDefects().catch(() => {});

    const where: any = { deletedAt: null };
    if (organizationId) where.organizationId = organizationId;
    if (technicianId) where.technicianId = technicianId;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const defects = await prisma.defect.findMany({
      where,
      include: {
        asset: {
          include: { venue: true },
        },
        component: true,
        department: true,
        technician: true,
        inspectionItem: true,
        repair: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.setHeader('Cache-Control', 'private, max-age=5, stale-while-revalidate=30');
    return res.json(defects);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/defects/:id
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;

    const defect = await prisma.defect.findUnique({
      where: { id },
      include: {
        asset: { include: { venue: true } },
        component: true,
        department: true,
        technician: true,
        inspectionItem: true,
        repair: { include: { technician: true } },
      },
    });

    if (!defect || defect.deletedAt) return res.status(404).json({ error: 'Defect not found' });

    return res.json(defect);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/defects/:id & PUT /api/defects/:id
const updateDefectHandler = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { technicianId, status, laborHours, repairCost, reopenedReason } = req.body || {};

    const existing = await prisma.defect.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Defect not found' });

    const updateData: any = {};
    let auditAction = 'DEFECT_UPDATED';

    if (technicianId) {
      updateData.technicianId = technicianId;
      updateData.assignedAt = new Date();
      updateData.status = 'ASSIGNED';
      auditAction = 'DEFECT_ASSIGNED';
    }

    if (status) {
      updateData.status = status;
      if (status === 'VERIFIED') auditAction = 'DEFECT_VERIFIED_CLOSED';
      if (status === 'REOPENED') {
        auditAction = 'DEFECT_REOPENED';
        updateData.reopenedReason = reopenedReason || 'Manager rejected repair proof';
      }
    }

    if (laborHours !== undefined) updateData.laborHours = parseFloat(laborHours) || null;
    if (repairCost !== undefined) updateData.repairCost = parseFloat(repairCost) || null;

    const defect = await prisma.defect.update({
      where: { id },
      data: updateData,
      include: {
        asset: { include: { venue: true } },
        component: true,
        department: true,
        technician: true,
        inspectionItem: true,
        repair: { include: { technician: true } },
      },
    });

    await logAuditEvent({
      organizationId: req.user?.organizationId,
      userId: req.user?.userId,
      action: auditAction,
      entityType: 'Defect',
      entityId: id,
      details: {
        defectNo: defect.defectNo,
        newStatus: defect.status,
        technicianId: defect.technicianId,
        reopenedReason: defect.reopenedReason,
      },
      req,
    });

    return res.json(defect);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

router.patch('/:id', requireRoles('SUPER_ADMIN', 'MANAGER', 'TECHNICIAN'), updateDefectHandler);
router.put('/:id', requireRoles('SUPER_ADMIN', 'MANAGER', 'TECHNICIAN'), updateDefectHandler);

export default router;
