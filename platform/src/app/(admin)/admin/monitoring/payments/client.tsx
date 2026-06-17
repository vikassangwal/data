'use client';

import { useState, useEffect } from 'react';
import { Search, CreditCard, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

export default function PaymentsClient() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/admin/monitoring/payments?status=${statusFilter}` : '/api/admin/monitoring/payments';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setPayments(data.payments);
      else setError(data.error);
    } catch (err) {
      setError('Error loading payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Success</span>;
      case 'FAILED': return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={12}/> Failed</span>;
      case 'PENDING': return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>;
      case 'REFUNDED': return <span className="bg-slate-500/20 text-slate-400 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><RefreshCw size={12}/> Refunded</span>;
      default: return <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded-md text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="text-primary" /> Payment Logs</h2>
          <p className="text-sm text-slate-400">View and track all platform transactions.</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading payments...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">{error}</div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Plan / Item</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Gateway</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{payment.transactionId}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{payment.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{payment.user?.email || payment.userId}</div>
                    </td>
                    <td className="px-6 py-4">{payment.planName}</td>
                    <td className="px-6 py-4 font-bold text-white">
                      {payment.amount.toLocaleString('en-US', { style: 'currency', currency: payment.currency })}
                    </td>
                    <td className="px-6 py-4">{payment.gatewayUsed}</td>
                    <td className="px-6 py-4">{getStatusBadge(payment.paymentStatus)}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(payment.paymentDate).toLocaleString()}</td>
                  </tr>
                ))}
                
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
