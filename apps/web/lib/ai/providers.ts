export interface AIProviderInterface {
  name: string;
  slug: string;
  generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult>;
  getJobStatus(jobId: string): Promise<JobStatus>;
  validateApiKey(apiKey: string): Promise<boolean>;
  estimateCost(params: VideoGenerationParams): number;
  capabilities: ProviderCapabilities;
}

export interface VideoGenerationParams {
  prompt: string;
  negativePrompt?: string;
  imageUrl?: string;
  storyText?: string;
  duration: number;
  aspectRatio: string;
  quality: string;
  style?: string;
  language?: string;
}

export interface VideoGenerationResult {
  providerJobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
  estimatedDuration: number;
}

export interface JobStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  errorMessage?: string;
}

export interface ProviderCapabilities {
  maxDuration: number;
  aspectRatios: string[];
  qualities: string[];
  supportsImageToVideo: boolean;
  supportsStoryToVideo: boolean;
  supportsStylePresets: boolean;
  stylePresets?: string[];
}

export abstract class BaseAIProvider implements AIProviderInterface {
  abstract name: string;
  abstract slug: string;
  abstract capabilities: ProviderCapabilities;

  abstract generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult>;
  abstract getJobStatus(jobId: string): Promise<JobStatus>;
  abstract validateApiKey(apiKey: string): Promise<boolean>;

  estimateCost(params: VideoGenerationParams): number {
    const baseCost = 0.05;
    const durationMultiplier = params.duration / 5;
    const qualityMultiplier = params.quality === 'ultra' ? 3 : params.quality === 'high' ? 2 : 1;
    return +(baseCost * durationMultiplier * qualityMultiplier).toFixed(4);
  }
}

const providers = new Map<string, AIProviderInterface>();

export function registerProvider(provider: AIProviderInterface) {
  providers.set(provider.slug, provider);
}

export function getProvider(slug: string): AIProviderInterface | undefined {
  return providers.get(slug);
}

export function getAllProviders(): AIProviderInterface[] {
  return Array.from(providers.values());
}
