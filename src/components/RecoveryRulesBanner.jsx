import React from 'react';
import { Users, Clock, Bell } from 'lucide-react';

export function RecoveryRulesBanner() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 high-contrast:bg-slate-800 high-contrast:border-slate-700">
      <div className="flex items-start gap-2.5">
        <Users className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-bold text-slate-900 high-contrast:text-white">2-of-3 Approval</h3>
          <p className="text-[11px] text-slate-600 high-contrast:text-slate-300">At least 2 trusted friends must approve your request.</p>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-bold text-slate-900 high-contrast:text-white">60s Security Delay</h3>
          <p className="text-[11px] text-slate-600 high-contrast:text-slate-300">A brief safety wait period prevents automated attacks.</p>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <Bell className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-bold text-slate-900 high-contrast:text-white">Instant Account Alert</h3>
          <p className="text-[11px] text-slate-600 high-contrast:text-slate-300">An alert email & SMS is sent to your registered device.</p>
        </div>
      </div>
    </div>
  );
}
