import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const orgs = await prisma.organization.findMany({
    include: {
      campuses: {
        include: {
          buildings: {
            include: {
              floors: {
                include: {
                  venues: {
                    include: {
                      _count: { select: { assets: true, audits: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(orgs, {
    headers: {
      'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
    },
  });
}
