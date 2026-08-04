import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get('venueId');

  const where: any = {};
  if (venueId) {
    where.venueId = venueId;
  }

  const questions = await prisma.crossAuditQuestion.findMany({
    where,
    include: {
      venue: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(questions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's an array for bulk upload/create
    if (Array.isArray(body)) {
      const created = [];
      for (const item of body) {
        if (!item.venueId || !item.question || !item.optionA || !item.optionB || !item.correctAnswer) {
          continue;
        }
        const newQuestion = await prisma.crossAuditQuestion.create({
          data: {
            venueId: item.venueId,
            question: item.question,
            assetType: item.assetType || 'GENERAL',
            expectedCount: item.expectedCount !== undefined ? parseInt(String(item.expectedCount), 10) : null,
            optionA: item.optionA,
            optionB: item.optionB,
            optionC: item.optionC || '',
            optionD: item.optionD || '',
            correctAnswer: item.correctAnswer,
          },
        });
        created.push(newQuestion);
      }
      return NextResponse.json({ success: true, count: created.length, data: created });
    }

    // Single question creation
    const { venueId, question, assetType, expectedCount, optionA, optionB, optionC, optionD, correctAnswer } = body;

    if (!venueId || !question || !optionA || !optionB || !correctAnswer) {
      return NextResponse.json({ error: 'Missing mandatory fields' }, { status: 400 });
    }

    const newQuestion = await prisma.crossAuditQuestion.create({
      data: {
        venueId,
        question,
        assetType: assetType || 'GENERAL',
        expectedCount: expectedCount !== undefined ? parseInt(String(expectedCount), 10) : null,
        optionA,
        optionB,
        optionC: optionC || '',
        optionD: optionD || '',
        correctAnswer,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
