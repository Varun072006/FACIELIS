import prisma from '@/lib/db';

export async function calculateAuditScores(auditId: string) {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: {
      venue: true,
      inspectionItems: {
        include: {
          asset: {
            include: { assetCategory: true },
          },
          defect: true,
        },
      },
    },
  });

  if (!audit) throw new Error('Audit not found');

  const items = audit.inspectionItems;
  const organizationId = audit.organizationId || audit.venue.organizationId;

  if (items.length === 0) {
    return await prisma.score.upsert({
      where: { auditId },
      update: {},
      create: {
        auditId,
        venueId: audit.venueId,
        organizationId,
        housekeepingScore: 100,
        electricalScore: 100,
        plumbingScore: 100,
        networkScore: 100,
        documentationScore: 100,
        overallScore: 100,
        criticalFailuresCount: 0,
        isFit: true,
      },
    });
  }

  // Group by category
  const categories: Record<string, { total: number; pass: number }> = {
    Housekeeping: { total: 0, pass: 0 },
    Electrical: { total: 0, pass: 0 },
    Plumbing: { total: 0, pass: 0 },
    Network: { total: 0, pass: 0 },
    Documentation: { total: 0, pass: 0 },
  };

  let criticalFailuresCount = 0;

  for (const item of items) {
    const catName = item.defect?.category?.split(' (')[0] || getCategoryFromAssetType(item.asset.name);
    if (!categories[catName]) {
      categories[catName] = { total: 0, pass: 0 };
    }

    categories[catName].total += 1;
    if (item.status === 'PASS') {
      categories[catName].pass += 1;
    }

    if (item.defect?.severity === 'CRITICAL') {
      criticalFailuresCount += 1;
    }
  }

  const calcScore = (cat: string) => {
    const data = categories[cat];
    if (!data || data.total === 0) return 100;
    return Math.round((data.pass / data.total) * 100 * 10) / 10;
  };

  const hk = calcScore('Housekeeping');
  const elec = calcScore('Electrical');
  const plumb = calcScore('Plumbing');
  const net = calcScore('Network');
  const doc = calcScore('Documentation');

  const overallScore = Math.round(((hk + elec + plumb + net + doc) / 5) * 10) / 10;
  const isFit = overallScore >= 80 && criticalFailuresCount === 0;

  const score = await prisma.score.upsert({
    where: { auditId },
    update: {
      housekeepingScore: hk,
      electricalScore: elec,
      plumbingScore: plumb,
      networkScore: net,
      documentationScore: doc,
      overallScore,
      criticalFailuresCount,
      isFit,
    },
    create: {
      auditId,
      venueId: audit.venueId,
      organizationId,
      housekeepingScore: hk,
      electricalScore: elec,
      plumbingScore: plumb,
      networkScore: net,
      documentationScore: doc,
      overallScore,
      criticalFailuresCount,
      isFit,
    },
  });

  return score;
}

function getCategoryFromAssetType(assetName: string): string {
  const name = assetName.toLowerCase();
  if (name.includes('switch') || name.includes('light') || name.includes('fan') || name.includes('wiring')) return 'Electrical';
  if (name.includes('ac') || name.includes('drain') || name.includes('pipe')) return 'Plumbing';
  if (name.includes('pc') || name.includes('computer') || name.includes('router') || name.includes('ethernet')) return 'Network';
  if (name.includes('chair') || name.includes('table') || name.includes('floor') || name.includes('ceiling') || name.includes('door') || name.includes('window')) return 'Housekeeping';
  return 'Housekeeping';
}
