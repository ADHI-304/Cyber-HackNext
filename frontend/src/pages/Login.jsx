import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';
import { useA11yPrefs } from '../context/A11yContext';
import { AuthForm } from '../components/AuthForm';
import { StepIndicator } from '../components/StepIndicator';
import { ErrorBanner } from '../components/ErrorBanner';
import { AuthBuddyPrompt } from '../components/AuthBuddyPrompt';
import { GuidedAuthLayout } from '../components/GuidedAuthLayout';
import { LoginFormFields } from '../components/LoginFormFields';
import { AuthBuddyGuidance } from '../components/AuthBuddyGuidance';
import { HelpPanel } from '../components/HelpPanel';
import { useStruggleScore } from '../hooks/useStruggleScore';
import { LogIn, HelpCircle, ArrowRight } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { startOtpStep } = useAuth();
  const { t } = useA11yPrefs();
  const { 
    score, isPromptEligible, isGuidedMode, acceptHelp, declineHelp, 
    recordFailedLogin, recordSuccessLogin, activeHelpMode, setActiveHelpMode, 
    addStrugglePoints, resetScore 
  } = useStruggleScore('Login');

  const [username, setUsername] = useState('user@securebank.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorCode(null);

    if (!username || !password) {
      addStrugglePoints(1, 'empty_fields');
      setErrorCode('INVALID_CREDENTIALS');
      return;
    }

    setIsLoading(true);
    const res = await login(username, password);
    setIsLoading(false);

    if (!res.ok) {
      recordFailedLogin();
      setErrorCode(res.errorCode);
    } else {
      recordSuccessLogin();
      startOtpStep(username);
      navigate('/verify-otp');
    }
  };

  return (
    <main id="main-content" className="min-h-[85vh] py-8 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <StepIndicator currentStep={1} totalSteps={2} stepTitle={t('passwordLabel')} />

        {isGuidedMode && (
          <AuthBuddyGuidance guidanceKey={errorCode ? 'LOGIN_FAILED' : 'LOGIN_INITIAL'} />
        )}

        <ErrorBanner 
          errorCode={errorCode} 
          onClose={() => setErrorCode(null)} 
          onPrimaryAction={errorCode === 'ACCOUNT_LOCKED' ? () => navigate('/recovery-start') : () => setPassword('')}
          primaryActionLabel={errorCode === 'ACCOUNT_LOCKED' ? t('startRecovery') : "Clear Password"}
        />

        {isPromptEligible && <AuthBuddyPrompt onAccept={acceptHelp} onDecline={declineHelp} />}

        {isGuidedMode ? (
          <GuidedAuthLayout
            stepNumber={1}
            totalSteps={2}
            stepTitle={t('loginTitle')}
            guidanceText={t('loginSubtitle')}
          >
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <LoginFormFields username={username} setUsername={setUsername} password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} />
              <button type="submit" disabled={isLoading} className="w-full min-h-[48px] py-3 px-4 bg-sky-600 text-white font-bold text-base rounded-xl hover:bg-sky-700 shadow flex items-center justify-center gap-2 high-contrast:bg-amber-400 high-contrast:text-slate-950">
                <span>{t('continueTo2FA')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="pt-2 border-t border-slate-200 text-center">
                <Link to="/recovery-start" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-2 rounded-xl transition-colors w-full justify-center">
                  <HelpCircle className="w-4 h-4 text-purple-700" />
                  <span>{t('forgotPassword')}</span>
                </Link>
              </div>
            </form>
          </GuidedAuthLayout>
        ) : (
          <AuthForm title={t('loginTitle')} subtitle={t('loginSubtitle')} onSubmit={handleLoginSubmit} submitText={t('signInButton')} isLoading={isLoading} icon={LogIn}>
            <LoginFormFields username={username} setUsername={setUsername} password={password} setPassword={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} />
            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 high-contrast:bg-slate-800 high-contrast:border-slate-700 high-contrast:text-slate-300">
              <strong>Demo Credentials:</strong> <code className="bg-slate-200 px-1 rounded font-mono font-bold high-contrast:bg-slate-700">user@securebank.com</code> | <code className="bg-slate-200 px-1 rounded font-mono font-bold high-contrast:bg-slate-700">Password123!</code>
            </div>
          </AuthForm>
        )}
      </div>

      {isGuidedMode && <HelpPanel score={score} onResetScore={resetScore} stepName="Login" activeHelpMode={activeHelpMode} setActiveHelpMode={setActiveHelpMode} onAddPoints={addStrugglePoints} />}
    </main>
  );
}
