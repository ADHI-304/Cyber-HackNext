import React from 'react';
import { useA11yPrefs } from '../context/A11yContext';
import { Type, Eye as EyeIcon, Volume2, Activity } from 'lucide-react';

export function A11yProfileSelector() {
  const { prefs, setTextSize, toggleHighContrast, toggleVoiceGuidance, toggleReducedMotion } = useA11yPrefs();

  return (
    <fieldset className="border border-slate-200 rounded-xl p-4 bg-sky-50/50 space-y-2 high-contrast:bg-slate-800 high-contrast:border-slate-700">
      <legend className="text-xs font-bold uppercase tracking-wider text-sky-900 px-2 bg-white rounded border border-sky-200 high-contrast:bg-slate-900 high-contrast:text-amber-400">
        Optional Accessibility Profile Setup
      </legend>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-sky-100/50">
          <input 
            type="checkbox" 
            checked={prefs.textSize === 'xl'} 
            onChange={() => setTextSize(prefs.textSize === 'xl' ? 'base' : 'xl')}
            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
          />
          <span className="font-semibold text-slate-800 flex items-center gap-1 high-contrast:text-slate-200">
            <Type className="w-3.5 h-3.5 text-sky-600" /> Large Text
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-sky-100/50">
          <input 
            type="checkbox" 
            checked={prefs.highContrast} 
            onChange={toggleHighContrast}
            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
          />
          <span className="font-semibold text-slate-800 flex items-center gap-1 high-contrast:text-slate-200">
            <EyeIcon className="w-3.5 h-3.5 text-sky-600" /> High Contrast
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-sky-100/50">
          <input 
            type="checkbox" 
            checked={prefs.voiceGuidance} 
            onChange={toggleVoiceGuidance}
            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
          />
          <span className="font-semibold text-slate-800 flex items-center gap-1 high-contrast:text-slate-200">
            <Volume2 className="w-3.5 h-3.5 text-sky-600" /> Voice Guidance
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-sky-100/50">
          <input 
            type="checkbox" 
            checked={prefs.reducedMotion} 
            onChange={toggleReducedMotion}
            className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
          />
          <span className="font-semibold text-slate-800 flex items-center gap-1 high-contrast:text-slate-200">
            <Activity className="w-3.5 h-3.5 text-sky-600" /> Reduced Motion
          </span>
        </label>
      </div>
    </fieldset>
  );
}
