import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get('venueId');

  const where: any = {};
  if (venueId) where.venueId = venueId;

  const assets = await prisma.asset.findMany({
    where,
    include: {
      assetCategory: { include: { referenceImages: true } },
      venue: { include: { floor: { include: { building: true } } } },
      components: true,
      defects: { include: { department: true, repair: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(assets);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, serialNo, categoryCode, venueId, componentNames, imageUrl } = body;

    if (!name || !categoryCode) {
      return NextResponse.json({ error: 'Name and Category are required' }, { status: 400 });
    }

    // Resolve or find Asset Category
    let category = await prisma.assetCategory.findFirst({
      where: { code: categoryCode },
    });

    if (!category) {
      category = await prisma.assetCategory.create({
        data: {
          name: name,
          code: categoryCode.toUpperCase(),
          description: `Custom ${name} category`,
        },
      });
    }

    // Resolve venue
    let targetVenueId = venueId;
    if (!targetVenueId) {
      const defaultVenue = await prisma.venue.findFirst();
      targetVenueId = defaultVenue?.id;
    }

    const count = await prisma.asset.count();
    const autoSerial = serialNo || `LC4FRC-${categoryCode.substring(0, 4)}-${String(count + 1).padStart(3, '0')}`;

    const newAsset = await prisma.asset.create({
      data: {
        name,
        serialNo: autoSerial,
        assetCategoryId: category.id,
        venueId: targetVenueId!,
        installationDate: new Date(),
        status: 'ACTIVE',
      },
      include: {
        assetCategory: true,
        venue: true,
      },
    });

    // Create inspectable components if provided
    const comps = Array.isArray(componentNames) && componentNames.length > 0
      ? componentNames
      : ['Main Unit Surface', 'Control Panel / Switch', 'Power Connection'];

    for (let i = 0; i < comps.length; i++) {
      await prisma.component.create({
        data: {
          name: comps[i],
          code: `${newAsset.serialNo}-CMP-${i + 1}`,
          assetId: newAsset.id,
        },
      });
    }

    // Attach reference image if provided
    if (imageUrl) {
      await prisma.referenceImage.create({
        data: {
          assetCategoryId: category.id,
          goodImageUrl: imageUrl,
          acceptableImageUrl: imageUrl,
          defectiveImageUrl: imageUrl,
          description: `Admin uploaded standard for ${name}`,
        },
      });
    }

    const createdAsset = await prisma.asset.findUnique({
      where: { id: newAsset.id },
      include: {
        assetCategory: { include: { referenceImages: true } },
        venue: true,
        components: true,
      },
    });

    return NextResponse.json(createdAsset);
  } catch (error: any) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: error.message || 'Failed to create asset' }, { status: 500 });
  }
}
