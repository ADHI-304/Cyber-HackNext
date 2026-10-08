import React from 'react';
import { Delete, RotateCcw, CheckCircle } from 'lucide-react';

export function Keypad({ onKeyPress, onDelete, onClear, onSubmit, disabled }) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div 
      className="bg-slate-100 border border-slate-300 rounded-2xl p-4 shadow-sm max-w-sm mx-auto my-4"
      role="group"
      aria-label="Large Button Keypad for OTP"
    >
      <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 text-center">
        Large-Button Keypad Assistance
      </div>

      <div className="grid grid-cols-3 gap-2">
        {digits.slice(0, 9).map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled}
            onClick={() => onKeyPress(num)}
            className="min-h-[56px] text-xl font-bold rounded-xl bg-white border-2 border-slate-300 text-slate-900 shadow-sm hover:bg-sky-50 hover:border-sky-500 active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-amber-500"
            aria-label={`Digit ${num}`}
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          className="min-h-[56px] text-xs font-bold rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 border border-slate-300 flex items-center justify-center gap-1 transition-colors"
          aria-label="Clear all digits"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onKeyPress('0')}
          className="min-h-[56px] text-xl font-bold rounded-xl bg-white border-2 border-slate-300 text-slate-900 shadow-sm hover:bg-sky-50 hover:border-sky-500 active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-amber-500"
          aria-label="Digit 0"
        >
          0
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onDelete}
          className="min-h-[56px] text-xs font-bold rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 border border-slate-300 flex items-center justify-center gap-1 transition-colors"
          aria-label="Delete last digit"
        >
          <Delete className="w-4 h-4 text-rose-600" />
          <span>Erase</span>
        </button>
      </div>

      {onSubmit && (
        <button
          type="button"
          disabled={disabled}
          onClick={onSubmit}
          className="w-full mt-3 min-h-[48px] font-bold text-sm bg-sky-600 text-white rounded-xl hover:bg-sky-700 shadow flex items-center justify-center gap-2 transition-colors"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Submit Code</span>
        </button>
      )}
    </div>
  );
}
