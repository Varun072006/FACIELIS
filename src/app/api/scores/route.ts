import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get('venueId');

  const where: any = {};
  if (venueId) where.venueId = venueId;

  const scores = await prisma.score.findMany({
    where,
    include: {
      venue: { include: { floor: { include: { building: true } } } },
      audit: { include: { auditor: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(scores);
}
