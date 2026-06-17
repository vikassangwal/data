import ResumeClient from './client';
import { getResumeEntries, getResumeProfile } from '@/app/actions/resume';
import { getStats } from '@/app/actions/homepage-cms';

export const dynamic = 'force-dynamic';

export default async function ResumePage() {
  const [resumeRes, profileRes, stats] = await Promise.all([
    getResumeEntries(),
    getResumeProfile(),
    getStats()
  ]);

  const entries = resumeRes.success && resumeRes.data ? resumeRes.data : [];

  // Filter active entries
  const activeEntries = entries.filter((e: any) => e.isActive);

  // Map to experience, education, and certifications
  const experience = activeEntries
    .filter((e: any) => e.type === 'experience')
    .map((e: any) => ({
      role: e.title,
      company: e.organization,
      period: `${e.startDate} – ${e.endDate || 'Present'}`,
      desc: e.description,
      achievements: []
    }));

  const education = activeEntries
    .filter((e: any) => e.type === 'education')
    .map((e: any) => ({
      degree: e.title,
      school: e.organization,
      year: e.startDate,
      desc: e.description
    }));

  const certifications = activeEntries
    .filter((e: any) => e.type === 'certification')
    .map((e: any) => ({
      title: e.title,
      organization: e.organization,
      year: `${e.startDate}${e.endDate ? ' – ' + e.endDate : ''}`,
      desc: e.description
    }));

  const profile = profileRes.success && profileRes.data ? profileRes.data : {
    name: 'Alex Kumar',
    initials: 'AK',
    title: 'Data Analyst · AI Engineer · Full-Stack Developer',
    bio: '7+ years transforming data into intelligence...',
    photoUrl: '',
    cvUrl: ''
  };

  return (
    <ResumeClient
      kpis={stats}
      profile={profile}
      experience={experience}
      education={education}
      certifications={certifications}
    />
  );
}
