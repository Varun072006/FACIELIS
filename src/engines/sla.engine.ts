import prisma from '@/lib/db';

let lastSLACheckTime = 0;

export async function checkAndUpdateOverdueDefects() {
  const nowMs = Date.now();
  // Throttle to at most once every 30 seconds to avoid DB write-lock overhead on every GET
  if (nowMs - lastSLACheckTime < 30_000) {
    return { count: 0 };
  }
  lastSLACheckTime = nowMs;

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

  const [
    totalDefects,
    overdueCount,
    openCount,
    assignedCount,
    pendingCrossCount,
    verifiedCount,
  ] = await Promise.all([
    prisma.defect.count(),
    prisma.defect.count({ where: { isOverdue: true } }),
    prisma.defect.count({ where: { status: 'OPEN' } }),
    prisma.defect.count({ where: { status: 'ASSIGNED' } }),
    prisma.defect.count({ where: { status: 'REPAIRED_PENDING_CROSS' } }),
    prisma.defect.count({ where: { status: 'VERIFIED' } }),
  ]);

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
