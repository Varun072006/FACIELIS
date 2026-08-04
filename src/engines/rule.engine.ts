import prisma from '@/lib/db';

export type DefectPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type DefectSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RuleEvaluationResult {
  category: string;
  priority: DefectPriority;
  severity: DefectSeverity;
  departmentId: string;
  slaHours: number;
}

export async function evaluateDefectRules(
  componentName: string,
  remark: string
): Promise<RuleEvaluationResult> {
  const rules: any[] = await prisma.rule.findMany();
  const lowerRemark = remark.toLowerCase();
  const lowerComponent = componentName.toLowerCase();

  // Find best matching rule
  let matchedRule = rules.find((rule: any) => {
    const compMatches = lowerComponent.includes(rule.componentType.toLowerCase());
    if (!compMatches) return false;

    if (!rule.keywordMatch) return true;

    const keywords = rule.keywordMatch.split(',').map((k: string) => k.trim().toLowerCase());
    return keywords.some((kw: string) => lowerRemark.includes(kw));
  });

  // Fallback if no specific keyword matched, but component type matches
  if (!matchedRule) {
    matchedRule = rules.find((rule: any) =>
      lowerComponent.includes(rule.componentType.toLowerCase())
    );
  }

  // Determine department
  let deptName = matchedRule?.departmentName || 'Housekeeping';
  if (lowerComponent.includes('switch') || lowerComponent.includes('wire') || lowerComponent.includes('fan') || lowerComponent.includes('light')) {
    deptName = 'Electrical';
  } else if (lowerComponent.includes('pipe') || lowerComponent.includes('drain') || lowerComponent.includes('ac')) {
    deptName = 'Plumbing';
  } else if (lowerComponent.includes('ethernet') || lowerComponent.includes('router') || lowerComponent.includes('comp') || lowerComponent.includes('pc')) {
    deptName = 'Network';
  }

  let dept: any = await prisma.department.findFirst({
    where: { name: { equals: deptName, mode: 'insensitive' } },
  });

  if (!dept) {
    dept = (await prisma.department.findFirst())!;
  }

  return {
    category: matchedRule?.category || 'General Maintenance',
    priority: (matchedRule?.priority as DefectPriority) || 'P3',
    severity: (matchedRule?.severity as DefectSeverity) || 'MEDIUM',
    departmentId: dept.id,
    slaHours: matchedRule?.slaHours || 8,
  };
}
