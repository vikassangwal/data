import { Metadata } from 'next';
import Link from 'next/link';
import { Activity, CreditCard, Lock, Bell, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Settings | DevFort Analytics',
  description: 'Manage your settings',
};

const settingsItems = [
  { name: 'Profile Settings', description: 'Update your personal information', href: '/dashboard/settings/profile', icon: User },
  { name: 'My Activity & Privacy', description: 'View your activity logs and login history', href: '/dashboard/settings/activity', icon: Activity },
  { name: 'My Payments', description: 'View your payment history and invoices', href: '/dashboard/settings/payments', icon: CreditCard },
  { name: 'Security', description: 'Manage passwords and 2FA', href: '/dashboard/settings/security', icon: Lock },
  { name: 'Notifications', description: 'Manage email and push alerts', href: '/dashboard/settings/notifications', icon: Bell },
];

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400 mb-8">Manage your account preferences, privacy, and billing.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsItems.map((item) => (
            <Link key={item.name} href={item.href} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-primary transition-colors flex gap-4 items-start group">
              <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <item.icon size={24} className="text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
