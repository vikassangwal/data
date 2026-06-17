'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Download, ExternalLink, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function UserPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/payments')
      .then(res => res.json())
      .then(res => {
        if(res.success) setPayments(res.payments);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/settings" className="text-primary hover:underline text-sm">← Back to Settings</Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Payments</h1>
            <p className="text-slate-400">View your transaction history, download invoices, and manage billing.</p>
          </div>
          <button className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm">
            <CreditCard size={18} /> Update Payment Method
          </button>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading payment history...</div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                <p>No payment history found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-xs font-bold">
                    <tr>
                      <th className="px-6 py-4">Invoice / ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Plan</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {payments.map((payment: any) => (
                      <tr key={payment.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">
                          <div className="text-white font-medium">{payment.invoiceId || 'N/A'}</div>
                          <div className="text-slate-500">{payment.transactionId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-500" />
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-medium text-xs border border-slate-700 uppercase">
                            {payment.planName}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          {payment.currency === 'USD' ? '$' : payment.currency}{payment.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          {payment.status === 'SUCCESS' ? (
                            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                              <CheckCircle size={14} /> Paid
                            </span>
                          ) : payment.status === 'FAILED' ? (
                            <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                              <XCircle size={14} /> Failed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold">
                              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-primary hover:text-white transition-colors inline-flex items-center gap-1 text-xs font-medium">
                            <Download size={14} /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
