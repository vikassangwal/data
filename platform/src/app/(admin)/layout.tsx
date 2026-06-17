import { ReactNode } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import NextAuthProvider from '@/components/providers/NextAuthProvider';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin Dashboard | DevForge Platform',
  description: 'Enterprise CMS and Analytics Platform Admin',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/admin-login');
  }
  
  if (session.user.role !== 'SUPER-ADMIN') {
    redirect('/unauthorized'); // or handle gracefully
  }

  return (
    <NextAuthProvider>
      <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/20">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NextAuthProvider>
  );
}
