const DANGEROUS_PATTERNS = [
  /<script[\s>]/gi,
  /<script[\s\S]*?<\/script>/gi,
  /on\w+\s*=/gi,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /<embed[\s>]/gi,
  /<object[\s>]/gi,
  /<iframe[\s>]/gi,
  /expression\s*\(/gi,
  /vbscript\s*:/gi,
  /<svg[\s\S]*?onload\s*=/gi,
  /xlink:\s*href\s*=/gi,
  /xmlns:\s*xlink/gi,
  /<\s*foreignObject[\s>]/gi,
  /<\s*use[\s>]/gi,
  /<\s*animate[\s>]/gi,
  /<\s*animatetransform[\s>]/gi,
  /<\s*set[\s>]/gi,
  /import\s*\(/gi,
  /eval\s*\(/gi,
];

const ALLOWED_SVG_TAGS = [
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon',
  'text', 'tspan', 'textPath', 'defs', 'clipPath', 'mask', 'pattern', 'linearGradient',
  'radialGradient', 'stop', 'filter', 'feGaussianBlur', 'feOffset', 'feMerge',
  'feMergeNode', 'feColorMatrix', 'feBlend', 'feComposite', 'feFlood',
  'feImage', 'feTile', 'feComponentTransfer', 'feFuncR', 'feFuncG', 'feFuncB',
  'feFuncA', 'title', 'desc', 'metadata', 'style', 'symbol', 'marker',
  'view', 'switch', 'image', 'a',
];

const ALLOWED_ATTRS = [
  'id', 'class', 'style', 'fill', 'stroke', 'stroke-width', 'stroke-linecap',
  'stroke-linejoin', 'stroke-opacity', 'fill-opacity', 'opacity', 'transform',
  'd', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
  'width', 'height', 'viewBox', 'preserveAspectRatio', 'xmlns', 'version',
  'points', 'pathLength', 'text-anchor', 'font-size', 'font-family',
  'font-weight', 'font-style', 'letter-spacing', 'dx', 'dy', 'rotate',
  'offset', 'stop-color', 'stop-opacity', 'gradientUnits', 'gradientTransform',
  'spreadMethod', 'cx%', 'cy%', 'r%', 'fx', 'fy', 'fr', 'type', 'values',
  'stdDeviation', 'result', 'in', 'in2', 'mode', 'color-interpolation-filters',
  'scale', 'translate', 'href', 'target', 'role', 'aria-label',
];

function isAllowedTag(tag: string): boolean {
  return ALLOWED_SVG_TAGS.includes(tag.toLowerCase());
}

function isAllowedAttr(attr: string): boolean {
  const name = attr.split(':')[0] || attr;
  return ALLOWED_ATTRS.includes(name.toLowerCase());
}

export interface SanitizeResult {
  safe: boolean;
  sanitized: string | null;
  error?: string;
}

export function sanitizeSvg(input: string): SanitizeResult {
  if (!input || typeof input !== 'string') {
    return { safe: false, sanitized: null, error: 'No SVG content provided' };
  }

  if (!input.includes('<svg') && !input.includes('<?xml')) {
    return { safe: false, sanitized: null, error: 'Not a valid SVG file' };
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      return { safe: false, sanitized: null, error: 'SVG contains dangerous content (scripts, event handlers, or external references)' };
    }
  }

  const cleaned = input
    .replace(/<\s*script[\s\S]*?<\/script\s*>/gi, '')
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\bon\w+\s*=\s*\S+/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');

  return { safe: true, sanitized: cleaned };
}

export function sanitizeSvgStrict(input: string): SanitizeResult {
  const result = sanitizeSvg(input);
  if (!result.safe) return result;

  if (!result.sanitized) {
    return { safe: false, sanitized: null, error: 'Sanitization produced empty output' };
  }

  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(result.sanitized)) !== null) {
    const tag = match[1];
    if (tag && !isAllowedTag(tag)) {
      return { safe: false, sanitized: null, error: `Disallowed SVG tag: <${tag}>` };
    }
  }

  const attrRegex = /\s([a-zA-Z][a-zA-Z0-9:.-]*)\s*=/g;
  while ((match = attrRegex.exec(result.sanitized)) !== null) {
    const attr = match[1];
    if (attr && !isAllowedAttr(attr)) {
      return { safe: false, sanitized: null, error: `Disallowed SVG attribute: ${attr}` };
    }
  }

  return result;
}
