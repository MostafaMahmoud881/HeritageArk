'use client';

import { Button } from '@heritageverse/ui';
import { useState } from 'react';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  exampleRequest: string;
  exampleResponse: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/ai/chat',
    description: 'Send a message to the AI chat assistant for heritage-related inquiries.',
    auth: false,
    exampleRequest: `GET /api/ai/chat?message=Tell+me+about+Nubian+heritage&locale=en`,
    exampleResponse: `{
  "data": {
    "message": "Nubian heritage is one of the oldest civilizations...",
    "sources": ["Nubian Museum", "UNESCO Archive"]
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/ai/translate',
    description: 'Translate text between supported heritage languages.',
    auth: false,
    exampleRequest: `GET /api/ai/translate?text=Hello&from=en&to=ar`,
    exampleResponse: `{
  "data": {
    "translated": "مرحبا",
    "from": "en",
    "to": "ar",
    "confidence": 0.97
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/upload',
    description: 'Upload media files (images, audio, video) to the HeritageArk platform.',
    auth: true,
    exampleRequest: `POST /api/upload
Content-Type: multipart/form-data

file: [binary image data]
type: image
folder: artifacts`,
    exampleResponse: `{
  "data": {
    "id": "file_abc123",
    "url": "https://cdn.heritageverse.dev/uploads/abc123.jpg",
    "type": "image",
    "size": 2048576
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate a user and receive a JWT token for subsequent API calls.',
    auth: false,
    exampleRequest: `POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "••••••••"
}`,
    exampleResponse: `{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "usr_123",
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/auth/register',
    description: 'Create a new user account on the HeritageArk platform.',
    auth: false,
    exampleRequest: `POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "••••••••",
  "locale": "en"
}`,
    exampleResponse: `{
  "data": {
    "id": "usr_456",
    "name": "John Doe",
    "email": "user@example.com",
    "verified": false
  }
}`,
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-green-600 bg-green-50 border-green-200',
  POST: 'text-blue-600 bg-blue-50 border-blue-200',
  PUT: 'text-orange-600 bg-orange-50 border-orange-200',
  DELETE: 'text-red-600 bg-red-50 border-red-200',
};

export default function ApiDocsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (path: string) => {
    setExpanded((prev) => (prev === path ? null : path));
  };

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase">Developers</span>
          <h1 className="text-4xl font-serif text-navy mt-2">HeritageArk API</h1>
          <p className="text-muted mt-3 max-w-2xl">
            Public API documentation for integrating with the HeritageArk platform.
            All endpoints return JSON responses with a consistent <code className="text-navy bg-muted/20 px-1.5 py-0.5 rounded text-sm font-mono">{'{ data, meta }'}</code> structure.
          </p>
        </div>

        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 mb-10 flex items-start gap-4">
          <span className="text-2xl shrink-0">🔌</span>
          <div>
            <p className="text-navy font-semibold text-sm">Base URL</p>
            <p className="text-navy/70 text-sm font-mono mt-1">https://api.heritageverse.dev</p>
            <p className="text-muted text-xs mt-2">
              All requests should include <code className="text-navy font-mono text-xs">Content-Type: application/json</code> where applicable.
              Authenticated endpoints require an <code className="text-navy font-mono text-xs">Authorization: Bearer &lt;token&gt;</code> header.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {ENDPOINTS.map((ep) => (
            <div
              key={ep.path}
              className="bg-white rounded-2xl border border-border shadow-card overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggle(ep.path)}
                className="w-full flex items-center gap-4 p-5 hover:bg-bg/50 transition-colors text-left"
              >
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${METHOD_COLORS[ep.method] || 'text-muted bg-muted/10 border-muted/20'}`}
                >
                  {ep.method}
                </span>
                <code className="text-navy font-mono text-sm flex-1">{ep.path}</code>
                <div className="flex items-center gap-3">
                  {ep.auth && (
                    <span className="text-xs text-muted bg-bg px-2 py-0.5 rounded-full border border-border/50">
                      Auth
                    </span>
                  )}
                  <svg
                    className={`w-4 h-4 text-muted transition-transform duration-200 ${expanded === ep.path ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expanded === ep.path && (
                <div className="border-t border-border px-5 py-5 space-y-5">
                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Description</h4>
                    <p className="text-sm text-navy">{ep.description}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Example Request</h4>
                    <pre className="bg-navy text-green-300 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                      {ep.exampleRequest}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Example Response</h4>
                    <pre className="bg-navy text-green-300 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                      {ep.exampleResponse}
                    </pre>
                  </div>

                  {ep.auth && (
                    <div className="flex items-center gap-2 text-xs text-muted bg-warning/10 border border-warning/20 rounded-xl px-4 py-3">
                      <span>🔒</span>
                      <span>This endpoint requires authentication. Include a valid JWT token in the Authorization header.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-navy rounded-2xl p-8 text-center">
          <span className="text-4xl block mb-4">🚀</span>
          <h2 className="text-2xl font-serif text-white mb-3">Ready to Build?</h2>
          <p className="text-white/60 max-w-lg mx-auto mb-6">
            Get your API keys and start integrating cultural heritage features into your applications.
          </p>
          <Button variant="primary" size="lg">
            Request API Access
          </Button>
        </div>
      </div>
    </div>
  );
}
