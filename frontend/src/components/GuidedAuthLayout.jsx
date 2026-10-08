import React from 'react';
import { Bot, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

export function GuidedAuthLayout({ stepNumber, totalSteps = 2, stepTitle, guidanceText, children }) {
  const { speak, stop, isSpeaking } = useSpeech();

  const handleReadAloud = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(`Step ${stepNumber} of ${totalSteps}: ${stepTitle}. ${guidanceText}`);
    }
  };

  return (
    <div className="bg-white border-2 border-sky-500 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 high-contrast:bg-slate-900 high-contrast:border-amber-400">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-sky-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-600 text-white rounded-xl shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block high-contrast:text-amber-400">
              Guided Authentication Mode
            </span>
            <span className="text-xs text-slate-500 font-medium">Step {stepNumber} of {totalSteps}: {stepTitle}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReadAloud}
          className="min-h-[44px] px-3 py-1.5 text-xs font-bold bg-sky-50 text-sky-900 hover:bg-sky-100 rounded-xl flex items-center gap-1.5 transition-colors border border-sky-200"
          aria-label={isSpeaking ? "Stop reading guidance aloud" : "Read step guidance aloud"}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-sky-700" />}
          <span>{isSpeaking ? "Stop Voice" : "Read Aloud"}</span>
        </button>
      </div>

      {/* Guidance Message */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 text-sm font-medium text-sky-950 leading-relaxed high-contrast:bg-slate-800 high-contrast:border-slate-700 high-contrast:text-slate-200">
        <p>{guidanceText}</p>
      </div>

      {/* Form Content */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Security Disclaimer */}
      <div className="pt-3 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>AuthBuddy simplifies guidance while strictly preserving bank-grade encryption & 2FA rules.</span>
      </div>
    </div>
  );
}
