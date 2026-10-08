import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startRecovery } from '../api/mockApi';
import { useA11yPrefs } from '../context/A11yContext';
import { ContactCard } from '../components/ContactCard';
import { HelpPanel } from '../components/HelpPanel';
import { RecoveryMethodSelector } from '../components/RecoveryMethodSelector';
import { SimpleRecoveryViews } from '../components/SimpleRecoveryViews';
import { AuthBuddyGuidance } from '../components/AuthBuddyGuidance';
import { useStruggleScore } from '../hooks/useStruggleScore';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export function RecoveryStart() {
  const navigate = useNavigate();
  const { t } = useA11yPrefs();
  const { score, addStrugglePoints, resetScore, activeHelpMode, setActiveHelpMode } = useStruggleScore('RecoveryStart');

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [username, setUsername] = useState(() => localStorage.getItem('authbuddy_last_username') || 'user@securebank.com');
  const [contacts] = useState([
    { name: 'Arun', email: 'arun@example.com', status: 'pending' },
    { name: 'Priya', email: 'priya@example.com', status: 'pending' },
    { name: 'Rahul', email: 'rahul@example.com', status: 'pending' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartRecoverySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await startRecovery(username, contacts);
    setIsLoading(false);
    if (res.ok) {
      navigate(`/recovery-status?id=${res.data.recoveryId}`);
    }
  };

  return (
    <main id="main-content" className="min-h-[85vh] py-8 px-4 max-w-xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 high-contrast:bg-slate-900 high-contrast:border-amber-400">
        
        {selectedMethod === null ? (
          <>
            <AuthBuddyGuidance guidanceKey="RECOVERY_METHOD_SELECTION" />
            <RecoveryMethodSelector username={username} setUsername={setUsername} onSelectMethod={setSelectedMethod} />
          </>
        ) : selectedMethod !== 'contacts' ? (
          <SimpleRecoveryViews selectedMethod={selectedMethod} username={username} onBack={() => setSelectedMethod(null)} />
        ) : (
          <div className="space-y-5">
            <AuthBuddyGuidance guidanceKey="NO_ACCESS_TO_METHOD" />
            
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shadow-inner high-contrast:bg-amber-400 high-contrast:text-slate-950">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 high-contrast:text-white">
                {t('recoveryTitle')}
              </h1>
              <p className="text-xs font-medium text-slate-600 max-w-sm mx-auto leading-relaxed high-contrast:text-slate-300">
                {t('recoverySubtitle')}
              </p>
            </div>

            <form onSubmit={handleStartRecoverySubmit} className="space-y-4">
              <div>
                <label htmlFor="rec-username" className="block text-xs font-bold text-slate-800 mb-1 high-contrast:text-slate-100">
                  {t('usernameLabel')}
                </label>
                <input
                  id="rec-username"
                  type="email"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 high-contrast:bg-slate-900 high-contrast:text-white"
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-bold text-slate-900 high-contrast:text-amber-400 flex items-center justify-between">
                  <span>{t('verifyTrustedTitle')}</span>
                  <span className="text-[11px] font-semibold text-purple-700">{t('mandatory')}</span>
                </h2>

                {contacts.map((c, index) => (
                  <ContactCard key={index} index={index} name={c.name} email={c.email} isEditable={false} />
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setSelectedMethod(null)} className="py-3 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border">
                  Back
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3 px-4 bg-purple-700 text-white font-bold text-sm rounded-xl hover:bg-purple-800 shadow flex items-center justify-center gap-1 transition-colors">
                  {isLoading ? <span>Starting...</span> : <><span>{t('startRecovery')}</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <HelpPanel score={score} onResetScore={resetScore} stepName="RecoveryStart" activeHelpMode={activeHelpMode} setActiveHelpMode={setActiveHelpMode} onAddPoints={addStrugglePoints} />
    </main>
  );
}
