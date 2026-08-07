import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'defects';

    if (!file) {
      // Fallback: Check if base64 payload is provided
      const body = await request.json().catch(() => null);
      if (body?.image) {
        const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);

        return NextResponse.json({ url: `/uploads/${type}/${filename}` });
      }
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${type}/${filename}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
