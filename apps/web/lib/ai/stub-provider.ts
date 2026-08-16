import { BaseAIProvider, type VideoGenerationParams, type VideoGenerationResult, type JobStatus, type ProviderCapabilities, registerProvider } from './providers';

export class StubAIProvider extends BaseAIProvider {
  name = 'Stub Provider';
  slug = 'stub';
  capabilities: ProviderCapabilities = {
    maxDuration: 60,
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '21:9'],
    qualities: ['standard', 'high', 'ultra'],
    supportsImageToVideo: true,
    supportsStoryToVideo: true,
    supportsStylePresets: true,
    stylePresets: ['cinematic', 'documentary', 'animated', 'watercolor', 'pixel-art', 'cultural-heritage'],
  };

  async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    const jobId = `stub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      providerJobId: jobId,
      status: 'completed',
      outputUrl: `https://placehold.co/640x360/0B132B/D4A373?text=AI+Generated+Video&font=playfair-display`,
      thumbnailUrl: `https://placehold.co/320x180/0B132B/D4A373?text=Preview`,
      estimatedDuration: params.duration,
    };
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    return { status: 'completed', progress: 100 };
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    return true;
  }
}

const stub = new StubAIProvider();
registerProvider(stub);
export default stub;
