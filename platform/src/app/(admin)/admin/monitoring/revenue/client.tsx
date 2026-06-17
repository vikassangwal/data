'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Calendar, CreditCard, BarChart as BarChartIcon } from 'lucide-react';

export default function RevenueClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/monitoring/revenue')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res);
        else setError(res.error || 'Failed to load');
      })
      .catch(() => setError('Error loading revenue data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400">Loading revenue metrics...</div>;
  if (error) return <div className="text-center py-20 text-red-400">{error}</div>;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: data.stats.todayRevenue, icon: <DollarSign size={20} />, color: 'text-emerald-400' },
          { label: "Monthly Revenue", value: data.stats.monthlyRevenue, icon: <Calendar size={20} />, color: 'text-blue-400' },
          { label: "Yearly Revenue", value: data.stats.yearlyRevenue, icon: <TrendingUp size={20} />, color: 'text-purple-400' },
          { label: "Total All Time", value: data.stats.totalRevenue, icon: <CreditCard size={20} />, color: 'text-white' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <div className={`p-3 bg-slate-800 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">${stat.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Revenue by Gateway</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.gatewayChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.gatewayChart.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {data.gatewayChart.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder for future bar chart (e.g. monthly breakdown) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500">
           <BarChartIcon size={48} className="mb-4 opacity-50"/>
           <p>Monthly Growth Chart</p>
           <p className="text-xs mt-2">Requires historical aggregation pipeline</p>
        </div>
      </div>
    </div>
  );
}
