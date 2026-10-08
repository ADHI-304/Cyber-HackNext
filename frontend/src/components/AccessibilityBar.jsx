import React from 'react';
import { useA11yPrefs } from '../context/A11yContext';
import { Type, Eye, Volume2, Globe, RotateCcw } from 'lucide-react';

export function AccessibilityBar() {
  const {
    prefs,
    languages,
    setLanguage,
    setTextSize,
    toggleHighContrast,
    toggleVoiceGuidance,
    resetA11yPrefs,
    t
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
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-amber-400 focus:text-slate-950 focus:font-bold focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          {t('skipToContent')}
        </a>

        <div className="flex items-center space-x-2 font-medium">
          <span className="text-amber-400 font-semibold flex items-center gap-1.5 text-xs uppercase tracking-wider">
            <Type className="w-4 h-4" aria-hidden="true" />
            {t('a11yBarTitle')}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1 border border-slate-700">
            <Globe className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <label htmlFor="language-select" className="sr-only">{t('language')}</label>
            <select
              id="language-select"
              value={prefs.language || 'en'}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-slate-100 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 rounded cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white font-medium">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Text Size Control */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700" role="group" aria-label="Adjust Text Size">
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
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>{t('highContrast')} {prefs.highContrast ? '(On)' : ''}</span>
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
          >
            <Volume2 className="w-4 h-4" aria-hidden="true" />
            <span>{t('voiceGuidance')} {prefs.voiceGuidance ? '(On)' : ''}</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={resetA11yPrefs}
            className="min-h-[44px] min-w-[44px] px-2 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1"
            title="Reset to default settings"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
