import { auth } from '@/auth';
import prisma from '@/lib/db';
import { ArrowRight, Database, Users, TrendingUp, Activity, Plus, FileText, Link as LinkIcon, HardDrive, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  
  // Fetch actual recent activity
  const recentActivity = await prisma.userActivityLog.findMany({
    where: { userId: session?.user?.id },
    orderBy: { timestamp: 'desc' },
    take: 5
  });

  // Fetch Data Sources
  const dataSources = await prisma.dataSourceConnection.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {session?.user?.name || 'User'}!</h1>
        <p className="text-slate-400 mb-8">Here's an overview of your workspace and recent activity.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Projects', value: '3', icon: Database, color: 'text-blue-500' },
            { label: 'Team Members', value: '12', icon: Users, color: 'text-emerald-500' },
            { label: 'Total Queries', value: '45.2k', icon: Activity, color: 'text-purple-500' },
            { label: 'Growth', value: '+14%', icon: TrendingUp, color: 'text-amber-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-slate-950 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
            <div className="space-y-3 flex-1">
              <Link href="/dashboard/datasets" className="flex items-center justify-between p-4 rounded-lg bg-slate-950 hover:bg-slate-800 transition-colors group">
                <div className="flex items-center gap-3">
                  <Database className="text-primary" size={20} />
                  <span className="font-medium text-slate-300 group-hover:text-white">Dataset Portal</span>
                </div>
                <ArrowRight className="text-slate-500 group-hover:text-primary transition-colors" size={16} />
              </Link>
              <Link href="/dashboard/settings/profile" className="flex items-center justify-between p-4 rounded-lg bg-slate-950 hover:bg-slate-800 transition-colors group">
                <div className="flex items-center gap-3">
                  <Users className="text-primary" size={20} />
                  <span className="font-medium text-slate-300 group-hover:text-white">Profile Settings</span>
                </div>
                <ArrowRight className="text-slate-500 group-hover:text-primary transition-colors" size={16} />
              </Link>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-4 flex-1">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-4 items-start border-b border-slate-800/50 pb-4 last:border-0 last:pb-0">
                    <div className="p-2 bg-slate-950 rounded-full border border-slate-800 mt-1 shrink-0">
                       <Clock size={14} className="text-slate-400"/>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{activity.action}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {activity.module} {activity.resource ? `• ${activity.resource}` : ''}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider font-bold">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950 rounded-lg border border-slate-800/50">
                <Activity className="mx-auto text-slate-600 mb-2" size={32} />
                <p className="text-slate-400 text-sm">No recent activity to display.</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Data Connections */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Active Data Connections</h2>
              <p className="text-sm text-slate-400">Your currently connected external drives, cloud storage, and databases.</p>
            </div>
            <Link href="/dashboard/datasets">
              <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Plus size={16} /> Add Source
              </button>
            </Link>
          </div>

          {dataSources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dataSources.map((source) => (
                <div key={source.id} className="border border-emerald-500/30 bg-slate-950 p-5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <Database size={20}/>
                      </div>
                      <h3 className="font-bold text-slate-200 capitalize">{source.provider}</h3>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Connected</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">{source.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-950 rounded-lg border border-slate-800 border-dashed">
              <HardDrive className="mx-auto w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-300 font-medium">No Data Connections</p>
              <p className="text-sm text-slate-500 mt-1">Connect your external databases or cloud storage.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
