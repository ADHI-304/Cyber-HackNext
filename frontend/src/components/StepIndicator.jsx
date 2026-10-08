import React from 'react';
import { useA11yPrefs } from '../context/A11yContext';

export function StepIndicator({ currentStep, totalSteps = 2, stepTitle }) {
  const { t } = useA11yPrefs();
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div 
      className="mb-6 bg-slate-100 border border-slate-200 rounded-xl p-4" 
      role="region" 
      aria-label={t('stepIndicator', { current: currentStep, total: totalSteps })}
    >
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-bold text-sky-800 tracking-wide">
          {t('stepIndicator', { current: currentStep, total: totalSteps })}
        </span>
        {stepTitle && (
          <span className="text-slate-600 font-medium">{stepTitle}</span>
        )}
      </div>

      <div 
        className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden" 
        role="progressbar" 
        aria-valuenow={currentStep} 
        aria-valuemin={1} 
        aria-valuemax={totalSteps}
      >
        <div 
          className="bg-sky-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
