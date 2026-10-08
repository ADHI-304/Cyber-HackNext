import React, { useEffect, useRef } from 'react';
import { getGuidance } from '../data/guidanceMessages';
import { useSpeech } from '../hooks/useSpeech';
import { useA11yPrefs } from '../context/A11yContext';
import { Bot, Volume2, VolumeX, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';

export function AuthBuddyGuidance({ guidanceKey = 'LOGIN_INITIAL', customMessage }) {
  const { prefs, voiceCode, t } = useA11yPrefs();
  const { speak, stop, isSpeaking } = useSpeech();
  const lastSpokenKeyRef = useRef(null);

  const guidance = getGuidance(guidanceKey, prefs.language || 'en');
  const title = customMessage?.title || guidance.title;
  const whatToDo = customMessage?.whatToDo || guidance.whatToDo;
  const whyRequired = customMessage?.whyRequired || guidance.whyRequired;
  const alternativeAction = customMessage?.alternativeAction || guidance.alternativeAction;
  const speechText = customMessage?.speechText || guidance.speechText;

  useEffect(() => {
    if (prefs.voiceGuidance && guidanceKey && lastSpokenKeyRef.current !== guidanceKey) {
      lastSpokenKeyRef.current = guidanceKey;
      speak(speechText, voiceCode);
    }
  }, [prefs.voiceGuidance, guidanceKey, speechText, speak, voiceCode]);

  const handleReadAloudToggle = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(speechText, voiceCode);
    }
  };

  return (
    <div 
      className="bg-sky-50/90 border-2 border-sky-400 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-900 mb-5 high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400"
      role="region"
      aria-label="AuthBuddy Contextual Assistance"
    >
      <div className="flex items-center justify-between gap-3 mb-3 border-b border-sky-200 pb-2.5 high-contrast:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-600 text-white rounded-lg font-bold shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-sky-900 high-contrast:text-amber-400">
              AuthBuddy Guidance
            </h3>
            <span className="text-sm font-extrabold text-slate-900 high-contrast:text-white block leading-tight">
              {title}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReadAloudToggle}
          className="min-h-[44px] px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-1.5 transition-colors shrink-0 shadow-sm high-contrast:bg-amber-400 high-contrast:text-slate-950"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-200" aria-hidden="true" />
              <span>{t('stopVoice')}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" aria-hidden="true" />
              <span>{t('listenVoice')}</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <ArrowRight className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-slate-800 font-semibold leading-relaxed high-contrast:text-slate-100">
            {whatToDo}
          </p>
        </div>

        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-slate-700 font-medium leading-relaxed high-contrast:text-slate-200">
            {whyRequired}
          </p>
        </div>

        {alternativeAction && (
          <div className="flex items-start gap-2 bg-white/70 border border-sky-200 rounded-xl p-2.5 mt-1 high-contrast:bg-slate-800 high-contrast:border-slate-700">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-slate-800 font-medium leading-relaxed high-contrast:text-slate-200">
              {alternativeAction}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
