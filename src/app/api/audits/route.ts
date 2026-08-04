import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const auditorId = searchParams.get('auditorId');
  const status = searchParams.get('status');

  const where: any = {};
  if (auditorId) where.auditorId = auditorId;
  if (status) where.status = status;

  const audits = await prisma.audit.findMany({
    where,
    include: {
      venue: {
        include: {
          floor: {
            include: { building: true },
          },
        },
      },
      auditor: true,
      inspectionItems: {
        include: { defect: true },
      },
      score: true,
      certificate: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(audits);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { venueId, auditorId, managerId, scheduledDate } = body;

    const count = await prisma.audit.count();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const auditNo = `AUD-${dateStr}-${String(count + 1).padStart(3, '0')}`;

    const audit = await prisma.audit.create({
      data: {
        auditNo,
        venueId,
        auditorId,
        managerId: managerId || null,
        scheduledDate: new Date(scheduledDate || Date.now()),
        status: 'SCHEDULED',
      },
      include: {
        venue: true,
        auditor: true,
      },
    });

    return NextResponse.json(audit);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
