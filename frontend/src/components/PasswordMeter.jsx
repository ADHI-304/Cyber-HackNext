import React from 'react';
import { Check } from 'lucide-react';
import { useA11yPrefs } from '../context/A11yContext';

export function PasswordMeter({ password = '' }) {
  const { t } = useA11yPrefs();
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const strengthScore = [hasMinLength, hasNumber, hasSymbol].filter(Boolean).length;

  return (
    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 high-contrast:bg-slate-800 high-contrast:border-slate-700">
      <div className="flex items-center justify-between font-bold text-slate-700 high-contrast:text-slate-200">
        <span>{t('passwordLabel')}:</span>
        <span className={
          strengthScore === 3 ? "text-emerald-600 font-bold" : strengthScore === 2 ? "text-amber-600" : "text-rose-600"
        }>
          {strengthScore === 3 ? t('pwdStrong') : strengthScore === 2 ? t('pwdMedium') : t('pwdWeak')}
        </span>
      </div>

      <ul className="space-y-1 text-slate-600 high-contrast:text-slate-300">
        <li className="flex items-center gap-1.5">
          <Check className={`w-3.5 h-3.5 ${hasMinLength ? "text-emerald-600" : "text-slate-300"}`} />
          <span>{t('pwdHint8Chars')}</span>
        </li>
        <li className="flex items-center gap-1.5">
          <Check className={`w-3.5 h-3.5 ${hasNumber ? "text-emerald-600" : "text-slate-300"}`} />
          <span>{t('pwdHintNumberSymbol')}</span>
        </li>
        <li className="flex items-center gap-1.5">
          <Check className={`w-3.5 h-3.5 ${hasSymbol ? "text-emerald-600" : "text-slate-300"}`} />
          <span>{t('pwdHintMixedCase')}</span>
        </li>
      </ul>
    </div>
  );
}
