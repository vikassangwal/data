import { getResumeEntries, getResumeProfile } from '@/app/actions/resume';
import ResumeEditorClient from './client';

export const dynamic = 'force-dynamic';

export default async function ResumeEditorPage() {
  const [entriesRes, profileRes] = await Promise.all([
    getResumeEntries(),
    getResumeProfile()
  ]);

  if (!entriesRes.success) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-2">Error loading resume entries</h2>
        <p>{entriesRes.error}</p>
      </div>
    );
  }

  const profile = profileRes.success && profileRes.data ? profileRes.data : {
    name: 'Alex Kumar',
    initials: 'AK',
    title: 'Data Analyst · AI Engineer · Full-Stack Developer',
    bio: '7+ years transforming data into intelligence...',
    photoUrl: '',
    cvUrl: '',
    id: 'default',
    updatedAt: new Date()
  };

  return <ResumeEditorClient initialEntries={entriesRes.data || []} initialProfile={profile} />;
}
