import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        floor: {
          include: {
            building: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(venues);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
