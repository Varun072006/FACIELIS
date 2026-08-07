import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCrossAuditItemsForAuditor, submitCrossAuditVerification } from '@/engines/cross-audit.engine';
import { calculateAuditScores } from '@/engines/score.engine';
import { generateFacilityCertificate } from '@/engines/certificate.engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get('venueId');

  if (!venueId) return NextResponse.json({ error: 'venueId parameter required' }, { status: 400 });

  const data = await getCrossAuditItemsForAuditor(venueId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const { auditId, defectId, verified, auditorRemark, responses } = await request.json();

    // Verify previously repaired item
    if (defectId !== undefined && verified !== undefined) {
      await submitCrossAuditVerification(defectId, verified, auditorRemark || '');
    }

    // Submit integrity responses
    if (Array.isArray(responses)) {
      for (const r of responses) {
        const { questionId, auditorResponse } = r;
        const q = await prisma.crossAuditQuestion.findUnique({ where: { id: questionId } });
        const isCorrect = q?.correctAnswer === auditorResponse;

        await prisma.crossAuditResponse.create({
          data: {
            auditId,
            questionId,
            auditorResponse,
            isCorrect: !!isCorrect,
          },
        });
      }

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
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
