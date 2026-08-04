import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createDefectFromInspection } from '@/engines/defect.engine';
import { autoAssignTechnician } from '@/engines/assignment.engine';
import { calculateAuditScores } from '@/engines/score.engine';
import { generateFacilityCertificate } from '@/engines/certificate.engine';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auditId } = await params;
    const { items, isComplete } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    const createdItems = [];

    for (const item of items) {
      const { assetId, componentId, componentName, status, photoUrl, geotagLat, geotagLng, remark } = item;

      // Upsert inspection item
      const inspectionItem = await prisma.inspectionItem.create({
        data: {
          auditId,
          assetId,
          componentId,
          status,
          photoUrl: photoUrl || null,
          geotagLat: geotagLat || null,
          geotagLng: geotagLng || null,
          remark: remark || null,
        },
      });

      // If FAILED -> Defect Engine -> Rule Engine -> Auto Assignment Engine
      if (status === 'FAIL') {
        const defect = await createDefectFromInspection(
          inspectionItem.id,
          assetId,
          componentId,
          componentName || 'Component',
          remark || 'Defect detected during audit'
        );

        // Auto assign technician
        await autoAssignTechnician(defect.id);
      }

      createdItems.push(inspectionItem);
    }

    if (isComplete) {
      // Mark audit as completed
      await prisma.audit.update({
        where: { id: auditId },
        data: {
          status: 'COMPLETED',
          completedDate: new Date(),
        },
      });

      // Run Score Engine
      await calculateAuditScores(auditId);

      // Run Certificate Engine
      await generateFacilityCertificate(auditId);
    } else {
      await prisma.audit.update({
        where: { id: auditId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return NextResponse.json({ success: true, itemsCount: createdItems.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
