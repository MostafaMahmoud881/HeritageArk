import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';
import { generateThumbnail, generateBlurHash } from '@/lib/image-optimizer';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const uploaded = await uploadFile(file, key);

    let thumbnailUrl: string | null = null;
    let blurHash: string | null = null;
    const width: number | null = null;
    const height: number | null = null;

    if (file.type.startsWith('image/')) {
      try {
        const thumbnail = await generateThumbnail(buffer, 300, 300);
        const thumbKey = `thumb-${key}`;
        const thumbBlob = new Blob([new Uint8Array(thumbnail)], { type: 'image/webp' });
        const thumbFile = new File([thumbBlob], thumbKey, { type: 'image/webp' });
        const thumbUploaded = await uploadFile(thumbFile, `thumbnails/${thumbKey}`);
        thumbnailUrl = thumbUploaded.url;
        blurHash = await generateBlurHash(buffer);
      } catch {}
    }

    const mediaItem = await prisma.mediaItem.create({
      data: {
        name: file.name,
        type: file.type,
        size: file.size,
        url: uploaded.url,
        thumbnailUrl,
        blurHash,
        width,
        height,
        tags: [],
        copyright: 'CC BY-SA 4.0',
      },
    });

    try {
      const userId = formData.get('userId') as string;
      if (userId) {
        await logAuditEvent({
          userId,
          action: 'MEDIA_UPLOAD',
          entity: 'media',
          entityId: mediaItem.id,
        });
      }
    } catch {}

    return NextResponse.json({ data: mediaItem }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
