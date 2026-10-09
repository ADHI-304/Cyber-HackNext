import React, { useState, useEffect } from 'react';
import { getFrictionStats } from '../api/mockApi';
import { AdminKpiCards } from '../components/AdminKpiCards';
import { FrictionCharts } from '../components/FrictionCharts';
import { FrictionMatrixTable } from '../components/FrictionMatrixTable';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, RefreshCw, Users } from 'lucide-react';

const COLORS = ['#0284c7', '#f59e0b', '#ef4444', '#10b981'];

export function AdminFriction() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    const res = await getFrictionStats();
    setIsLoading(false);
    if (res.ok) {
      setStats(res.data);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <main id="main-content" className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sky-700 font-bold">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading Admin Friction Telemetry...</span>
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main id="main-content" className="min-h-[80vh] flex flex-col items-center justify-center p-6">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-6 text-center max-w-md shadow-md">
          <h2 className="font-bold text-lg mb-2">Access Denied / Telemetry Error</h2>
          <p className="text-xs text-rose-700 mb-4 leading-relaxed">
            Unable to fetch admin telemetry metrics. Please ensure you are logged in with administrator privileges.
          </p>
          <button
            type="button"
            onClick={fetchStats}
            className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition"
          >
            Retry Loading
          </button>
        </div>
      </main>
    );
  }

  const pieData = [
    { name: 'Successful', value: stats.recoveryStats.successful },
    { name: 'Timed Out', value: stats.recoveryStats.timedOut },
    { name: 'Denied', value: stats.recoveryStats.denied }
  ];

  return (
    <main id="main-content" className="min-h-[85vh] py-8 px-4 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl high-contrast:border-2 high-contrast:border-amber-400">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Security Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Friction & UX Analytics</h1>
          <p className="text-slate-300 text-sm mt-1">Real-time telemetry tracking user struggle scores, drop-offs, and security risk per step.</p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-sky-400" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      <AdminKpiCards stats={stats} />

      <FrictionCharts failuresPerStep={stats.failuresPerStep} lockoutsOverTime={stats.lockoutsOverTime} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FrictionMatrixTable frictionVsRisk={stats.frictionVsRisk} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 high-contrast:bg-slate-900 high-contrast:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900 high-contrast:text-white">Recovery Breakdown</h2>
              <p className="text-xs text-slate-500">2-of-3 Contact approval outcomes</p>
            </div>
            <Users className="w-5 h-5 text-purple-600" />
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs font-semibold text-slate-700 pt-2 border-t border-slate-100 high-contrast:text-slate-300">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-sky-600"></span> Approved</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Timed Out</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Denied</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 high-contrast:bg-slate-900 high-contrast:border-slate-700">
        <h2 className="font-bold text-base text-slate-900 high-contrast:text-amber-400">Recent Telemetry Events</h2>
        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs max-h-48 overflow-y-auto space-y-2">
          {stats.recentTelemetryEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-2 border-b border-slate-800 pb-1.5">
              <span className="text-amber-400 shrink-0">[{new Date(event.timestamp).toLocaleTimeString()}]</span>
              <span className="text-sky-400 font-bold shrink-0">[{event.type}]</span>
              <span className="text-slate-300">{event.step}:</span>
              <span className="text-slate-400">{JSON.stringify(event.metadata)}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
