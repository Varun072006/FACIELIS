import prisma from '@/lib/db';
import { evaluateDefectRules } from './rule.engine';

export async function createDefectFromInspection(
  inspectionItemId: string,
  assetId: string,
  componentId: string,
  componentName: string,
  remark: string
) {
  const ruleResult = await evaluateDefectRules(componentName, remark);

  const count = await prisma.defect.count();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const defectNo = `DEF-${dateStr}-${String(count + 1).padStart(3, '0')}`;

  const slaDeadline = new Date(Date.now() + ruleResult.slaHours * 60 * 60 * 1000);

  // Root Cause Intelligence: Check repeat failure pattern in asset / venue
  const recentDefectsCount = await prisma.defect.count({
    where: {
      assetId,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // last 30 days
    },
  });

  let category = ruleResult.category;
  if (recentDefectsCount >= 2) {
    category = `${ruleResult.category} (Repeat Defect Pattern Detected)`;
  }

  const defect = await prisma.defect.create({
    data: {
      defectNo,
      inspectionItemId,
      assetId,
      componentId,
      category,
      priority: ruleResult.priority,
      severity: ruleResult.severity,
      departmentId: ruleResult.departmentId,
      slaDeadline,
      status: 'OPEN',
    },
    include: {
      department: true,
      asset: { include: { venue: true } },
      component: true,
    },
  });

  return defect;
}
