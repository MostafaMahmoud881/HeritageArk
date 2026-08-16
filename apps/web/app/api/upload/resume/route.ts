import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { fileName, totalChunks, chunkIndex, totalSize, mimeType } = await request.json();

  if (chunkIndex === 0) {
    const file = await prisma.file.create({
      data: {
        name: fileName,
        originalName: fileName,
        type: mimeType?.startsWith('image/') ? 'image' : 'other',
        mimeType: mimeType || 'application/octet-stream',
        size: totalSize || 0,
        url: `/uploads/resume_${Date.now()}`,
        uploadedById: user.id,
        uploadProgress: 0,
        metadata: JSON.stringify({ totalChunks }),
      },
    });

    return NextResponse.json({ data: { uploadId: file.id, chunkIndex: 0 } }, { status: 201 });
  }

  const uploadId = request.nextUrl.searchParams.get('uploadId');
  if (!uploadId) {
    return NextResponse.json({ error: 'uploadId required' }, { status: 400 });
  }

  const upload = await prisma.file.findUnique({ where: { id: uploadId } });
  if (!upload) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
  }

  const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);

  if (chunkIndex >= totalChunks - 1) {
    await prisma.file.update({
      where: { id: upload.id },
      data: { uploadProgress: 100, checksum: `chunked_${Date.now()}` },
    });

    return NextResponse.json({ data: { uploadId: upload.id, complete: true } });
  }

  await prisma.file.update({
    where: { id: upload.id },
    data: { uploadProgress: progress },
  });

  return NextResponse.json({ data: { uploadId: upload.id, chunkIndex: chunkIndex + 1, progress } });
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const uploadId = request.nextUrl.searchParams.get('uploadId');
  if (!uploadId) {
    return NextResponse.json({ error: 'uploadId required' }, { status: 400 });
  }

  const upload = await prisma.file.findUnique({ where: { id: uploadId } });
  if (!upload || upload.uploadedById !== user.id) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      uploadId: upload.id,
      fileName: upload.originalName,
      uploadProgress: upload.uploadProgress,
      status: upload.uploadProgress >= 100 ? 'ready' : 'uploading',
    },
  });
}
