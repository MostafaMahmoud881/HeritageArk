type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'audit';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  data?: Record<string, unknown>;
}

const isProduction = process.env.NODE_ENV === 'production';

function formatEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    requestId: (typeof globalThis !== 'undefined' && (globalThis as any).__requestId) ?? undefined,
    data,
  };

  if (isProduction) {
    process.stdout.write(formatEntry(entry) + '\n');
  } else {
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    if (data && Object.keys(data).length > 0) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }
}

export function debug(message: string, data?: Record<string, unknown>) {
  log('debug', message, data);
}

export function info(message: string, data?: Record<string, unknown>) {
  log('info', message, data);
}

export function warn(message: string, data?: Record<string, unknown>) {
  log('warn', message, data);
}

export function error(message: string, data?: Record<string, unknown>) {
  log('error', message, data);
}

export function audit(message: string, data?: Record<string, unknown>) {
  log('audit', message, data);
}

export function setRequestId(id: string) {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__requestId = id;
  }
}

export const logger = { debug, info, warn, error, audit, setRequestId };
