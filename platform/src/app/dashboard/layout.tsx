import { Metadata } from 'next';
import UserSidebar from '@/components/layout/UserSidebar';

export const metadata: Metadata = {
  title: 'Dashboard | DevFort Analytics',
  description: 'Enterprise Data Analytics Platform',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-300">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
