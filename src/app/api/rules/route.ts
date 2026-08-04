import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const rules = await prisma.rule.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(rules);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rule = await prisma.rule.create({ data: body });
    return NextResponse.json(rule);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
