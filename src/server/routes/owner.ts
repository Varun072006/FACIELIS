import { Router, Request, Response } from 'express';
import prisma from '../../lib/db';
import { broadcastNotification } from '../socket';

const router = Router();

const DEFAULT_OWNER_QUESTIONS = [
  { question: 'Are all main entry door locks, handles, and hinges operating smoothly without sticking?', category: 'Doors & Security' },
  { question: 'Are all 6 sliding glass windows free of cracks and opening/closing cleanly on their rails?', category: 'Windows & Glazing' },
  { question: 'Are window curtain fabrics clean, unfrayed, and properly mounted on support rods?', category: 'Furniture & Fixtures' },
  { question: 'Are all 10 4-seater tables free of surface damage, sharp edges, or wobbling legs?', category: 'Furniture & Fixtures' },
  { question: 'Are left-end electrical switch boxes on 4-seater tables receiving proper power output?', category: 'Electrical & Power' },
  { question: 'Are right-end electrical switch boxes on 4-seater tables securely mounted without loose wiring?', category: 'Electrical & Power' },
  { question: 'Are internal switch box cables insulated with no exposed wires under 4-seater tables?', category: 'Electrical Safety' },
  { question: 'Are all 10 2-seater tables intact with cable grommet pass-throughs cleanly fitted?', category: 'Furniture & Fixtures' },
  { question: 'Are electrical socket ports on 2-seater tables delivering stable power to equipment?', category: 'Electrical & Power' },
  { question: 'Are all 60 ergonomic mesh chairs fully functional with hydraulic height adjustment working?', category: 'Seating & Ergonomics' },
  { question: 'Are all armrests and backrest lumbar supports on office chairs sturdy and undamaged?', category: 'Seating & Ergonomics' },
  { question: 'Are 5-star swivel casters on all chairs rolling smoothly across tiled flooring?', category: 'Seating & Ergonomics' },
  { question: 'Are all 20 workstation PC monitors displaying clear crisp visuals without screen flickering?', category: 'IT & Workstations' },
  { question: 'Are all CPU towers powering up quietly with cooling fans operating normally?', category: 'IT & Workstations' },
  { question: 'Are optical mice and mechanical keyboards responsive on all 20 computer stations?', category: 'IT & Workstations' },
  { question: 'Are Cat6 Ethernet network cables securely clipped into wall/table data ports with connectivity?', category: 'Network Infrastructure' },
  { question: 'Is the enterprise WiFi Access Point router powered on with active indicator LEDs?', category: 'Network Infrastructure' },
  { question: 'Is wireless internet coverage strong and accessible across all seating areas in the cabin?', category: 'Network Infrastructure' },
  { question: 'Is the main tiled floor surface swept, mopped, and free from spills or cracked tiles?', category: 'Housekeeping & Hygiene' },
  { question: 'Are skirting boards and floor borders clean without accumulated dust or grime?', category: 'Housekeeping & Hygiene' },
  { question: 'Are false ceiling tiles aligned flush in their grid without water stain discoloration?', category: 'Structural Ceiling' },
  { question: 'Is the split AC unit cooling effectively and maintaining set temperature reliably?', category: 'HVAC & Climate' },
  { question: 'Is the AC condensate water drain pipe running clear without dripping into the cabin interior?', category: 'HVAC & Climate' },
  { question: 'Is the AC remote controller functioning with clear LCD screen and fresh batteries?', category: 'HVAC & Climate' },
  { question: 'Are all 6 ceiling fans running smoothly without unusual motor noise or wobble at high speed?', category: 'Electrical & Fans' },
  { question: 'Are wall speed regulators for all ceiling fans adjusting speed levels accurately?', category: 'Electrical & Fans' },
  { question: 'Are all 20 LED ceiling light fixtures illuminating brightly without dead bulbs or flickering?', category: 'Lighting' },
  { question: 'Are main electrical panel switch box MCB circuit breakers labeled and free of tripping?', category: 'Electrical Panel' },
  { question: 'Is the network laser printer online, loaded with paper, and free from paper jams?', category: 'Office Equipment' },
  { question: 'Are facility emergency exit signage and cabin safety instructions clearly visible?', category: 'Safety & Compliance' },
];

async function createDynamicBatch(venueId: string, managerId?: string | null) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 15);

  const newBatch = await prisma.ownerQuestionBatch.create({
    data: {
      venueId,
      managerId: managerId || null,
      status: 'ACTIVE',
      expiresAt,
    },
  });

  for (const q of DEFAULT_OWNER_QUESTIONS) {
    await prisma.ownerQuestion.create({
      data: {
        batchId: newBatch.id,
        question: q.question,
        category: q.category,
      },
    });
  }

  return prisma.ownerQuestionBatch.findUnique({
    where: { id: newBatch.id },
    include: {
      questions: { orderBy: { id: 'asc' } },
      responses: true,
      venue: true,
    },
  });
}

// GET /api/owner/batch
router.get('/batch', async (req: Request, res: Response): Promise<any> => {
  try {
    const venueId = req.query.venueId as string | undefined;
    let venue = null;

    if (venueId) {
      venue = await prisma.venue.findUnique({ where: { id: venueId } });
    } else {
      venue = await prisma.venue.findFirst({ include: { owner: true } });
    }

    if (!venue) {
      return res.status(404).json({ error: 'No venue found' });
    }

    // Find active batch
    let batch = await prisma.ownerQuestionBatch.findFirst({
      where: { venueId: venue.id, status: 'ACTIVE' },
      include: {
        questions: { orderBy: { id: 'asc' } },
        responses: true,
        venue: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // If batch exists but expired, auto-submit and generate a fresh one dynamically
    if (batch && batch.expiresAt < now) {
      await prisma.ownerQuestionBatch.update({
        where: { id: batch.id },
        data: { status: 'AUTO_SUBMITTED' },
      });

      batch = await createDynamicBatch(venue.id, batch.managerId);
    }

    // If no active batch exists at all, create one dynamically
    if (!batch) {
      batch = await createDynamicBatch(venue.id);
    }

    return res.json(batch);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/owner/batch
router.post('/batch', async (req: Request, res: Response): Promise<any> => {
  try {
    const { venueId, managerId, questions } = req.body || {};
    if (!venueId) {
      return res.status(400).json({ error: 'venueId is required' });
    }

    // Mark current active batches for this venue as EXPIRED
    await prisma.ownerQuestionBatch.updateMany({
      where: { venueId, status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 15);

    const batch = await prisma.ownerQuestionBatch.create({
      data: {
        venueId,
        managerId: managerId || null,
        status: 'ACTIVE',
        expiresAt,
      },
    });

    const questionsList = Array.isArray(questions) && questions.length > 0
      ? questions
      : DEFAULT_OWNER_QUESTIONS;

    for (const q of questionsList) {
      const qText = typeof q === 'string' ? q : q.question;
      const qCat = typeof q === 'object' && q.category ? q.category : 'General';
      await prisma.ownerQuestion.create({
        data: {
          batchId: batch.id,
          question: qText,
          category: qCat,
        },
      });
    }

    const createdBatch = await prisma.ownerQuestionBatch.findUnique({
      where: { id: batch.id },
      include: {
        questions: { orderBy: { id: 'asc' } },
        responses: true,
        venue: true,
      },
    });

    return res.json(createdBatch);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/owner/batch/:batchId/respond
router.post('/batch/:batchId/respond', async (req: Request, res: Response): Promise<any> => {
  try {
    const batchId = req.params.batchId as string;
    const { ownerId, responses, isFinal } = req.body || {};

    if (!Array.isArray(responses)) {
      return res.status(400).json({ error: 'responses array is required' });
    }

    const saved = [];
    for (const item of responses) {
      const { questionId, answer, remark } = item;
      if (!questionId || !answer) continue;

      const existing = await prisma.ownerResponse.findFirst({
        where: { batchId, questionId },
      });

      if (existing) {
        const updated = await prisma.ownerResponse.update({
          where: { id: existing.id },
          data: {
            answer,
            remark: remark || null,
            answeredAt: new Date(),
          },
        });
        saved.push(updated);
      } else {
        const created = await prisma.ownerResponse.create({
          data: {
            batchId,
            questionId,
            ownerId: ownerId || 'system-owner',
            answer,
            remark: remark || null,
          },
        });
        saved.push(created);
      }
    }

    if (isFinal) {
      await prisma.ownerQuestionBatch.update({
        where: { id: batchId },
        data: { status: 'COMPLETED' },
      });
    }

    return res.json({ success: true, count: saved.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/owner/defects
router.get('/defects', async (req: Request, res: Response): Promise<any> => {
  try {
    const venueId = req.query.venueId as string | undefined;
    const where: any = {};
    if (venueId) where.venueId = venueId;

    const defects = await prisma.ownerDefectReport.findMany({
      where,
      include: { owner: true, venue: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(defects);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/owner/defects
router.post('/defects', async (req: Request, res: Response): Promise<any> => {
  try {
    const { venueId, ownerId, title, description, assetName, priority, severity, photoUrl } = req.body || {};

    if (!title || !description || !venueId || !ownerId) {
      return res.status(400).json({ error: 'Title, description, venueId, and ownerId are required' });
    }

    const count = await prisma.ownerDefectReport.count();
    const defectNo = `OWNER-DEF-${String(count + 1).padStart(3, '0')}`;

    const report = await prisma.ownerDefectReport.create({
      data: {
        defectNo,
        venueId,
        ownerId,
        title,
        description,
        assetName: assetName || 'General Venue Asset',
        priority: priority || 'P3',
        severity: severity || 'MEDIUM',
        photoUrl: photoUrl || null,
        status: 'OPEN',
      },
      include: { venue: true, owner: true },
    });

    broadcastNotification('room:role:MANAGER', 'notification:new', {
      title: '🏢 Owner Reported Venue Defect',
      message: `${report.owner?.name} reported issue "${title}" in ${report.venue?.name}.`,
      type: 'OWNER_DEFECT',
      timestamp: new Date().toISOString(),
    });

    return res.json(report);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/owner/audit-reports
router.get('/audit-reports', async (req: Request, res: Response): Promise<any> => {
  try {
    const venueId = req.query.venueId as string | undefined;
    const where: any = {};
    if (venueId) where.venueId = venueId;

    const audits = await prisma.audit.findMany({
      where,
      include: {
        venue: { include: { floor: { include: { building: true } } } },
        auditor: true,
        score: true,
        certificate: true,
        inspectionItems: {
          include: { defect: true, component: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(audits);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/owner/repair-logs
router.get('/repair-logs', async (req: Request, res: Response): Promise<any> => {
  try {
    const venueId = req.query.venueId as string | undefined;

    const repairs = await prisma.repair.findMany({
      where: venueId
        ? { defect: { inspectionItem: { audit: { venueId } } } }
        : {},
      include: {
        technician: true,
        defect: {
          include: {
            asset: true,
            component: true,
            department: true,
            inspectionItem: { include: { audit: { include: { venue: true } } } },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    return res.json(repairs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/owner/missed-audit-review/:auditId
router.post('/missed-audit-review/:auditId', async (req: Request, res: Response): Promise<any> => {
  try {
    const auditId = req.params.auditId as string;
    const { remarks } = req.body || {};

    const audit = await prisma.audit.findUnique({ where: { id: auditId } });
    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const updatedAudit = await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'OWNER_REVIEWED',
        missedReason: audit.missedReason
          ? `${audit.missedReason} | Owner Review Signed: "${remarks || 'All issues verified and cleared by Venue Owner'}"`
          : `Owner Review Signed: "${remarks || 'All issues verified and cleared by Venue Owner'}"`,
      },
      include: { venue: true, auditor: true, score: true },
    });

    return res.json({ success: true, audit: updatedAudit });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
