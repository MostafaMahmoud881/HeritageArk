import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

interface Comment {
  id: string;
  refId: string;
  refType: 'culture' | 'news' | 'article';
  author: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const refId = searchParams.get('refId');
  const refType = searchParams.get('refType') as Comment['refType'] | null;

  const where: Record<string, unknown> = {};
  if (refId) where.refId = refId;
  if (refType) where.refType = refType;

  const comments = await prisma.comment.findMany({
    where,
    include: { author: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ data: comments, total: comments.length });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { refId, refType, content, parentId } = await request.json();

    if (!refId || !refType || !content) {
      return NextResponse.json(
        { error: 'refId, refType, and content are required' },
        { status: 400 }
      );
    }

    if (!['culture', 'news', 'article'].includes(refType)) {
      return NextResponse.json(
        { error: 'refType must be culture, news, or article' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        refId,
        refType,
        text: content,
        authorId: user.id,
        parentId: parentId || null,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    console.error('[COMMENTS_API] Creation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
