import React from 'react';

export function RecoveryProgressCards({ approvedCount, requiredCount = 2, isApprovedRequired, timerSeconds, isTimerFinished }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Approvals Counter Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1 high-contrast:bg-slate-800 high-contrast:border-slate-700">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 high-contrast:text-slate-300">
          Contact Approvals
        </span>
        <div className="text-3xl font-extrabold text-purple-700 high-contrast:text-amber-400">
          {approvedCount} / {requiredCount}
        </div>
        <p className="text-xs text-slate-600 font-medium">
          {isApprovedRequired ? 'Requirement Satisfied!' : 'Waiting for trusted friends'}
        </p>
      </div>

      {/* 60s Countdown Timer Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1 high-contrast:bg-slate-800 high-contrast:border-slate-700">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 high-contrast:text-slate-300">
          Security Delay Timer
        </span>
        <div className="text-3xl font-extrabold font-mono text-slate-900 high-contrast:text-white">
          {isTimerFinished ? '00:00' : `${timerSeconds}s`}
        </div>
        <p className="text-xs text-slate-600 font-medium">
          {isTimerFinished ? 'Safety delay elapsed' : 'Mandatory protection delay'}
        </p>
      </div>
    </div>
  );
}
