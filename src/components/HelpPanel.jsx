import React, { useState } from 'react';
import { useA11yPrefs } from '../context/A11yContext';
import { GuidedWalkthrough } from './GuidedWalkthrough';
import { DevScoreBadge } from './DevScoreBadge';
import { Sparkles, Type, Grid, Volume2, Compass, X, ShieldCheck } from 'lucide-react';

export function HelpPanel({ score, onResetScore, stepName, activeHelpMode, setActiveHelpMode, onAddPoints }) {
  const { prefs, setTextSize, toggleVoiceGuidance } = useA11yPrefs();
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen && score < 5) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-amber-400 border border-amber-400 px-3 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-transform active:scale-95"
          aria-label={`Open Adaptive Help Panel. Current Struggle Score: ${score}`}
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Struggle Score: {score}/5</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed bottom-4 right-4 z-40 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border-2 border-amber-400 animate-in slide-in-from-bottom-5 duration-300"
          role="region"
          aria-label="Adaptive Assistance Panel"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="bg-amber-500 text-slate-950 p-1.5 rounded-lg font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-amber-400">Need a Hand?</h3>
                <p className="text-[11px] text-slate-300">We noticed extra friction. Choose an option below:</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-white rounded-lg flex items-center justify-center"
              aria-label="Minimize Help Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setTextSize(prefs.textSize === 'xl' ? 'base' : 'xl')}
              className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                prefs.textSize === 'xl'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Type className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold">Bigger Text</span>
              <span className="text-[10px] opacity-80">{prefs.textSize === 'xl' ? 'Active (20px)' : 'Increase font size'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveHelpMode(activeHelpMode === 'keypad' ? null : 'keypad')}
              className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                activeHelpMode === 'keypad'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Grid className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold">Large Keypad</span>
              <span className="text-[10px] opacity-80">{activeHelpMode === 'keypad' ? 'Active' : 'Show big buttons'}</span>
            </button>

            <button
              type="button"
              onClick={toggleVoiceGuidance}
              className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                prefs.voiceGuidance
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Volume2 className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold">Voice Guidance</span>
              <span className="text-[10px] opacity-80">{prefs.voiceGuidance ? 'On' : 'Speak errors & hints'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveHelpMode('guided')}
              className="p-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-left flex flex-col items-start gap-1 transition-all"
            >
              <Compass className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold">Guided Tour</span>
              <span className="text-[10px] opacity-80">Walkthrough modal</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-800/80 p-2 rounded-lg border border-slate-700/50">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Assistance changes UI only. Security rules remain strictly enforced.</span>
          </div>
        </div>
      )}

      {activeHelpMode === 'guided' && (
        <GuidedWalkthrough stepName={stepName} onClose={() => setActiveHelpMode(null)} />
      )}

      <DevScoreBadge score={score} onAddPoints={onAddPoints} onResetScore={onResetScore} />
    </>
  );
}
