import { Metadata } from 'next';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import { Activity, DollarSign, CreditCard, Shield, List } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Monitoring Hub | Admin Dashboard',
};

const tabs = [
  { name: 'Revenue', href: '/admin/monitoring/revenue', icon: <DollarSign size={16} /> },
  { name: 'Payments', href: '/admin/monitoring/payments', icon: <CreditCard size={16} /> },
  { name: 'Activity Logs', href: '/admin/monitoring/activity', icon: <Activity size={16} /> },
  { name: 'Audit Logs', href: '/admin/monitoring/audit', icon: <List size={16} /> },
  { name: 'Security Center', href: '/admin/monitoring/security', icon: <Shield size={16} /> },
];

export default function MonitoringLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      <AdminHeader />
      
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-3 flex gap-4 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => (
          <Link 
            key={tab.name} 
            href={tab.href}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            {tab.icon}
            {tab.name}
          </Link>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}
