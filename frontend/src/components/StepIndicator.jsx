import React from 'react';

export function StepIndicator({ currentStep, totalSteps = 2, stepTitle }) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div 
      className="mb-6 bg-slate-100 border border-slate-200 rounded-xl p-4" 
      role="region" 
      aria-label={`Authentication Step ${currentStep} of ${totalSteps}`}
    >
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-bold text-sky-800 tracking-wide">
          Step {currentStep} of {totalSteps}
        </span>
        {stepTitle && (
          <span className="text-slate-600 font-medium">{stepTitle}</span>
        )}
      </div>

      {/* Visual Progress Bar */}
      <div 
        className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden" 
        role="progressbar" 
        aria-valuenow={currentStep} 
        aria-valuemin={1} 
        aria-valuemax={totalSteps}
        aria-label={`Progress: ${percentage}%`}
      >
        <div 
          className="bg-sky-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
