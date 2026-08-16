import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } },
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'video.view'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
      select: {
        id: true,
        title: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        shareCount: true,
        saveCount: true,
        followersGained: true,
        watchTime: true,
        avgWatchTime: true,
        ctr: true,
        audienceAge: true,
        audienceGender: true,
        audienceGeo: true,
        trafficSources: true,
        deviceTypes: true,
        createdAt: true,
      },
    });
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

    const [totalViews, uniqueViewers, likes, comments] = await Promise.all([
      prisma.videoView.count({ where: { videoId: params.videoId } }),
      prisma.videoView.groupBy({
        by: ['userId'],
        where: { videoId: params.videoId, userId: { not: null } },
      }),
      prisma.videoLike.count({ where: { videoId: params.videoId } }),
      prisma.videoComment.count({ where: { videoId: params.videoId } }),
    ]);

    return NextResponse.json({
      data: {
        ...video,
        totalViews,
        uniqueViewers: uniqueViewers.length,
        likes,
        comments,
        engagementRate: video.viewCount > 0
          ? ((video.likeCount + video.commentCount + video.shareCount) / video.viewCount) * 100
          : 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
