import React from 'react';
import { Bot, Sparkles, CheckCircle2, X } from 'lucide-react';

export function AuthBuddyPrompt({ onAccept, onDecline }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="authbuddy-prompt-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-amber-400 space-y-5 high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold high-contrast:bg-amber-400 high-contrast:text-slate-950">
            <Bot className="w-4 h-4 text-amber-700 high-contrast:text-slate-950" />
            <span>AuthBuddy AI Guidance</span>
          </div>

          <button
            type="button"
            onClick={onDecline}
            className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-slate-700 rounded-lg flex items-center justify-center"
            aria-label="Close assistance prompt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Wording */}
        <div className="space-y-2">
          <h2 id="authbuddy-prompt-title" className="text-xl font-bold text-slate-900 high-contrast:text-amber-400 flex items-center gap-2">
            <span>It looks like you're having trouble signing in.</span>
          </h2>
          <p className="text-sm font-medium text-slate-600 leading-relaxed high-contrast:text-slate-200">
            Are you trying to sign in? I can guide you through the authentication process step by step with clear explanations and accessibility tools.
          </p>
        </div>

        {/* Security Rule Assurance */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-600 space-y-1 high-contrast:bg-slate-800 high-contrast:border-slate-700 high-contrast:text-slate-300">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 high-contrast:text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Security Principle</span>
          </div>
          <p>
            AuthBuddy assists your experience, but <strong>never bypasses password or OTP security requirements</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 min-h-[48px] py-3 px-4 bg-sky-600 text-white font-bold text-sm rounded-xl hover:bg-sky-700 shadow flex items-center justify-center gap-2 transition-colors high-contrast:bg-amber-400 high-contrast:text-slate-950"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Yes, help me</span>
          </button>

          <button
            type="button"
            onClick={onDecline}
            className="min-h-[48px] py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm rounded-xl border border-slate-300 flex items-center justify-center transition-colors high-contrast:bg-slate-800 high-contrast:text-white high-contrast:border-slate-700"
          >
            <span>No, I'll try again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
