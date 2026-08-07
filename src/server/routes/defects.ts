import { Router, Request, Response } from 'express';
import prisma from '../../lib/db';
import { checkAndUpdateOverdueDefects } from '../../engines/sla.engine';

const router = Router();

// GET /api/defects
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const technicianId = req.query.technicianId as string | undefined;
    const departmentId = req.query.departmentId as string | undefined;
    const status = req.query.status as string | undefined;

    // Run SLA check asynchronously
    checkAndUpdateOverdueDefects().catch(() => {});

    const where: any = {};
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
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
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

    if (!defect) return res.status(404).json({ error: 'Defect not found' });

    return res.json(defect);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/defects/:id & PUT /api/defects/:id
const updateDefectHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { technicianId, status } = req.body || {};

    const updateData: any = {};
    if (technicianId) {
      updateData.technicianId = technicianId;
      updateData.status = 'ASSIGNED';
    }
    if (status) updateData.status = status;

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

    return res.json(defect);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

router.patch('/:id', updateDefectHandler);
router.put('/:id', updateDefectHandler);

export default router;
