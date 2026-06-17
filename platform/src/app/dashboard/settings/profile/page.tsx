import { Metadata } from 'next';
import ProfileClient from './client';

export const metadata: Metadata = {
  title: 'My Profile | DevFort Analytics',
  description: 'Manage your profile settings',
};

export default function ProfilePage() {
  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-slate-400 mb-8">Manage your personal information, security, and subscription.</p>
        <ProfileClient />
      </div>
    </div>
  );
}
