import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';
import { sanitizeSvg } from '@/lib/svg-sanitizer';
import { UPLOAD } from '@/lib/constants';

function detectType(mime: string): string {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'document';
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (!hasPermission(user.role as any, 'reels.create') && !hasPermission(user.role as any, 'media.upload')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!UPLOAD.ALLOWED_IMAGES.includes(file.type) && !UPLOAD.ALLOWED_VIDEOS.includes(file.type) && !UPLOAD.ALLOWED_DOCUMENTS.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported' }, { status: 400 });
    }

    if (file.size > UPLOAD.MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File too large (max ${UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB)` }, { status: 400 });
    }

    let buffer: Buffer;
    if (file.type === 'image/svg+xml') {
      const text = await file.text();
      const result = sanitizeSvg(text);
      if (!result.safe || !result.sanitized) {
        return NextResponse.json({ error: result.error || 'SVG contains disallowed content' }, { status: 400 });
      }
      buffer = Buffer.from(result.sanitized, 'utf-8');
    } else {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    const extension = file.name.split('.').pop() || '';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;

    const fs = await import('fs/promises');
    const path = await import('path');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, uniqueName), buffer);

    await prisma.file.create({
      data: {
        name: file.name,
        originalName: file.name,
        type: detectType(file.type),
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${uniqueName}`,
        uploadedById: user.id,
      },
    });

    const thumbnail = formData.get('thumbnail') as File | null;
    let thumbnailUrl: string | undefined;

    if (thumbnail) {
      const thumbExt = thumbnail.name.split('.').pop() || '';
      const thumbName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-thumb.${thumbExt}`;
      const thumbBytes = await thumbnail.arrayBuffer();
      await fs.writeFile(path.join(uploadDir, thumbName), Buffer.from(thumbBytes));
      thumbnailUrl = `/uploads/${thumbName}`;
    }

    return NextResponse.json({
      url: `/uploads/${uniqueName}`,
      thumbnailUrl,
      fileSize: file.size,
      mimeType: file.type,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
