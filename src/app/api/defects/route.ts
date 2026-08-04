import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAndUpdateOverdueDefects } from '@/engines/sla.engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const technicianId = searchParams.get('technicianId');
  const departmentId = searchParams.get('departmentId');
  const status = searchParams.get('status');

  await checkAndUpdateOverdueDefects();

  const where: any = {};
  if (technicianId) where.technicianId = technicianId;
  if (departmentId) where.departmentId = departmentId;
  if (status) where.status = status;

  const defects = await prisma.defect.findMany({
    where,
    include: {
      asset: {
        include: { venue: true },
      },
      component: true,
      department: true,
      technician: true,
      inspectionItem: true,
      repair: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(defects);
}
