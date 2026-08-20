import prisma from '@/lib/db';
import { calculateAuditScores } from './score.engine';

type FitnessStatus = 'FIT' | 'UNFIT' | 'CONDITIONAL';

export async function generateFacilityCertificate(auditId: string, managerId?: string) {
  const score = await calculateAuditScores(auditId);
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: { venue: true },
  });

  if (!audit) throw new Error('Audit not found');

  let fitnessStatus: FitnessStatus = 'UNFIT';
  if (score.criticalFailuresCount > 0) {
    fitnessStatus = 'UNFIT';
  } else if (score.overallScore >= 85) {
    fitnessStatus = 'FIT';
  } else if (score.overallScore >= 65) {
    fitnessStatus = 'CONDITIONAL';
  } else {
    fitnessStatus = 'UNFIT';
  }

  const count = await prisma.certificate.count();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const certificateNo = `CERT-BIT-SATHY-${dateStr}-${String(count + 1).padStart(4, '0')}`;

  const validFrom = new Date();
  const validUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 6 months validity

  const existingCert = await prisma.certificate.findFirst({
    where: { auditId },
  });

  let cert;
  if (existingCert) {
    cert = await prisma.certificate.update({
      where: { id: existingCert.id },
      data: {
        fitnessStatus,
        overallScore: score.overallScore,
        validUntil,
        approvedByManagerId: managerId || null,
      },
    });
  } else {
    cert = await prisma.certificate.create({
      data: {
        certificateNo,
        venueId: audit.venueId,
        auditId,
        organizationId: audit.organizationId || audit.venue.organizationId,
        fitnessStatus,
        overallScore: score.overallScore,
        validFrom,
        validUntil,
        approvedByManagerId: managerId || null,
        qrCode: `FACIELIS-CERT:${certificateNo}:${audit.venue.code}`,
      },
    });
  }

  return cert;
}
