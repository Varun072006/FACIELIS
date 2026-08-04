import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { venueId, question, assetType, expectedCount, optionA, optionB, optionC, optionD, correctAnswer } = body;

    const updateData: any = {};
    if (venueId !== undefined) updateData.venueId = venueId;
    if (question !== undefined) updateData.question = question;
    if (assetType !== undefined) updateData.assetType = assetType;
    if (expectedCount !== undefined) {
      updateData.expectedCount = expectedCount !== null ? parseInt(String(expectedCount), 10) : null;
    }
    if (optionA !== undefined) updateData.optionA = optionA;
    if (optionB !== undefined) updateData.optionB = optionB;
    if (optionC !== undefined) updateData.optionC = optionC;
    if (optionD !== undefined) updateData.optionD = optionD;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;

    const questionUpdated = await prisma.crossAuditQuestion.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(questionUpdated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.crossAuditQuestion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
