import React, { useState } from 'react';
import { acceptTrustedContactStart, acceptTrustedContactConfirm } from '../api/mockApi';
import { useA11yPrefs } from '../context/A11yContext';
import { AuthBuddyGuidance } from '../components/AuthBuddyGuidance';
import { ShieldCheck, CheckCircle2, ArrowRight, KeyRound, Mail } from 'lucide-react';

export function ContactApproval() {
  const { t } = useA11yPrefs();
  const [step, setStep] = useState('CODE_ENTRY');
  const [contactEmail, setContactEmail] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [otp, setOtp] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleValidateCode = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!contactEmail || !invitationCode) {
      setErrorMsg('Please enter both your email address and the invitation code.');
      return;
    }
    setIsLoading(true);
    const res = await acceptTrustedContactStart(contactEmail, invitationCode);
    setIsLoading(false);
    if (!res.ok && !res.success) {
      setErrorMsg(res.message || 'Invalid or expired invitation code.');
    } else {
      setTargetUsername(res.data?.username || 'User');
      setStep('OTP_ENTRY');
    }
  };

  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otp) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    const res = await acceptTrustedContactConfirm(contactEmail, invitationCode, otp);
    setIsLoading(false);
    if (!res.ok && !res.success) {
      setErrorMsg(res.message || 'The verification code is incorrect or expired.');
    } else {
      setStep('ACTIVE_SUCCESS');
    }
  };

  return (
    <main id="main-content" className="min-h-[85vh] py-8 px-4 max-w-lg mx-auto flex flex-col items-center justify-center">
      <div className="w-full">
        <AuthBuddyGuidance guidanceKey="CONTACT_APPROVAL" />
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 high-contrast:bg-slate-900 high-contrast:border-amber-400">
          <div className="mx-auto w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shadow-inner high-contrast:bg-amber-400 high-contrast:text-slate-950">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 high-contrast:text-white">
            {t('acceptContactTitle')}
          </h1>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              {errorMsg}
            </div>
          )}

          {step === 'CODE_ENTRY' ? (
            <form onSubmit={handleValidateCode} className="space-y-4 text-left">
              <p className="text-xs text-slate-600 font-medium text-center">
                {t('acceptContactSubtitle')}
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">{t('contactEmailLabel')}</label>
                <div className="relative">
                  <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="you@example.com" className="w-full min-h-[44px] px-3 pl-9 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-purple-500" />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">{t('invitationCodeLabel')}</label>
                <div className="relative">
                  <input type="text" required value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} placeholder={t('invitationCodePlaceholder')} className="w-full min-h-[44px] px-3 pl-9 rounded-xl border border-slate-300 text-xs font-bold tracking-wider uppercase focus:ring-2 focus:ring-purple-500" />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full min-h-[48px] py-3 bg-purple-700 text-white font-bold text-sm rounded-xl hover:bg-purple-800 shadow flex items-center justify-center gap-2">
                {isLoading ? <span>Validating Code...</span> : <><span>{t('validateCodeButton')}</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          ) : step === 'OTP_ENTRY' ? (
            <form onSubmit={handleConfirmOtp} className="space-y-4 text-left">
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-xs text-purple-900 font-medium">
                {t('enterEmailOtpSubtitle')} (<strong>{contactEmail}</strong>)
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">{t('enter6DigitCode')}</label>
                <input type="text" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-center text-lg font-mono font-bold tracking-widest focus:ring-2 focus:ring-purple-500" />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep('CODE_ENTRY')} className="px-4 text-xs font-bold text-slate-600 border rounded-xl">Back</button>
                <button type="submit" disabled={isLoading} className="flex-1 min-h-[48px] py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 shadow flex items-center justify-center gap-2">
                  {isLoading ? <span>Activating...</span> : <><span>{t('confirmActivationButton')}</span><CheckCircle2 className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-6 rounded-2xl space-y-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h2 className="font-extrabold text-lg">{t('activeVerified')}</h2>
              <p className="text-xs font-medium leading-relaxed">
                Thank you! You are now an active pre-registered trusted contact for <strong>{targetUsername}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
