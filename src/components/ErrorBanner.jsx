import React, { useEffect } from 'react';
import { getErrorMessage } from '../data/errorMessages';
import { useSpeech } from '../hooks/useSpeech';
import { useA11yPrefs } from '../context/A11yContext';
import { 
  ShieldAlert, 
  Clock, 
  KeyRound, 
  Lock, 
  Hourglass, 
  ShieldQuestion, 
  WifiOff, 
  Users, 
  AlertCircle,
  Volume2,
  VolumeX,
  ArrowRight,
  X
} from 'lucide-react';

const iconMap = {
  ShieldAlert,
  Clock,
  KeyRound,
  Lock,
  Hourglass,
  ShieldQuestion,
  WifiOff,
  Users,
  AlertCircle
};

export function ErrorBanner({ errorCode, onPrimaryAction, primaryActionLabel, onClose }) {
  const { prefs } = useA11yPrefs();
  const { speak, stop, isSpeaking } = useSpeech();
  const errorInfo = getErrorMessage(errorCode);

  const IconComponent = iconMap[errorInfo.icon] || AlertCircle;

  const fullTextToRead = `${errorInfo.title}. ${errorInfo.plainExplanation} ${errorInfo.nextAction}`;

  // Auto read aloud if voice guidance preference is enabled
  useEffect(() => {
    if (prefs.voiceGuidance && errorCode) {
      speak(fullTextToRead);
    }
  }, [prefs.voiceGuidance, errorCode, speak, fullTextToRead]);

  if (!errorCode) return null;

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      aria-atomic="true"
      className="mb-6 rounded-xl border-2 border-amber-500 bg-amber-50 p-4 shadow-sm text-slate-900 high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Status Icon (Ensures error is never distinguished by color alone) */}
          <div className="bg-amber-500 text-slate-950 p-2 rounded-lg shrink-0 mt-0.5" aria-hidden="true">
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 high-contrast:text-amber-400 flex items-center gap-2">
              <span>{errorInfo.title}</span>
              <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono font-semibold uppercase">
                [{errorInfo.code}]
              </span>
            </h3>

            <p className="text-sm font-medium text-slate-800 leading-relaxed high-contrast:text-slate-200">
              {errorInfo.plainExplanation}
            </p>

            <p className="text-sm font-semibold text-amber-900 high-contrast:text-amber-300 flex items-center gap-1.5 mt-1">
              <span>Suggested action:</span>
              <span>{errorInfo.nextAction}</span>
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-slate-500 hover:text-slate-800 hover:bg-amber-100 rounded-lg flex items-center justify-center p-2 shrink-0 transition-colors"
            aria-label="Dismiss error banner"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-amber-200 flex flex-wrap items-center justify-between gap-2">
        {/* Read Aloud Button */}
        <button
          type="button"
          onClick={() => isSpeaking ? stop() : speak(fullTextToRead)}
          className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-200 text-amber-950 hover:bg-amber-300 flex items-center gap-1.5 transition-colors focus-visible:ring-4 focus-visible:ring-amber-600"
          aria-label={isSpeaking ? "Stop reading error aloud" : "Read error explanation aloud"}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-700" aria-hidden="true" />
              <span>Stop Reading</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-amber-900" aria-hidden="true" />
              <span>Read Aloud</span>
            </>
          )}
        </button>

        {/* Primary Action Button */}
        {onPrimaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="min-h-[44px] px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 shadow-sm transition-colors high-contrast:bg-amber-400 high-contrast:text-slate-950"
          >
            <span>{primaryActionLabel || 'Try Again'}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
