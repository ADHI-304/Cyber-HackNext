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
  const { prefs, voiceCode, t } = useA11yPrefs();
  const { speak, stop, isSpeaking } = useSpeech();

  const codeKey = typeof errorCode === 'object' && errorCode !== null ? errorCode.code : errorCode;
  const defaultInfo = getErrorMessage(codeKey, prefs.language || 'en');

  const title = (typeof errorCode === 'object' && errorCode?.title) || defaultInfo.title;
  const plainExplanation = (typeof errorCode === 'object' && errorCode?.plainExplanation) || defaultInfo.plainExplanation;
  const nextAction = (typeof errorCode === 'object' && errorCode?.nextAction) || defaultInfo.nextAction;

  const IconComponent = iconMap[defaultInfo.icon] || AlertCircle;
  const fullTextToRead = `${title}. ${plainExplanation} ${nextAction}`;

  useEffect(() => {
    if (prefs.voiceGuidance && errorCode) {
      speak(fullTextToRead, voiceCode);
    }
  }, [prefs.voiceGuidance, errorCode, speak, fullTextToRead, voiceCode]);

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
          <div className="p-2 bg-amber-500 text-slate-950 rounded-lg shrink-0 mt-0.5">
            <IconComponent className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-amber-950 high-contrast:text-amber-300">
              {title}
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-800 leading-relaxed high-contrast:text-slate-100">
              {plainExplanation}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-700 leading-relaxed high-contrast:text-slate-200">
              {nextAction}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-800 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-amber-200 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => isSpeaking ? stop() : speak(fullTextToRead, voiceCode)}
          className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span>{isSpeaking ? t('stopVoice') : t('listenVoice')}</span>
        </button>

        {onPrimaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-600"
          >
            {primaryActionLabel || "OK"}
          </button>
        )}
      </div>
    </div>
  );
}
