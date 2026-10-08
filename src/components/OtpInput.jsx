import React, { useRef, useEffect } from 'react';

export function OtpInput({ length = 6, value = '', onChange, onComplete, disabled }) {
  const inputRefs = useRef([]);

  // Array of digits from value string
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus first empty box on mount if empty
    if (value.length === 0 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const char = e.target.value.slice(-1);
    if (!/^\d*$/.test(char)) return; // Only numeric

    const newDigits = [...digits];
    newDigits[index] = char;
    const newValue = newDigits.join('');

    onChange(newValue);

    // Auto-advance to next input if digit typed
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Trigger onComplete callback if all digits filled
    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const nextFocus = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div 
      className="flex items-center justify-center gap-2 sm:gap-3 my-4" 
      role="group" 
      aria-label="6-digit verification code input"
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digits[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 border-slate-300 bg-white text-slate-900 shadow-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-200 focus:outline-none transition-all disabled:opacity-50 high-contrast:bg-slate-900 high-contrast:text-white high-contrast:border-amber-400"
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-required="true"
        />
      ))}
    </div>
  );
}
