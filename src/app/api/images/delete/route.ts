import { NextResponse } from 'next/server';
import { deleteImage } from '@/lib/services/image-service';

export async function POST(request: Request) {
  const { publicId } = await request.json();

  if (!publicId) {
    return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
  }

  try {
    await deleteImage(publicId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
