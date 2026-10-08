import React from 'react';
import { useA11yPrefs } from '../context/A11yContext';
import { Type, Eye, Volume2, Activity, RotateCcw } from 'lucide-react';

export function AccessibilityBar() {
  const {
    prefs,
    setTextSize,
    toggleHighContrast,
    toggleVoiceGuidance,
    toggleReducedMotion,
    resetA11yPrefs
  } = useA11yPrefs();

  const textSizes = [
    { key: 'sm', label: 'A-', title: 'Small Text' },
    { key: 'base', label: 'A', title: 'Default Text' },
    { key: 'lg', label: 'A+', title: 'Large Text' },
    { key: 'xl', label: 'A++', title: 'Extra Large Text' }
  ];

  return (
    <div 
      className="bg-slate-900 text-slate-100 border-b border-slate-700 px-4 py-2 text-sm"
      role="region"
      aria-label="Accessibility Settings Bar"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Skip to Content Link for keyboard accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-amber-400 focus:text-slate-950 focus:font-bold focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>

        <div className="flex items-center space-x-2 font-medium">
          <span className="text-amber-400 font-semibold flex items-center gap-1.5 text-xs uppercase tracking-wider">
            <Type className="w-4 h-4" aria-hidden="true" />
            Accessibility Bar
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Text Size Control */}
          <div 
            className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700" 
            role="group" 
            aria-label="Adjust Text Size"
          >
            {textSizes.map((size) => (
              <button
                key={size.key}
                type="button"
                onClick={() => setTextSize(size.key)}
                className={`px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs font-semibold rounded-md transition-colors ${
                  prefs.textSize === size.key
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                aria-pressed={prefs.textSize === size.key}
                aria-label={`Set text size to ${size.title}`}
                title={size.title}
              >
                {size.label}
              </button>
            ))}
          </div>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
              prefs.highContrast
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            aria-pressed={prefs.highContrast}
            aria-label="Toggle High Contrast Mode"
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>High Contrast {prefs.highContrast ? '(On)' : ''}</span>
          </button>

          {/* Voice Guidance Toggle */}
          <button
            type="button"
            onClick={toggleVoiceGuidance}
            className={`min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
              prefs.voiceGuidance
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            aria-pressed={prefs.voiceGuidance}
            aria-label="Toggle Voice Guidance Read Aloud"
          >
            <Volume2 className="w-4 h-4" aria-hidden="true" />
            <span>Voice Guidance {prefs.voiceGuidance ? '(On)' : ''}</span>
          </button>

          {/* Reduced Motion Toggle */}
          <button
            type="button"
            onClick={toggleReducedMotion}
            className={`min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
              prefs.reducedMotion
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            aria-pressed={prefs.reducedMotion}
            aria-label="Toggle Reduced Motion"
          >
            <Activity className="w-4 h-4" aria-hidden="true" />
            <span>Reduced Motion {prefs.reducedMotion ? '(On)' : ''}</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={resetA11yPrefs}
            className="min-h-[44px] min-w-[44px] px-2 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1"
            aria-label="Reset accessibility preferences to default"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
