import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';
import { useA11yPrefs } from '../context/A11yContext';
import { StepIndicator } from '../components/StepIndicator';
import { ErrorBanner } from '../components/ErrorBanner';
import { HelpPanel } from '../components/HelpPanel';
import { GuidedAuthLayout } from '../components/GuidedAuthLayout';
import { OtpFormControls } from '../components/OtpFormControls';
import { AuthBuddyGuidance } from '../components/AuthBuddyGuidance';
import { useStruggleScore } from '../hooks/useStruggleScore';
import { KeyRound, CheckCircle } from 'lucide-react';

export function VerifyOtp() {
  const navigate = useNavigate();
  const { pendingOtpUser, completeLogin } = useAuth();
  const { t } = useA11yPrefs();
  const username = pendingOtpUser || 'user@securebank.com';

  const { score, isGuidedMode, addStrugglePoints, resetScore, activeHelpMode, setActiveHelpMode } = useStruggleScore('VerifyOtp');

  const [code, setCode] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (timerSeconds <= 0) {
      setIsExpired(true);
      setErrorCode('OTP_EXPIRED');
      addStrugglePoints(1, 'otp_expired');
      return;
    }

    const interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timerSeconds, addStrugglePoints]);

  const handleVerify = async (otpToVerify) => {
    const targetCode = (typeof otpToVerify === 'string' && otpToVerify.length > 0) ? otpToVerify : code;
    if (!targetCode || targetCode.length < 6) {
      addStrugglePoints(1, 'incomplete_otp');
      setErrorCode('OTP_INCOMPLETE');
      return;
    }

    setErrorCode(null);
    setIsLoading(true);
    const res = await verifyOtp(username, targetCode);
    setIsLoading(false);

    if (res && (res.ok || res.success)) {
      const userObj = res.data?.user || { username, name: username.split('@')[0], role: username.toLowerCase().startsWith('admin') ? 'admin' : 'user' };
      const tokenVal = res.data?.token || res.token;
      const fullUserData = { ...userObj, token: tokenVal };
      completeLogin(fullUserData);
      if (userObj.role === 'admin') {
        navigate('/admin-friction');
      } else {
        navigate('/dashboard');
      }
    } else {
      addStrugglePoints(2, 'failed_otp_attempt');
      setErrorCode(res?.errorCode || 'OTP_INVALID');
    }
  };

  const handleResendCode = async () => {
    setErrorCode(null);
    setIsLoading(true);
    const res = await resendOtp(username);
    setIsLoading(false);

    if (res && (res.ok || res.success)) {
      setCode('');
      setTimerSeconds(300);
      setIsExpired(false);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } else {
      setErrorCode(res?.errorCode || 'RATE_LIMITED');
    }
  };

  const guidanceKey = isExpired ? 'OTP_EXPIRED' : errorCode === 'OTP_INVALID' ? 'OTP_INVALID' : 'OTP_ENTER';

  return (
    <main id="main-content" className="min-h-[85vh] py-8 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <StepIndicator currentStep={2} totalSteps={2} stepTitle={t('otpStepTitle')} />

        <AuthBuddyGuidance guidanceKey={guidanceKey} />

        <ErrorBanner 
          errorCode={errorCode} 
          onClose={() => setErrorCode(null)} 
          onPrimaryAction={isExpired ? handleResendCode : () => setCode('')}
          primaryActionLabel={isExpired ? t('resendButton') : "Clear Code"}
        />

        {resendSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3 text-xs font-bold flex items-center gap-2" role="status">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>A fresh 6-digit code was sent to your device!</span>
          </div>
        )}

        {isGuidedMode ? (
          <GuidedAuthLayout
            stepNumber={2}
            totalSteps={2}
            stepTitle={t('otpTitle')}
            guidanceText={t('otpSubtitle')}
          >
            <OtpFormControls
              code={code} setCode={setCode}
              isLoading={isLoading} isExpired={isExpired}
              activeHelpMode={activeHelpMode} handleVerify={handleVerify}
              timerSeconds={timerSeconds} handleResendCode={handleResendCode}
              addStrugglePoints={addStrugglePoints}
            />
          </GuidedAuthLayout>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5 high-contrast:bg-slate-900 high-contrast:border-amber-400">
            <div className="mx-auto w-12 h-12 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center shadow-inner high-contrast:bg-amber-400 high-contrast:text-slate-950">
              <KeyRound className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 high-contrast:text-white">{t('otpTitle')}</h1>

            <p className="text-sm text-slate-600 font-medium leading-relaxed high-contrast:text-slate-300">
              {t('otpSubtitle')} <strong className="text-slate-900 high-contrast:text-amber-400">{username}</strong>.
            </p>

            <OtpFormControls
              code={code} setCode={setCode}
              isLoading={isLoading} isExpired={isExpired}
              activeHelpMode={activeHelpMode} handleVerify={handleVerify}
              timerSeconds={timerSeconds} handleResendCode={handleResendCode}
              addStrugglePoints={addStrugglePoints}
            />
          </div>
        )}
      </div>

      {isGuidedMode && <HelpPanel score={score} onResetScore={resetScore} stepName="VerifyOtp" activeHelpMode={activeHelpMode} setActiveHelpMode={setActiveHelpMode} onAddPoints={addStrugglePoints} />}
    </main>
  );
}
