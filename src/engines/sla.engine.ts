import prisma from '@/lib/db';

export async function checkAndUpdateOverdueDefects() {
  const now = new Date();

  // Find OPEN/ASSIGNED defects past SLA deadline
  const overdueDefects = await prisma.defect.updateMany({
    where: {
      status: { in: ['OPEN', 'ASSIGNED'] },
      slaDeadline: { lt: now },
      isOverdue: false,
    },
    data: {
      isOverdue: true,
    },
  });

  return overdueDefects;
}

export async function getSLAMetrics() {
  await checkAndUpdateOverdueDefects();

  const totalDefects = await prisma.defect.count();
  const overdueCount = await prisma.defect.count({ where: { isOverdue: true } });
  const openCount = await prisma.defect.count({ where: { status: 'OPEN' } });
  const assignedCount = await prisma.defect.count({ where: { status: 'ASSIGNED' } });
  const pendingCrossCount = await prisma.defect.count({ where: { status: 'REPAIRED_PENDING_CROSS' } });
  const verifiedCount = await prisma.defect.count({ where: { status: 'VERIFIED' } });

  const slaComplianceRate = totalDefects > 0 
    ? Math.round(((totalDefects - overdueCount) / totalDefects) * 100 * 10) / 10 
    : 100;

  return {
    totalDefects,
    overdueCount,
    openCount,
    assignedCount,
    pendingCrossCount,
    verifiedCount,
    slaComplianceRate,
  };
}
