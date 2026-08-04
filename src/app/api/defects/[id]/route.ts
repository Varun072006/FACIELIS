import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const defect = await prisma.defect.findUnique({
    where: { id },
    include: {
      asset: { include: { venue: true } },
      component: true,
      department: true,
      technician: true,
      inspectionItem: true,
      repair: { include: { technician: true } },
    },
  });

  if (!defect) return NextResponse.json({ error: 'Defect not found' }, { status: 404 });

  return NextResponse.json(defect);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { technicianId, status } = body;

    const updateData: any = {};
    if (technicianId) {
      updateData.technicianId = technicianId;
      updateData.status = 'ASSIGNED';
    }
    if (status) updateData.status = status;

    const defect = await prisma.defect.update({
      where: { id },
      data: updateData,
      include: { technician: true },
    });

    return NextResponse.json(defect);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
