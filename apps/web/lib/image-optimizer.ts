import sharp from 'sharp';

type OptimizeOptions = {
  width?: number;
  height?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  quality?: number;
};

export async function optimizeImage(
  buffer: Buffer,
  options: OptimizeOptions = {},
): Promise<Buffer> {
  let image = sharp(buffer);

  if (options.width || options.height) {
    image = image.resize(options.width || null, options.height || null, {
      fit: 'cover',
    });
  }

  const format = options.format || 'webp';
  const quality = options.quality ?? 80;

  switch (format) {
    case 'avif':
      image = image.avif({ quality });
      break;
    case 'jpeg':
      image = image.jpeg({ quality });
      break;
    case 'png':
      image = image.png();
      break;
    default:
      image = image.webp({ quality });
  }

  return image.toBuffer();
}

export async function generateBlurHash(buffer: Buffer): Promise<string> {
  const tiny = await sharp(buffer)
    .resize(32, 32, { fit: 'cover' })
    .webp({ quality: 20 })
    .toBuffer();

  return `data:image/webp;base64,${tiny.toString('base64')}`;
}

export async function generateThumbnail(
  buffer: Buffer,
  width: number,
  height: number,
): Promise<Buffer> {
  return optimizeImage(buffer, { width, height, format: 'webp', quality: 70 });
}

export function getOptimizedUrl(
  url: string,
  params: { width?: number; height?: number; format?: string; quality?: number } = {},
): string {
  if (!url || url.startsWith('/uploads/') || url.startsWith('http://localhost')) {
    return url;
  }

  const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.heritageverse.dev';
  const path = url.replace(/^https?:\/\/[^\/]+/, '');
  const qs = new URLSearchParams();
  if (params.width) qs.set('w', String(params.width));
  if (params.height) qs.set('h', String(params.height));
  if (params.format) qs.set('fm', params.format);
  if (params.quality) qs.set('q', String(params.quality));

  return `${baseUrl}${path}?${qs.toString()}`;
}
