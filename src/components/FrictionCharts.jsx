import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

export function FrictionCharts({ failuresPerStep, lockoutsOverTime }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Failures Per Step */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 high-contrast:bg-slate-900 high-contrast:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900 high-contrast:text-white">Failures per Auth Step</h2>
            <p className="text-xs text-slate-500">Identifies where users experience the most friction</p>
          </div>
          <BarChart3 className="w-5 h-5 text-sky-600" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={failuresPerStep} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="step" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="failures" fill="#0284c7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lockouts Over Time */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 high-contrast:bg-slate-900 high-contrast:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900 high-contrast:text-white">Account Lockouts Over Time</h2>
            <p className="text-xs text-slate-500">Hourly trend of account lockouts triggered</p>
          </div>
          <TrendingUp className="w-5 h-5 text-rose-600" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lockoutsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="lockouts" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
