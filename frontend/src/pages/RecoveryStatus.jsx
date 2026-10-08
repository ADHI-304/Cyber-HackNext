import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getRecoveryStatus, approveRecovery } from '../api/mockApi';
import { ContactCard } from '../components/ContactCard';
import { RecoveryProgressCards } from '../components/RecoveryProgressCards';
import { AuthBuddyGuidance } from '../components/AuthBuddyGuidance';
import { HelpPanel } from '../components/HelpPanel';
import { useStruggleScore } from '../hooks/useStruggleScore';
import { UserCheck, CheckCircle, Smartphone, ExternalLink, BellRing } from 'lucide-react';

export function RecoveryStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const recoveryId = searchParams.get('id') || 'rec_demo';

  const { score, addStrugglePoints, resetScore, activeHelpMode, setActiveHelpMode } = useStruggleScore('RecoveryStatus');

  const [session, setSession] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerFinished, setIsTimerFinished] = useState(false);

  const fetchStatus = async () => {
    const res = await getRecoveryStatus(recoveryId);
    if (res.ok) {
      setSession(res.data);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [recoveryId]);

  useEffect(() => {
    if (timerSeconds <= 0) {
      setIsTimerFinished(true);
      return;
    }
    const interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const handleSimulateApproval = async (contactIndex) => {
    await approveRecovery(recoveryId, contactIndex, 'approved');
    await fetchStatus();
  };

  const approvedCount = session?.contacts?.filter(c => c.status === 'approved').length || 0;
  const isApprovedRequired = approvedCount >= 2;

  const handleDeviceSetup = () => {
    navigate('/reset-password');
  };

  return (
    <main id="main-content" className="min-h-[85vh] py-8 px-4 max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 high-contrast:bg-slate-900 high-contrast:border-amber-400">
        
        {/* AuthBuddy Universal Contextual Guidance Component */}
        <AuthBuddyGuidance guidanceKey="RECOVERY_PENDING" />

        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shadow-inner high-contrast:bg-amber-400 high-contrast:text-slate-950">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 high-contrast:text-white">
            Secure Recovery Progress
          </h1>
          <p className="text-sm font-medium text-slate-600 max-w-lg mx-auto leading-relaxed high-contrast:text-slate-300">
            Account recovery for <strong className="text-slate-900 high-contrast:text-amber-400">{session?.username || 'user@securebank.com'}</strong>
          </p>
        </div>

        <RecoveryProgressCards approvedCount={approvedCount} isApprovedRequired={isApprovedRequired} timerSeconds={timerSeconds} isTimerFinished={isTimerFinished} />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 high-contrast:text-amber-400">Approval Status per Contact</h2>
            <span className="text-xs text-slate-500">Click below to simulate approval</span>
          </div>

          {session?.contacts?.map((c, index) => (
            <div key={index} className="space-y-2">
              <ContactCard index={index} name={c.name} email={c.email} status={c.status} isEditable={false} />
              {c.status !== 'approved' && (
                <div className="flex items-center gap-2 pl-2 text-xs">
                  <button type="button" onClick={() => handleSimulateApproval(index)} className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 font-bold rounded-lg transition-colors flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-700" />
                    <span>Simulate {c.name}'s Approval</span>
                  </button>
                  <Link to={`/contact-approval?id=${recoveryId}&contact=${index}`} target="_blank" className="px-2.5 py-1 text-slate-600 hover:text-slate-900 underline flex items-center gap-1">
                    <span>Open Contact Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            type="button"
            disabled={!isApprovedRequired}
            onClick={handleDeviceSetup}
            className={`w-full min-h-[52px] py-3.5 px-4 text-base font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
              isApprovedRequired
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span>{isApprovedRequired ? 'Approvals Met: Set Up New Device Now' : `Waiting for ${2 - approvedCount} more approval(s)...`}</span>
          </button>
        </div>
      </div>

      <HelpPanel score={score} onResetScore={resetScore} stepName="RecoveryStatus" activeHelpMode={activeHelpMode} setActiveHelpMode={setActiveHelpMode} onAddPoints={addStrugglePoints} />
    </main>
  );
}
