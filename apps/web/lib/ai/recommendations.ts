// AI-powered reel recommendation engine
// Uses collaborative filtering + content-based scoring

import { prisma } from '@/lib/prisma';

interface RecommendationScore {
  reelId: string;
  score: number;
  reasons: string[];
}

// Get personalized reel recommendations for a user
export async function getRecommendations(
  userId?: string,
  limit: number = 20
): Promise<RecommendationScore[]> {
  if (!userId) {
    // Anonymous: return trending + recent
    return getTrendingRecommendations(limit);
  }

  const [
    watchHistory,
    likedReels,
    savedReels,
    followedCreators,
  ] = await Promise.all([
    prisma.reelView.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { reel: { select: { culturalTags: true, creatorId: true } } },
    }),
    prisma.reelLike.findMany({
      where: { userId },
      include: { reel: { select: { culturalTags: true, creatorId: true } } },
      take: 50,
    }),
    prisma.reelSave.findMany({
      where: { userId },
      include: { reel: { select: { culturalTags: true, creatorId: true } } },
      take: 50,
    }),
    prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    }),
  ]);

  // Extract user preferences
  const watchedIds = new Set(watchHistory.map((v: { reelId: string }) => v.reelId));
  const likedTagFrequency: Record<string, number> = {};
  const followedIds = new Set(followedCreators.map((f: { followingId: string }) => f.followingId));

  for (const like of likedReels) {
    for (const tag of like.reel.culturalTags) {
      likedTagFrequency[tag] = (likedTagFrequency[tag] || 0) + 2;
    }
  }
  for (const save of savedReels) {
    for (const tag of save.reel.culturalTags) {
      likedTagFrequency[tag] = (likedTagFrequency[tag] || 0) + 3;
    }
  }
  for (const view of watchHistory) {
    for (const tag of view.reel.culturalTags) {
      likedTagFrequency[tag] = (likedTagFrequency[tag] || 0) + 1;
    }
  }

  // Find candidate reels
  const candidates = await prisma.reel.findMany({
    where: {
      status: 'published',
      id: { notIn: Array.from(watchedIds) },
    },
    include: {
      creator: { select: { id: true, name: true, avatar: true } },
      _count: { select: { likes: true, comments: true, views: true } },
    },
    take: 100,
    orderBy: { createdAt: 'desc' },
  });

  // Score each candidate
  const scored: RecommendationScore[] = candidates.map((reel: { id: string; culturalTags: string[]; creatorId: string; _count: { likes: number; comments: number; views: number }; createdAt: Date }) => {
    let score = 0;
    const reasons: string[] = [];

    // Followed creator bonus
    if (followedIds.has(reel.creatorId)) {
      score += 50;
      reasons.push('From a creator you follow');
    }

    // Tag matching bonus
    for (const tag of reel.culturalTags) {
      if (likedTagFrequency[tag]) {
        score += likedTagFrequency[tag] * 5;
        reasons.push(`Matches your interest in ${tag}`);
      }
    }

    // Popularity bonus (diminishing returns)
    const total = reel._count.likes + reel._count.comments + reel._count.views;
    score += Math.min(20, Math.log10(total + 1) * 5);

    // Recency bonus
    const hoursAgo = (Date.now() - reel.createdAt.getTime()) / 3600000;
    if (hoursAgo < 24) score += 10;
    else if (hoursAgo < 72) score += 5;

    return { reelId: reel.id, score, reasons };
  });

  // Sort by score descending and take top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

async function getTrendingRecommendations(limit: number): Promise<RecommendationScore[]> {
  const trending = await prisma.reelTrending.findMany({
    where: { period: 'daily' },
    orderBy: { score: 'desc' },
    take: limit,
  });
  return trending.map((t: { reelId: string; score: number }) => ({
    reelId: t.reelId,
    score: t.score,
    reasons: ['Trending now'],
  }));
}

// Calculate trending scores (run via cron every hour)
export async function calculateTrendingScores(): Promise<void> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600000);

  const reels = await prisma.reel.findMany({
    where: {
      status: 'published',
      createdAt: { gte: twentyFourHoursAgo },
    },
    include: {
      _count: { select: { likes: true, comments: true, views: true } },
    },
  });

  for (const reel of reels) {
    const likeScore = reel._count.likes * 3;
    const commentScore = reel._count.comments * 5;
    const viewScore = Math.log10(reel._count.views + 1) * 2;
    const recency = Math.max(0, 10 - (Date.now() - reel.createdAt.getTime()) / 3600000);
    const score = likeScore + commentScore + viewScore + recency;

    await prisma.reelTrending.upsert({
      where: { reelId: reel.id },
      update: { score, calculatedAt: new Date() },
      create: { reelId: reel.id, score, period: 'daily' },
    });
  }
}
