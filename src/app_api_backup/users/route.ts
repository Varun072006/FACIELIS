import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');

  const where: any = {};
  if (role) where.role = role;

  const users = await prisma.user.findMany({
    where,
    include: { department: true, building: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(users);
}
