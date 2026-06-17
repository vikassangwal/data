import { Metadata } from 'next';
import AdminHeader from '@/components/admin/AdminHeader';
import UserManagementClient from './client';

export const metadata: Metadata = {
  title: 'User Management | Admin Dashboard',
  description: 'Manage users, roles, and pricing plans.',
};

export default function AdminUsersPage() {
  return (
    <div className="flex-1 overflow-auto bg-slate-950 text-white min-h-screen">
      <AdminHeader />
      <div className="p-6">
        <UserManagementClient />
      </div>
    </div>
  );
}
