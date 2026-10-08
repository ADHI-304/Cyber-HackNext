import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';

export function OtpTimer({ timerSeconds, isExpired, onResendCode, isLoading }) {
  return (
    <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-slate-700 high-contrast:text-slate-200">
        <Clock className={`w-4 h-4 ${timerSeconds < 10 ? 'text-rose-600 animate-bounce' : 'text-sky-600'}`} />
        <span>
          {isExpired ? (
            <span className="text-rose-600 font-bold">Code Expired</span>
          ) : (
            <span>Code expires in: <strong className="text-slate-900 font-mono text-sm high-contrast:text-amber-400">{timerSeconds}s</strong></span>
          )}
        </span>
      </div>

      <button
        type="button"
        onClick={onResendCode}
        disabled={isLoading}
        className="min-h-[44px] px-3 py-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 hover:bg-sky-50 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 high-contrast:text-amber-400"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Get new code</span>
      </button>
    </div>
  );
}
