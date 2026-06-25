import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Billing & Subscriptions | DevFort',
  description: 'Manage your platform plan and billing history.',
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      paymentLogs: {
        orderBy: { paymentDate: 'desc' },
        take: 10,
      }
    }
  });

  const activePlan = user?.planId?.toUpperCase() || 'TRIAL';

  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6 md:p-10 text-slate-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscriptions</h1>
          <p className="text-slate-400">Manage your active plan, payment methods, and view your billing history.</p>
        </div>

        {/* Current Plan Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-slate-400 font-semibold mb-1 uppercase tracking-wider">Current Plan</p>
              <h2 className="text-4xl font-bold text-white mb-2">{activePlan}</h2>
              <p className="text-sm text-slate-400">Your plan automatically renews unless cancelled.</p>
            </div>
            <div className="flex flex-col gap-3 min-w-[200px]">
              <Link href="/pricing" className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl text-center hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all">
                Upgrade Plan
              </Link>
              {activePlan !== 'TRIAL' && (
                <button className="px-6 py-3 bg-slate-800 text-rose-400 hover:text-rose-300 hover:bg-slate-800/80 font-bold rounded-xl text-center transition-all">
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Payment History</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {user?.paymentLogs && user.paymentLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Description</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {user.paymentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 text-slate-300">
                          {new Date(log.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="p-4">
                          <p className="text-white font-medium">Platform Subscription - {log.planName.toUpperCase()}</p>
                          <p className="text-xs text-slate-500">Transaction ID: {log.transactionId.substring(0, 15)}...</p>
                        </td>
                        <td className="p-4 font-medium text-white">
                          {log.currency} {(log.amount || 0).toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                            log.paymentStatus === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            log.paymentStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {log.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <button className="text-primary hover:text-primary/80 font-semibold text-sm">Download</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💸</span>
                </div>
                <p>No payment history found.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
