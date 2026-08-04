import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const audit = await prisma.audit.findUnique({
    where: { id },
    include: {
      venue: {
        include: {
          assets: {
            include: {
              components: true,
              assetCategory: {
                include: { referenceImages: true },
              },
            },
            orderBy: { serialNo: 'asc' },
          },
          floor: { include: { building: true } },
          crossAuditQuestions: true,
        },
      },
      auditor: true,
      inspectionItems: {
        include: {
          defect: { include: { department: true, repair: true } },
          component: true,
        },
      },
      score: true,
      certificate: true,
    },
  });

  if (!audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  return NextResponse.json(audit);
}
