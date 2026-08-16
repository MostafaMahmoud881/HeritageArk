'use client';

import { useState } from 'react';
import { Badge, Button } from '@heritageverse/ui';
import { EXPEDITIONS } from '@/lib/data';

export default function ExpeditionsPage() {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <span className="text-accent text-sm font-semibold tracking-widest uppercase">Fieldwork</span>
        <h1 className="text-4xl font-serif text-navy mt-2">Cultural Expeditions</h1>
        <p className="text-muted mt-3 max-w-xl">Active and completed fieldwork missions across heritage communities worldwide.</p>
        
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {EXPEDITIONS.map(exp => (
            <div key={exp.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-card transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-navy">{exp.name}</h3>
                  <p className="text-xs text-muted">{exp.region}</p>
                </div>
                <Badge variant={exp.status === 'Active' ? 'accent' : exp.status === 'Completed' ? 'success' : 'muted'} size="sm">{exp.status}</Badge>
              </div>
              <p className="text-sm text-muted mb-3">{exp.mission}</p>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>Lead: {exp.lead}</span>
                <span>·</span>
                <span>{exp.progress}% complete</span>
              </div>
              <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${exp.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}