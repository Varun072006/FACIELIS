import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { defectId, technicianId, repairProofPhotoUrl, geotagLat, geotagLng, remark } = await request.json();

    if (!defectId || !technicianId || !repairProofPhotoUrl || !remark) {
      return NextResponse.json(
        { error: 'Defect ID, Technician ID, proof photo, and remark are required' },
        { status: 400 }
      );
    }

    const repair = await prisma.repair.upsert({
      where: { defectId },
      update: {
        technicianId,
        repairProofPhotoUrl,
        geotagLat: geotagLat || null,
        geotagLng: geotagLng || null,
        remark,
        completedAt: new Date(),
      },
      create: {
        defectId,
        technicianId,
        repairProofPhotoUrl,
        geotagLat: geotagLat || null,
        geotagLng: geotagLng || null,
        remark,
      },
    });

    // Update Defect status to REPAIRED_PENDING_CROSS
    await prisma.defect.update({
      where: { id: defectId },
      data: { status: 'REPAIRED_PENDING_CROSS' },
    });

    return NextResponse.json(repair);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
