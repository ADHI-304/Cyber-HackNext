import React, { useState } from 'react';
import { HelpCircle, ChevronRight, ChevronLeft, X, CheckCircle, ShieldCheck } from 'lucide-react';

export function GuidedWalkthrough({ stepName, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const walkthroughSteps = [
    {
      title: 'Welcome to Guided Authentication',
      content: 'We noticed you might be having some trouble. Don’t worry! We are here to guide you step-by-step without compromising your account security.',
      tip: 'Your password and verification code are always protected with bank-grade encryption.'
    },
    {
      title: stepName === 'VerifyOtp' ? 'Finding Your 6-Digit Code' : 'Password Verification Guidance',
      content: stepName === 'VerifyOtp'
        ? 'Open your SMS text messages or authenticator app (like Google Authenticator). Look for a 6-digit code sent from SecureBank.'
        : 'Double-check that Caps Lock is off on your keyboard. Click the eye icon to reveal the text you typed. If you forgot your password, choose "Forgot Password" to recover access.',
      tip: stepName === 'VerifyOtp' ? 'You can paste the entire 6-digit code at once into any box.' : 'Use the eye icon toggle to reveal what you typed if you are unsure.'
    },
    {
      title: 'Need Alternate Assistance?',
      content: 'If your device is lost or codes aren’t arriving, click "Forgot Password" to choose phone, email, TOTP, or 2-of-3 trusted contact recovery.',
      tip: 'Two of your pre-assigned friends can verify your identity so you get back in safely.'
    }
  ];

  const current = walkthroughSteps[currentSlide];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 high-contrast:bg-slate-900 high-contrast:border-amber-400 high-contrast:text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sky-600 font-bold text-sm uppercase tracking-wide">
            <HelpCircle className="w-5 h-5 text-sky-600" />
            <span>Guided Step {currentSlide + 1} of {walkthroughSteps.length}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-slate-700 rounded-lg flex items-center justify-center"
            aria-label="Close guided walkthrough"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 id="walkthrough-title" className="text-xl font-bold text-slate-900 mb-2 high-contrast:text-amber-400">
          {current.title}
        </h3>

        <p className="text-sm font-medium text-slate-700 leading-relaxed mb-4 high-contrast:text-slate-200">
          {current.content}
        </p>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 mb-6 flex items-start gap-2 text-xs font-semibold text-sky-900 high-contrast:bg-slate-800 high-contrast:border-slate-700 high-contrast:text-sky-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-sky-600 mt-0.5" />
          <span>{current.tip}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <button
            type="button"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(prev => prev - 1)}
            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 disabled:opacity-40 flex items-center gap-1 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentSlide < walkthroughSteps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentSlide(prev => prev + 1)}
              className="min-h-[44px] px-4 py-2 text-xs font-bold rounded-lg bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-1 shadow"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 shadow"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Got it, thanks!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
