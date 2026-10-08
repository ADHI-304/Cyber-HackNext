import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRecoveryStatus, approveRecovery } from '../api/mockApi';
import { AuthBuddyGuidance } from '../components/AuthBuddyGuidance';
import { UserCheck, CheckCircle2, XCircle, PhoneCall } from 'lucide-react';

export function ContactApproval() {
  const [searchParams] = useSearchParams();
  const recoveryId = searchParams.get('id') || 'rec_demo';
  const contactIndex = parseInt(searchParams.get('contact') || '0', 10);

  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getRecoveryStatus(recoveryId).then(res => {
      if (res.ok) {
        setSession(res.data);
      }
    });
  }, [recoveryId]);

  const handleAction = async (decision) => {
    setIsLoading(true);
    const res = await approveRecovery(recoveryId, contactIndex, decision);
    setIsLoading(false);
    if (res.ok) {
      setStatus(decision);
    }
  };

  const contactName = session?.contacts?.[contactIndex]?.name || 'Trusted Friend';
  const username = session?.username || 'user@securebank.com';

  return (
    <main id="main-content" className="min-h-[85vh] py-8 px-4 max-w-lg mx-auto flex flex-col items-center justify-center">
      <div className="w-full">
        {/* AuthBuddy Contextual Guidance */}
        <AuthBuddyGuidance guidanceKey="CONTACT_APPROVAL" />

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 high-contrast:bg-slate-900 high-contrast:border-amber-400">
          <div className="mx-auto w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center shadow-inner high-contrast:bg-amber-400 high-contrast:text-slate-950">
            <UserCheck className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 high-contrast:text-white">
            Trusted Contact Verification
          </h1>

          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-left space-y-2 high-contrast:bg-slate-800 high-contrast:border-slate-700">
            <p className="text-sm font-medium text-slate-800 high-contrast:text-slate-200 leading-relaxed">
              Hello <strong>{contactName}</strong>, your friend <strong className="text-sky-700 high-contrast:text-amber-400">{username}</strong> requested your help to recover access to their SecureBank account.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-left flex items-start gap-3 high-contrast:bg-slate-800 high-contrast:border-amber-400">
            <PhoneCall className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 high-contrast:text-amber-200 space-y-1">
              <strong className="block font-bold">Important Security Step:</strong>
              <p>Only click "Approve" if you have personally verified with {username} via a phone call or in-person conversation.</p>
            </div>
          </div>

          {status === 'approved' ? (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-5 rounded-2xl space-y-2 text-center" role="status">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h2 className="font-bold text-base">Approval Submitted!</h2>
              <p className="text-xs">Thank you for helping keep your friend's account safe. You may now close this tab.</p>
            </div>
          ) : status === 'denied' ? (
            <div className="bg-rose-50 border border-rose-300 text-rose-900 p-5 rounded-2xl space-y-2 text-center" role="status">
              <XCircle className="w-10 h-10 text-rose-600 mx-auto" />
              <h2 className="font-bold text-base">Request Denied</h2>
              <p className="text-xs">You have flagged this request as denied. SecureBank security has been alerted.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="button" disabled={isLoading} onClick={() => handleAction('approved')} className="flex-1 min-h-[48px] py-3 px-4 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 shadow flex items-center justify-center gap-2 transition-colors">
                <CheckCircle2 className="w-5 h-5" />
                <span>Yes, Approve Access</span>
              </button>
              <button type="button" disabled={isLoading} onClick={() => handleAction('denied')} className="min-h-[48px] py-3 px-4 bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-800 font-bold text-sm rounded-xl border border-slate-300 flex items-center justify-center gap-2 transition-colors">
                <XCircle className="w-5 h-5" />
                <span>Deny Request</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
