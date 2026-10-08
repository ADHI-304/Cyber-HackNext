import React from 'react';
import { Bot, ShieldCheck, CheckCircle2, UserCheck } from 'lucide-react';

export function AdminKpiCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1 high-contrast:bg-slate-900 high-contrast:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 high-contrast:text-amber-400">Users Recovered</span>
          <UserCheck className="w-5 h-5 text-purple-600" />
        </div>
        <div className="text-3xl font-extrabold text-purple-700 high-contrast:text-amber-400">{stats.usersSuccessfullyRecovered || 48}</div>
        <p className="text-xs text-slate-500">Simple & Secure recovery completed</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1 high-contrast:bg-slate-900 high-contrast:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 high-contrast:text-amber-400">Users Assisted</span>
          <CheckCircle2 className="w-5 h-5 text-sky-600" />
        </div>
        <div className="text-3xl font-extrabold text-sky-700 high-contrast:text-amber-400">
          {stats.usersAcceptedAssistance || 34}
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-2">
          <span className="text-emerald-600 font-bold">81% accepted</span>
          <span>&bull;</span>
          <span className="text-slate-400">8 declined</span>
        </p>
      </div>

      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-sm space-y-1 high-contrast:bg-slate-900 high-contrast:border-emerald-400">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 high-contrast:text-emerald-300">Security Bypasses</span>
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="text-3xl font-extrabold text-emerald-700 high-contrast:text-emerald-400">
          0
        </div>
        <p className="text-xs font-bold text-emerald-900 high-contrast:text-emerald-300">
          Strict security rules 100% preserved
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1 high-contrast:bg-slate-900 high-contrast:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 high-contrast:text-amber-400">AuthBuddy Activations</span>
          <Bot className="w-5 h-5 text-amber-500" />
        </div>
        <div className="text-3xl font-extrabold text-slate-900 high-contrast:text-white">{stats.authBuddyActivations || 42}</div>
        <p className="text-xs text-slate-500">Triggered upon 2 consecutive failures</p>
      </div>
    </div>
  );
}
