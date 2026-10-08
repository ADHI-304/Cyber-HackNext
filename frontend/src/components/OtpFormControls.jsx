import React from 'react';
import { Link } from 'react-router-dom';
import { OtpInput } from './OtpInput';
import { Keypad } from './Keypad';
import { OtpTimer } from './OtpTimer';
import { PhoneOff } from 'lucide-react';

export function OtpFormControls({
  code, setCode,
  isLoading, isExpired,
  activeHelpMode, handleVerify,
  timerSeconds, handleResendCode,
  addStrugglePoints
}) {
  return (
    <div className="space-y-4">
      <OtpInput 
        length={6} 
        value={code} 
        onChange={setCode} 
        onComplete={(val) => handleVerify(val)} 
        disabled={isLoading || isExpired} 
      />

      {activeHelpMode === 'keypad' && (
        <Keypad 
          onKeyPress={(digit) => { 
            if (code.length < 6) { 
              const newCode = code + digit; 
              setCode(newCode); 
              if (newCode.length === 6) handleVerify(newCode); 
            } 
          }}
          onDelete={() => setCode(prev => prev.slice(0, -1))}
          onClear={() => { setCode(''); addStrugglePoints(1, 'keypad_cleared'); }}
          onSubmit={() => handleVerify()}
          disabled={isLoading || isExpired}
        />
      )}

      <OtpTimer 
        timerSeconds={timerSeconds} 
        isExpired={isExpired} 
        onResendCode={handleResendCode} 
        isLoading={isLoading} 
      />

      <button
        type="button"
        disabled={isLoading || isExpired || code.length < 6}
        onClick={() => handleVerify()}
        className="w-full min-h-[48px] py-3 px-4 bg-sky-600 text-white font-bold text-base rounded-xl hover:bg-sky-700 shadow flex items-center justify-center gap-2 disabled:opacity-50 transition-colors high-contrast:bg-amber-400 high-contrast:text-slate-950"
      >
        <span>Verify Code & Complete Sign In</span>
      </button>

      <div className="pt-2 text-center">
        <Link
          to="/recovery-start"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-purple-700 underline p-2 rounded-lg transition-colors"
        >
          <PhoneOff className="w-4 h-4 text-purple-600" />
          <span>I can't access my phone / Lost device</span>
        </Link>
      </div>
    </div>
  );
}
