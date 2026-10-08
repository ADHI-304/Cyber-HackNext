import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/mockApi';
import { AuthForm } from '../components/AuthForm';
import { ErrorBanner } from '../components/ErrorBanner';
import { HelpPanel } from '../components/HelpPanel';
import { PasswordMeter } from '../components/PasswordMeter';
import { A11yProfileSelector } from '../components/A11yProfileSelector';
import { TotpSetup } from '../components/TotpSetup';
import { useStruggleScore } from '../hooks/useStruggleScore';
import { useA11yPrefs } from '../context/A11yContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export function Register() {
  const navigate = useNavigate();
  const { prefs } = useA11yPrefs();
  const { score, addStrugglePoints, resetScore, activeHelpMode, setActiveHelpMode } = useStruggleScore('Register');

  const [step, setStep] = useState('FORM'); // 'FORM' | 'TOTP'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpData, setTotpData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState(null);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorCode(null);

    if (!username || !password) {
      addStrugglePoints(1, 'empty_fields');
      setErrorCode('WEAK_PASSWORD');
      return;
    }

    setIsLoading(true);
    const res = await register(username, password, prefs);
    setIsLoading(false);

    if (!res.ok) {
      addStrugglePoints(2, 'failed_registration');
      setErrorCode(res.errorCode);
    } else {
      setTotpData(res.data);
      setStep('TOTP');
    }
  };

  return (
    <main id="main-content" className="min-h-[85vh] py-8 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <ErrorBanner 
          errorCode={errorCode} 
          onClose={() => setErrorCode(null)} 
          onPrimaryAction={() => setErrorCode(null)}
          primaryActionLabel="Review Details"
        />

        {step === 'FORM' ? (
          <AuthForm
            title="Create SecureBank Account"
            subtitle="Accessible, plain-language authentication designed for everyone."
            onSubmit={handleRegisterSubmit}
            submitText="Continue to 2FA Setup"
            isLoading={isLoading}
            icon={UserPlus}
          >
            <div>
              <label htmlFor="reg-username" className="block text-sm font-bold text-slate-800 mb-1.5 high-contrast:text-slate-100">
                Email Address or Username
              </label>
              <input
                id="reg-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="you@example.com"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-bold text-slate-800 mb-1.5 high-contrast:text-slate-100">
                Create a Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full min-h-[44px] px-4 py-2.5 pr-12 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] p-2 text-slate-500 flex items-center justify-center rounded-lg"
                  aria-label={showPassword ? "Hide password text" : "Show password text"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <PasswordMeter password={password} />
            </div>

            <A11yProfileSelector />

            <p className="text-xs text-center text-slate-600 mt-3 high-contrast:text-slate-300">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-sky-700 underline hover:text-sky-900 high-contrast:text-amber-400">
                Sign In here
              </Link>
            </p>
          </AuthForm>
        ) : (
          <TotpSetup totpData={totpData} onDone={() => navigate('/login')} />
        )}
      </div>

      <HelpPanel
        score={score}
        onResetScore={resetScore}
        stepName="Register"
        activeHelpMode={activeHelpMode}
        setActiveHelpMode={setActiveHelpMode}
        onAddPoints={addStrugglePoints}
      />
    </main>
  );
}
