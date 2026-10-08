import React from 'react';

export function AuthForm({ title, subtitle, onSubmit, children, submitText, isLoading, icon: Icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl max-w-md w-full mx-auto high-contrast:bg-slate-900 high-contrast:border-amber-400">
      <div className="text-center mb-6">
        {Icon && (
          <div className="mx-auto w-12 h-12 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mb-3 shadow-inner high-contrast:bg-amber-400 high-contrast:text-slate-950">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-slate-900 high-contrast:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm font-medium text-slate-600 mt-1.5 leading-relaxed high-contrast:text-slate-300">
            {subtitle}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {children}

        {submitText && (
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] py-3 px-4 bg-sky-600 text-white font-bold text-base rounded-xl hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-amber-500 shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 high-contrast:bg-amber-400 high-contrast:text-slate-950"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Processing...</span>
              </span>
            ) : (
              <span>{submitText}</span>
            )}
          </button>
        )}
      </form>
    </div>
  );
}
