import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { hasPermission } from '@heritageverse/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role as any, 'video.create' as any))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const {
      prompt,
      negativePrompt,
      imageUrl,
      storyText,
      type = 'text-to-video',
      duration = 5,
      aspectRatio = '16:9',
      quality = 'standard',
      style,
      language = 'en',
    } = body;

    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

    const creditsNeeded = quality === 'ultra' ? 5 : quality === 'high' ? 3 : 1;

    let balance = await prisma.creditBalance.findUnique({ where: { userId: user.id } });
    if (!balance) {
      balance = await prisma.creditBalance.create({
        data: { userId: user.id },
      });
    }

    if (balance.videoCredits < creditsNeeded) {
      return NextResponse.json({ error: 'Insufficient video credits' }, { status: 402 });
    }

    let provider = await prisma.aIProvider.findFirst({
      where: { enabled: true, apiKeys: { some: { isActive: true } } },
      orderBy: { isDefault: 'desc' },
    });

    const useStub = !provider;

    if (useStub) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'AI generation not configured' }, { status: 503 });
      }
      provider = await prisma.aIProvider.findFirst({ where: { slug: 'stub' } });
      if (!provider) {
        provider = await prisma.aIProvider.create({
          data: {
            name: 'Stub',
            slug: 'stub',
            description: 'Simulated provider for development',
            enabled: true,
            isDefault: false,
            monthlyLimit: 10,
            dailyLimit: 2,
            maxConcurrentJobs: 1,
            cooldownSeconds: 60,
          },
        });
      }
    }

    const job = await prisma.aIGenerationJob.create({
      data: {
        providerId: provider!.id,
        type,
        prompt,
        negativePrompt,
        imageUrl,
        storyText,
        duration,
        aspectRatio,
        quality,
        style,
        language,
        creatorId: user.id,
        status: useStub ? 'completed' : 'queued',
        progress: useStub ? 100 : 0,
        outputUrl: useStub ? 'https://cdn.heritageverse.dev/stub/output.mp4' : null,
        thumbnailUrl: useStub ? 'https://cdn.heritageverse.dev/stub/thumbnail.jpg' : null,
        creditsUsed: creditsNeeded,
        completedAt: useStub ? new Date() : null,
      },
    });

    await prisma.generationHistory.create({
      data: {
        jobId: job.id,
        prompt,
        type,
        status: job.status,
        provider: provider!.name,
        duration,
        aspectRatio,
        quality,
        style,
        creditsUsed: creditsNeeded,
      },
    });

    await prisma.creditBalance.update({
      where: { id: balance.id },
      data: { videoCredits: { decrement: creditsNeeded } },
    });

    await prisma.creditTransaction.create({
      data: {
        balanceId: balance.id,
        type: 'use',
        creditType: 'video',
        amount: -creditsNeeded,
        description: `Video generation: ${type}`,
        refId: job.id,
      },
    });

    return NextResponse.json({ data: job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create generation job' }, { status: 500 });
  }
}
