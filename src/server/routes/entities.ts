import { Router, Request, Response } from 'express';
import prisma from '../../lib/db';
import { getCrossAuditItemsForAuditor, submitCrossAuditVerification } from '../../engines/cross-audit.engine';
import { calculateAuditScores } from '../../engines/score.engine';
import { generateFacilityCertificate } from '../../engines/certificate.engine';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const router = Router();

// ================= USERS =================
router.get('/users', async (req: Request, res: Response): Promise<any> => {
  try {
    const role = req.query.role as string | undefined;
    const where: any = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      include: { department: true, building: true },
      orderBy: { name: 'asc' },
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= ASSETS =================
router.get('/assets', async (req: Request, res: Response): Promise<any> => {
  try {
    const venueId = req.query.venueId as string | undefined;
    const where: any = {};
    if (venueId) where.venueId = venueId;

    const assets = await prisma.asset.findMany({
      where,
      include: {
        assetCategory: { include: { referenceImages: true } },
        venue: { include: { floor: { include: { building: true } } } },
        components: true,
        defects: { include: { department: true, repair: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(assets);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/assets', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, serialNo, categoryCode, venueId, componentNames, imageUrl } = req.body || {};
    if (!name || !categoryCode) {
      return res.status(400).json({ error: 'Name and Category are required' });
    }

    let category = await prisma.assetCategory.findFirst({
      where: { code: categoryCode },
    });

    if (!category) {
      category = await prisma.assetCategory.create({
        data: {
          name,
          code: categoryCode.toUpperCase(),
          description: `Custom ${name} category`,
        },
      });
    }

    let targetVenueId = venueId;
    if (!targetVenueId) {
      const defaultVenue = await prisma.venue.findFirst();
      targetVenueId = defaultVenue?.id;
    }

    const count = await prisma.asset.count();
    const autoSerial = serialNo || `LC4FRC-${categoryCode.substring(0, 4)}-${String(count + 1).padStart(3, '0')}`;

    const newAsset = await prisma.asset.create({
      data: {
        name,
        serialNo: autoSerial,
        assetCategoryId: category.id,
        venueId: targetVenueId!,
        installationDate: new Date(),
        status: 'ACTIVE',
      },
      include: {
        assetCategory: true,
        venue: true,
      },
    });

    const comps = Array.isArray(componentNames) && componentNames.length > 0
      ? componentNames
      : ['Main Unit Surface', 'Control Panel / Switch', 'Power Connection'];

    for (let i = 0; i < comps.length; i++) {
      await prisma.component.create({
        data: {
          name: comps[i],
          code: `${newAsset.serialNo}-CMP-${i + 1}`,
          assetId: newAsset.id,
        },
      });
    }

    if (imageUrl) {
      await prisma.referenceImage.create({
        data: {
          assetCategoryId: category.id,
          goodImageUrl: imageUrl,
          acceptableImageUrl: imageUrl,
          defectiveImageUrl: imageUrl,
          description: `Admin uploaded standard for ${name}`,
        },
      });
    }

    const createdAsset = await prisma.asset.findUnique({
      where: { id: newAsset.id },
      include: {
        assetCategory: { include: { referenceImages: true } },
        venue: true,
        components: true,
      },
    });

    return res.json(createdAsset);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create asset' });
  }
});

// ================= CERTIFICATES =================
router.get('/certificates', async (req: Request, res: Response): Promise<any> => {
  try {
    const venueId = req.query.venueId as string | undefined;
    const where: any = {};
    if (venueId) where.venueId = venueId;

    const certs = await prisma.certificate.findMany({
      where,
      include: {
        venue: { include: { floor: { include: { building: true } } } },
        audit: { include: { auditor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(certs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= CROSS-AUDIT =================
router.get('/cross-audit', async (req: Request, res: Response): Promise<any> => {
  try {
    const venueId = req.query.venueId as string | undefined;
    if (!venueId) return res.status(400).json({ error: 'venueId parameter required' });

    const data = await getCrossAuditItemsForAuditor(venueId);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/cross-audit', async (req: Request, res: Response): Promise<any> => {
  try {
    const { auditId, defectId, verified, auditorRemark, responses } = req.body || {};

    if (defectId !== undefined && verified !== undefined) {
      await submitCrossAuditVerification(defectId, verified, auditorRemark || '');
    }

    if (Array.isArray(responses)) {
      for (const r of responses) {
        const { questionId, auditorResponse } = r;
        const q = await prisma.crossAuditQuestion.findUnique({ where: { id: questionId } });
        const isCorrect = q?.correctAnswer === auditorResponse;

        await prisma.crossAuditResponse.create({
          data: {
            auditId,
            questionId,
            auditorResponse,
            isCorrect: !!isCorrect,
          },
        });
      }

      await prisma.audit.update({
        where: { id: auditId },
        data: {
          status: 'COMPLETED',
          completedDate: new Date(),
        },
      });

      await calculateAuditScores(auditId);
      await generateFacilityCertificate(auditId);
    }

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= CROSS-AUDIT QUESTIONS =================
router.get('/cross-audit-questions', async (req: Request, res: Response): Promise<any> => {
  try {
    const venueId = req.query.venueId as string | undefined;
    const where: any = {};
    if (venueId) where.venueId = venueId;

    const questions = await prisma.crossAuditQuestion.findMany({
      where,
      include: { venue: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(questions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/cross-audit-questions', async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body;

    if (Array.isArray(body)) {
      const created = [];
      for (const item of body) {
        if (!item.venueId || !item.question || !item.optionA || !item.optionB || !item.correctAnswer) {
          continue;
        }
        const newQuestion = await prisma.crossAuditQuestion.create({
          data: {
            venueId: item.venueId,
            question: item.question,
            assetType: item.assetType || 'GENERAL',
            expectedCount: item.expectedCount !== undefined ? parseInt(String(item.expectedCount), 10) : null,
            optionA: item.optionA,
            optionB: item.optionB,
            optionC: item.optionC || '',
            optionD: item.optionD || '',
            correctAnswer: item.correctAnswer,
          },
        });
        created.push(newQuestion);
      }
      return res.json({ success: true, count: created.length, data: created });
    }

    const { venueId, question, assetType, expectedCount, optionA, optionB, optionC, optionD, correctAnswer } = body || {};
    if (!venueId || !question || !optionA || !optionB || !correctAnswer) {
      return res.status(400).json({ error: 'Missing mandatory fields' });
    }

    const newQuestion = await prisma.crossAuditQuestion.create({
      data: {
        venueId,
        question,
        assetType: assetType || 'GENERAL',
        expectedCount: expectedCount !== undefined ? parseInt(String(expectedCount), 10) : null,
        optionA,
        optionB,
        optionC: optionC || '',
        optionD: optionD || '',
        correctAnswer,
      },
    });

    return res.json(newQuestion);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/cross-audit-questions/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const body = req.body || {};
    const { venueId, question, assetType, expectedCount, optionA, optionB, optionC, optionD, correctAnswer } = body;

    const updateData: any = {};
    if (venueId !== undefined) updateData.venueId = venueId;
    if (question !== undefined) updateData.question = question;
    if (assetType !== undefined) updateData.assetType = assetType;
    if (expectedCount !== undefined) {
      updateData.expectedCount = expectedCount !== null ? parseInt(String(expectedCount), 10) : null;
    }
    if (optionA !== undefined) updateData.optionA = optionA;
    if (optionB !== undefined) updateData.optionB = optionB;
    if (optionC !== undefined) updateData.optionC = optionC;
    if (optionD !== undefined) updateData.optionD = optionD;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;

    const questionUpdated = await prisma.crossAuditQuestion.update({
      where: { id },
      data: updateData,
    });

    return res.json(questionUpdated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/cross-audit-questions/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    await prisma.crossAuditQuestion.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= DEPARTMENTS =================
router.get('/departments', async (_req: Request, res: Response): Promise<any> => {
  try {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { users: true, defects: true } } },
      orderBy: { name: 'asc' },
    });
    return res.json(departments);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= FACILITIES =================
router.get('/facilities', async (_req: Request, res: Response): Promise<any> => {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        campuses: {
          include: {
            buildings: {
              include: {
                floors: {
                  include: {
                    venues: {
                      include: {
                        _count: { select: { assets: true, audits: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    res.setHeader('Cache-Control', 'private, max-age=15, stale-while-revalidate=60');
    return res.json(orgs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= REPAIRS =================
router.post('/repairs', async (req: Request, res: Response): Promise<any> => {
  try {
    const { defectId, technicianId, repairProofPhotoUrl, geotagLat, geotagLng, remark } = req.body || {};

    if (!defectId || !technicianId || !repairProofPhotoUrl || !remark) {
      return res.status(400).json({
        error: 'Defect ID, Technician ID, proof photo, and remark are required',
      });
    }

    const repair = await prisma.repair.upsert({
      where: { defectId },
      update: {
        technicianId,
        repairProofPhotoUrl,
        geotagLat: geotagLat || null,
        geotagLng: geotagLng || null,
        remark,
        completedAt: new Date(),
      },
      create: {
        defectId,
        technicianId,
        repairProofPhotoUrl,
        geotagLat: geotagLat || null,
        geotagLng: geotagLng || null,
        remark,
      },
    });

    await prisma.defect.update({
      where: { id: defectId },
      data: { status: 'REPAIRED_PENDING_CROSS' },
    });

    return res.json(repair);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= RULES =================
router.get('/rules', async (_req: Request, res: Response): Promise<any> => {
  try {
    const rules = await prisma.rule.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(rules);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/rules', async (req: Request, res: Response): Promise<any> => {
  try {
    const rule = await prisma.rule.create({ data: req.body });
    return res.json(rule);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= SCORES =================
router.get('/scores', async (req: Request, res: Response): Promise<any> => {
  try {
    const venueId = req.query.venueId as string | undefined;
    const where: any = {};
    if (venueId) where.venueId = venueId;

    const scores = await prisma.score.findMany({
      where,
      include: {
        venue: { include: { floor: { include: { building: true } } } },
        audit: { include: { auditor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(scores);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= UPLOAD =================
router.post('/upload', async (req: Request, res: Response): Promise<any> => {
  try {
    const { image, type = 'defects' } = req.body || {};
    if (image) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      return res.json({ url: `/uploads/${type}/${filename}` });
    }
    return res.status(400).json({ error: 'No image provided' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ================= VENUES =================
router.get('/venues', async (_req: Request, res: Response): Promise<any> => {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        floor: {
          include: {
            building: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.json(venues);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
