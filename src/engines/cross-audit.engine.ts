import prisma from '@/lib/db';

export async function getCrossAuditItemsForAuditor(venueId: string) {
  // Fetch previously repaired defects in this venue pending cross-audit validation
  const repairedDefects = await prisma.defect.findMany({
    where: {
      asset: { venueId },
      status: 'REPAIRED_PENDING_CROSS',
      deletedAt: null,
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
  let questions = await prisma.crossAuditQuestion.findMany({
    where: { venueId },
  });

  // Dynamic Anti-Fraud Synthesis: If venue has fewer than 3 questions, dynamically synthesize from actual assets
  if (questions.length < 3) {
    const assetCategories = await prisma.asset.groupBy({
      by: ['assetCategoryId'],
      where: { venueId, deletedAt: null },
      _count: { id: true },
    });

    const synthesizedQuestions = [];
    for (const group of assetCategories) {
      const category = await prisma.assetCategory.findUnique({
        where: { id: group.assetCategoryId },
      });
      if (!category) continue;

      const actualCount = group._count.id;
      const opts = [actualCount, Math.max(1, actualCount - 2), actualCount + 2, actualCount + 4];
      // Shuffle options
      const shuffled = opts.sort(() => Math.random() - 0.5);
      const correctIdx = shuffled.indexOf(actualCount);
      const letters = ['A', 'B', 'C', 'D'];

      synthesizedQuestions.push({
        id: `dyn_${category.code}_${venueId.substring(0, 5)}`,
        venueId,
        question: `How many ${category.name} units are installed in this venue?`,
        assetType: category.name,
        expectedCount: actualCount,
        optionA: `${shuffled[0]} Units`,
        optionB: `${shuffled[1]} Units`,
        optionC: `${shuffled[2]} Units`,
        optionD: `${shuffled[3]} Units`,
        correctAnswer: letters[correctIdx],
      });
    }

    questions = [...questions, ...(synthesizedQuestions.slice(0, 3 - questions.length) as any[])];
  }

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
      data: {
        status: 'REOPENED',
        reopenedReason: auditorRemark || 'Auditor rejected repair during physical cross-verification',
      },
    });
  }
}
