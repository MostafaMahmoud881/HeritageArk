import { NextResponse } from 'next/server';

const NEWS = [
  { id: 1, title: 'UNESCO Adds 12 New Heritage Sites in 2026', source: 'Heritage Daily', date: '2026-06-26', status: 'published' },
  { id: 2, title: 'Digital Preservation Initiative Launched for Ancient Petra', source: 'Archaeology Magazine', date: '2026-06-24', status: 'published' },
  { id: 3, title: 'Indigenous Communities Regain Access to Sacred Artifacts', source: 'Cultural Survival', date: '2026-06-22', status: 'draft' },
  { id: 4, title: 'AI-Powered Translation Revives Endangered Languages', source: 'Tech & Culture', date: '2026-06-20', status: 'published' },
  { id: 5, title: 'Climate Change Threatens Coastal Heritage Sites', source: 'National Geographic', date: '2026-06-18', status: 'scheduled' },
];

export async function GET() {
  return NextResponse.json(NEWS);
}
