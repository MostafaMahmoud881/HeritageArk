'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Badge } from '@heritageverse/ui';

const STATS = [
  { value: '500+', label: 'Schools', icon: '🏫' },
  { value: '10,000+', label: 'Students', icon: '👩‍🎓' },
  { value: '1,000+', label: 'Teachers', icon: '👨‍🏫' },
];

const CURRICULUM_AREAS = [
  { subject: 'History', standards: 'Chronological understanding, historical inquiry', countries: 'UK, USA, India, Australia' },
  { subject: 'Geography', standards: 'Spatial awareness, cultural geography, map skills', countries: 'Canada, South Africa, UAE' },
  { subject: 'Social Studies', standards: 'Cultural diversity, global citizenship, heritage awareness', countries: 'USA, Singapore, Kenya' },
  { subject: 'Language Arts', standards: 'Multilingual literacy, oral history, storytelling', countries: 'France, Germany, Japan' },
  { subject: 'Art & Design', standards: 'Visual culture, traditional crafts, aesthetic appreciation', countries: 'Italy, Mexico, China' },
];

export default function EducationPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || 'en';
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');

  const go = (path: string) => router.push(`/${locale}${path}`);

  return (
    <div className="min-h-screen bg-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy rounded-2xl p-8 md:p-12 mb-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-6xl">🎓</div>
            <div>
              <span className="text-accent text-sm font-semibold tracking-widest uppercase">Ministry of Education</span>
              <h1 className="text-3xl md:text-4xl font-serif text-white mt-2">HeritageArk for Schools</h1>
              <p className="text-white/60 mt-3 max-w-2xl">
                Bringing cultural heritage into the classroom. Free educational access for accredited schools and educational institutions worldwide.
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <Button size="lg" onClick={() => go('/contact')}>Apply for Free Access</Button>
                <Button variant="outline" size="lg" onClick={() => go('/about')}>View Case Studies</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-border shadow-card p-6 text-center">
              <span className="text-4xl block mb-3">{stat.icon}</span>
              <p className="text-3xl font-bold text-navy">{stat.value}</p>
              <p className="text-muted text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveTab('teacher')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'teacher' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-navy'
            }`}
          >
            👨‍🏫 Teacher Dashboard
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'student' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-navy'
            }`}
          >
            👩‍🎓 Student Portal
          </button>
        </div>

        {activeTab === 'teacher' ? (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl border border-border shadow-card p-6">
                <span className="text-3xl block mb-3">📋</span>
                <h3 className="font-serif text-navy text-lg mb-2">Classroom Management</h3>
                <p className="text-sm text-muted mb-4">Create and manage classes, assign students, and track participation across heritage modules.</p>
                <ul className="space-y-2 text-sm text-navy/70">
                  <li className="flex items-center gap-2">✓ Create up to 10 classes</li>
                  <li className="flex items-center gap-2">✓ Import student rosters</li>
                  <li className="flex items-center gap-2">✓ Set curriculum path</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-card p-6">
                <span className="text-3xl block mb-3">📝</span>
                <h3 className="font-serif text-navy text-lg mb-2">Assignments</h3>
                <p className="text-sm text-muted mb-4">Design heritage-based assignments with interactive maps, artifact analysis, and cultural research tasks.</p>
                <ul className="space-y-2 text-sm text-navy/70">
                  <li className="flex items-center gap-2">✓ Interactive worksheets</li>
                  <li className="flex items-center gap-2">✓ Quiz builder</li>
                  <li className="flex items-center gap-2">✓ Project templates</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-card p-6">
                <span className="text-3xl block mb-3">📊</span>
                <h3 className="font-serif text-navy text-lg mb-2">Progress Reports</h3>
                <p className="text-sm text-muted mb-4">View detailed analytics on student engagement, assessment scores, and curriculum completion rates.</p>
                <ul className="space-y-2 text-sm text-navy/70">
                  <li className="flex items-center gap-2">✓ Weekly reports</li>
                  <li className="flex items-center gap-2">✓ Skill breakdown</li>
                  <li className="flex items-center gap-2">✓ Export to PDF</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">📚</span>
                <h2 className="text-xl font-serif text-navy">Active Classrooms</h2>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'World History 101', students: 28, assignments: 4, progress: 72 },
                  { name: 'Cultural Geography', students: 22, assignments: 3, progress: 58 },
                  { name: 'Indigenous Studies', students: 18, assignments: 5, progress: 85 },
                ].map((cls) => (
                  <div key={cls.name} className="flex items-center justify-between bg-bg rounded-xl p-4">
                    <div>
                      <p className="text-navy font-medium text-sm">{cls.name}</p>
                      <p className="text-xs text-muted mt-0.5">{cls.students} students · {cls.assignments} assignments</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-border rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: `${cls.progress}%` }} />
                      </div>
                      <span className="text-xs font-medium text-navy">{cls.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl border border-border shadow-card p-6">
                <span className="text-3xl block mb-3">📖</span>
                <h3 className="font-serif text-navy text-lg mb-2">Enrolled Classes</h3>
                <p className="text-sm text-muted mb-4">Access your enrolled heritage courses and view upcoming lessons, materials, and deadlines.</p>
                <Badge variant="accent" size="sm">3 Active Classes</Badge>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-card p-6">
                <span className="text-3xl block mb-3">✅</span>
                <h3 className="font-serif text-navy text-lg mb-2">Assignments</h3>
                <p className="text-sm text-muted mb-4">Complete and submit heritage-based assignments. Track your grades and teacher feedback.</p>
                <Badge variant="muted" size="sm">2 Pending · 5 Completed</Badge>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-card p-6">
                <span className="text-3xl block mb-3">📈</span>
                <h3 className="font-serif text-navy text-lg mb-2">Progress Tracking</h3>
                <p className="text-sm text-muted mb-4">Monitor your learning journey across cultural heritage topics and skill areas.</p>
                <Badge variant="success" size="sm">Overall: 78%</Badge>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">🎯</span>
                <h2 className="text-xl font-serif text-navy">My Learning Path</h2>
              </div>
              <div className="space-y-3">
                {[
                  { module: 'Ancient Civilizations', progress: 90, status: 'In Progress' },
                  { module: 'World Heritage Sites', progress: 45, status: 'In Progress' },
                  { module: 'Cultural Preservation', progress: 100, status: 'Completed' },
                ].map((mod) => (
                  <div key={mod.module} className="flex items-center justify-between bg-bg rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${mod.status === 'Completed' ? 'bg-green-400' : 'bg-accent'}`} />
                      <div>
                        <p className="text-navy font-medium text-sm">{mod.module}</p>
                        <p className="text-xs text-muted">{mod.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 bg-border rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: `${mod.progress}%` }} />
                      </div>
                      <span className="text-xs font-medium text-navy">{mod.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-border shadow-card p-6 md:p-8 mt-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔗</span>
            <h2 className="text-xl font-serif text-navy">Curriculum Alignment</h2>
          </div>
          <p className="text-sm text-muted mb-6">
            HeritageArk content is mapped to national educational standards across multiple countries.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-navy font-semibold">Subject</th>
                  <th className="text-left py-3 px-4 text-navy font-semibold">Standards Aligned</th>
                  <th className="text-left py-3 px-4 text-navy font-semibold">Countries</th>
                </tr>
              </thead>
              <tbody>
                {CURRICULUM_AREAS.map((area) => (
                  <tr key={area.subject} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-4 text-navy font-medium">{area.subject}</td>
                    <td className="py-3 px-4 text-muted">{area.standards}</td>
                    <td className="py-3 px-4 text-muted">{area.countries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🤝</span>
            <h2 className="text-xl font-serif text-navy">Ministry Partnerships</h2>
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-card p-6 md:p-8">
            <p className="text-sm text-muted leading-relaxed">
              We are actively pursuing strategic partnerships with educational ministries, research institutes, and educational organizations worldwide. Our goal is to integrate HeritageArk into national curricula, support heritage-focused research, and expand access to cultural education for students everywhere. If your institution shares this vision, we would welcome the opportunity to collaborate.
            </p>
            <div className="mt-6">
              <Button size="sm" onClick={() => go('/contact')}>Inquire About Partnership</Button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-8 mt-10 text-center">
          <span className="text-5xl block mb-4">🌍</span>
          <h2 className="text-2xl font-serif text-navy mb-3">Free Educational Access</h2>
          <p className="text-muted max-w-2xl mx-auto mb-6">
            HeritageArk is committed to making cultural heritage education accessible to all.
            Accredited schools and educational institutions receive free access to the full platform, including all premium features.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => go('/contact')}>Apply Now</Button>
            <Button variant="outline" size="lg" onClick={() => go('/about')}>Learn More</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
