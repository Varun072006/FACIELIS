import prisma from '@/lib/db';

export async function getCrossAuditItemsForAuditor(venueId: string) {
  // Fetch previously repaired defects in this venue pending cross-audit validation
  const repairedDefects = await prisma.defect.findMany({
    where: {
      asset: { venueId },
      status: 'REPAIRED_PENDING_CROSS',
    },
    include: {
      asset: true,
      component: true,
      repair: {
        include: { technician: true },
      },
      inspectionItem: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Fetch integrity questions configured for this venue
  const questions = await prisma.crossAuditQuestion.findMany({
    where: { venueId },
  });

  return {
    repairedItemsToVerify: repairedDefects,
    integrityQuestions: questions,
  };
}

export async function submitCrossAuditVerification(
  defectId: string,
  verified: boolean,
  auditorRemark: string
) {
  if (verified) {
    // Mark defect as VERIFIED
    return await prisma.defect.update({
      where: { id: defectId },
      data: { status: 'VERIFIED' },
    });
  } else {
    // Reopen defect for rework
    return await prisma.defect.update({
      where: { id: defectId },
      data: { status: 'REOPENED' },
    });
  }
}
