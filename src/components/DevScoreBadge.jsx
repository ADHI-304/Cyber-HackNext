import React from 'react';
import { Bug, PlusCircle, RotateCcw } from 'lucide-react';

export function DevScoreBadge({ score, onAddPoints, onResetScore }) {
  return (
    <div 
      className="fixed bottom-4 left-4 z-40 bg-slate-900 text-white border border-slate-700 rounded-xl p-2 shadow-xl flex items-center gap-2 text-xs"
      role="region"
      aria-label="Developer Demo Struggle Score Control"
    >
      <div className="flex items-center gap-1 text-amber-400 font-bold px-1">
        <Bug className="w-3.5 h-3.5" />
        <span>Score: {score}</span>
      </div>

      <button
        type="button"
        onClick={() => onAddPoints(1, 'dev_test')}
        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded font-semibold text-[11px] text-slate-200 border border-slate-600 flex items-center gap-1"
        title="Add +1 to Struggle Score for testing"
      >
        <PlusCircle className="w-3 h-3 text-sky-400" />
        <span>+1</span>
      </button>

      <button
        type="button"
        onClick={() => onAddPoints(2, 'dev_test')}
        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded font-semibold text-[11px] text-slate-200 border border-slate-600 flex items-center gap-1"
        title="Add +2 to Struggle Score for testing"
      >
        <PlusCircle className="w-3 h-3 text-amber-400" />
        <span>+2</span>
      </button>

      <button
        type="button"
        onClick={onResetScore}
        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
        title="Reset Struggle Score to 0"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
