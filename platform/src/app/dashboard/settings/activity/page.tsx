'use client';

import { useState, useEffect } from 'react';
import { Activity, Globe, MapPin, Monitor } from 'lucide-react';
import Link from 'next/link';

export default function UserActivityPage() {
  const [data, setData] = useState({ activityLogs: [], loginHistory: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/activity')
      .then(res => res.json())
      .then(res => {
        if(res.success) setData(res);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/settings" className="text-primary hover:underline text-sm">← Back to Settings</Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">My Activity & Privacy</h1>
        <p className="text-slate-400 mb-8">We believe in full transparency. Here is a log of all your actions and logins on our platform. Only YOU can see this.</p>

        {loading ? (
          <div className="text-slate-400">Loading your secure logs...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Login History */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Monitor className="text-primary" /> Recent Logins
              </h2>
              {data.loginHistory.length === 0 ? (
                <p className="text-slate-500 text-sm">No recent logins found.</p>
              ) : (
                <div className="space-y-4">
                  {data.loginHistory.map((login: any) => (
                    <div key={login.id} className="border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-white">{new Date(login.loginTime).toLocaleString()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${login.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {login.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Globe size={12} /> {login.ipAddress || 'Unknown IP'}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {login.location || 'Unknown Location'}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 truncate">{login.deviceInfo}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="text-primary" /> Activity Log
              </h2>
              {data.activityLogs.length === 0 ? (
                <p className="text-slate-500 text-sm">No recent activity found.</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {data.activityLogs.map((log: any) => (
                    <div key={log.id} className="border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-white">{log.action}</span>
                        <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-slate-400">Module: {log.module}</div>
                      {log.details && (
                        <div className="text-xs text-slate-500 mt-1 bg-slate-950 p-2 rounded border border-slate-800 font-mono">
                          {log.details}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
