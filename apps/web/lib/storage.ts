type StorageConfig = {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  publicUrl: string;
};

function getConfig(): StorageConfig {
  return {
    endpoint: process.env.STORAGE_ENDPOINT || '',
    accessKey: process.env.STORAGE_ACCESS_KEY || '',
    secretKey: process.env.STORAGE_SECRET_KEY || '',
    bucket: process.env.STORAGE_BUCKET || '',
    publicUrl: process.env.STORAGE_PUBLIC_URL || '',
  };
}

function isConfigured(): boolean {
  const cfg = getConfig();
  return !!(cfg.endpoint && cfg.accessKey && cfg.secretKey && cfg.bucket);
}

async function hmacSha256(key: string | Uint8Array, message: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const keyBytes = typeof key === 'string' ? enc.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const msgBytes = enc.encode(message) as unknown as ArrayBuffer;
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, msgBytes);
  return new Uint8Array(sig);
}

function hex(buffer: Uint8Array): string {
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSignatureKey(key: string, dateStamp: string, region: string): Promise<Uint8Array> {
  const kDate = await hmacSha256('AWS4' + key, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, 's3');
  const kSigning = await hmacSha256(kService, 'aws4_request');
  return kSigning;
}

async function signRequest(
  method: string,
  path: string,
  headers: Record<string, string>,
  body: string,
  config: StorageConfig,
): Promise<Record<string, string>> {
  const region = 'auto';
  const service = 's3';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
  const dateStamp = amzDate.slice(0, 8);

  const signedHeaders = Object.keys(headers).map(h => h.toLowerCase()).sort().join(';');

  const canonicalRequest = [
    method,
    path,
    '',
    ...Object.entries(headers)
      .map(([k, v]) => `${k.toLowerCase()}:${v}`)
      .sort(),
    '',
    signedHeaders,
    hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body)))),
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)))),
  ].join('\n');

  const signingKey = await getSignatureKey(config.secretKey, dateStamp, region);
  const signature = hex(await hmacSha256(signingKey, stringToSign));

  const authorizationHeader = [
    'AWS4-HMAC-SHA256',
    `Credential=${config.accessKey}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(', ');

  return { ...headers, Authorization: authorizationHeader, 'x-amz-date': amzDate };
}

export async function uploadFile(file: File, key: string): Promise<{ url: string }> {
  if (!isConfigured()) {
    const { writeFile, mkdir } = await import('fs/promises');
    const path = await import('path');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}-${key.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
    return { url: `/uploads/${filename}` };
  }

  const config = getConfig();
  const body = await file.arrayBuffer();
  const contentType = file.type || 'application/octet-stream';
  const path = `/${config.bucket}/${key}`;
  const headers: Record<string, string> = {
    host: new URL(config.endpoint).host,
    'content-length': String(body.byteLength),
    'content-type': contentType,
  };

  const signed = await signRequest('PUT', path, headers, '', config);

  const url = `${config.endpoint}${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: signed,
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`S3 upload failed: ${res.status} ${text}`);
  }

  return { url: `${config.publicUrl || config.endpoint}/${config.bucket}/${key}` };
}

export async function deleteFile(key: string): Promise<void> {
  if (!isConfigured()) {
    const { unlink } = await import('fs/promises');
    const path = await import('path');
    try {
      await unlink(path.join(process.cwd(), 'public', 'uploads', key));
    } catch {}
    return;
  }

  const config = getConfig();
  const path = `/${config.bucket}/${key}`;
  const headers: Record<string, string> = {
    host: new URL(config.endpoint).host,
  };

  const signed = await signRequest('DELETE', path, headers, '', config);

  const res = await fetch(`${config.endpoint}${path}`, {
    method: 'DELETE',
    headers: signed,
  });

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`S3 delete failed: ${res.status} ${text}`);
  }
}

export async function getSignedUrl(key: string): Promise<string> {
  if (!isConfigured()) {
    return `/uploads/${key}`;
  }

  const config = getConfig();
  const path = `/${config.bucket}/${key}`;
  const expiration = Math.floor(Date.now() / 1000) + 3600;
  const headers: Record<string, string> = {
    host: new URL(config.endpoint).host,
  };

  const signed = await signRequest('GET', path, headers, '', config);
  const params = new URLSearchParams();
  params.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  params.set('X-Amz-Credential', signed.Authorization?.match(/Credential=([^,]+)/)?.[1] || '');
  params.set('X-Amz-Date', signed['x-amz-date'] || '');
  params.set('X-Amz-Expires', '3600');
  params.set('X-Amz-SignedHeaders', 'host');
  params.set('X-Amz-Signature', signed.Authorization?.match(/Signature=([^,]+)/)?.[1] || '');

  return `${config.endpoint}${path}?${params.toString()}`;
}
