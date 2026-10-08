import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { AuthBuddyGuidance } from '../components/AuthBuddyGuidance';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export function ResetPassword() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetSubmit = (newPassword) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 500);
  };

  return (
    <main id="main-content" className="min-h-[85vh] py-8 px-4 flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-full">
        {/* Universal AuthBuddy Guidance */}
        <AuthBuddyGuidance guidanceKey={isSuccess ? 'RECOVERY_COMPLETE' : 'CREATE_NEW_PASSWORD'} />

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 w-full high-contrast:bg-slate-900 high-contrast:border-amber-400">
          <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shadow-inner high-contrast:bg-amber-400 high-contrast:text-slate-950">
            <ShieldCheck className="w-6 h-6" />
          </div>

          {isSuccess ? (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold text-slate-900 high-contrast:text-white">
                Identity Verified & Password Updated!
              </h1>
              
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-2xl text-xs font-semibold leading-relaxed">
                Your account recovery is complete. You can now sign in with your new password.
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full min-h-[48px] py-3 px-4 bg-emerald-600 text-white font-bold text-base rounded-xl hover:bg-emerald-700 shadow flex items-center justify-center gap-2 transition-colors high-contrast:bg-amber-400 high-contrast:text-slate-950"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 high-contrast:text-white">
                  Create New Password
                </h1>
                <p className="text-xs font-medium text-slate-600 high-contrast:text-slate-300">
                  Your identity was verified. Choose a strong new password to protect your account.
                </p>
              </div>

              <ResetPasswordForm onSubmit={handleResetSubmit} isLoading={isLoading} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
