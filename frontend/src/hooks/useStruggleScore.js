import { useState, useEffect, useCallback } from 'react';
import { logEvent } from '../api/mockApi';

export function useStruggleScore(currentStepName = 'General') {
  const [score, setScore] = useState(0);
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const [isPromptEligible, setIsPromptEligible] = useState(false);
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [hasDeclinedHelp, setHasDeclinedHelp] = useState(false);
  const [activeHelpMode, setActiveHelpMode] = useState(null); // 'keypad' | 'guided' | null

  // Increment score points
  const addStrugglePoints = useCallback((points, reason = 'action') => {
    setScore(prev => {
      const newScore = prev + points;
      logEvent('STRUGGLE_SCORE_UPDATE', { 
        step: currentStepName, 
        added: points, 
        newTotal: newScore, 
        reason 
      });
      return newScore;
    });
  }, [currentStepName]);

  // Record a failed login attempt
  const recordFailedLogin = useCallback(() => {
    setFailedLoginAttempts(prev => {
      const nextCount = prev + 1;
      logEvent('FAILED_LOGIN_ATTEMPT', { count: nextCount, step: currentStepName });
      
      // Trigger AuthBuddy eligibility on 2 consecutive failures
      if (nextCount >= 2 && !hasDeclinedHelp) {
        setIsPromptEligible(true);
        logEvent('AUTHBUDDY_PROMPT_ELIGIBLE', { consecutiveFailures: nextCount });
      }
      return nextCount;
    });
    addStrugglePoints(2, 'failed_login_attempt');
  }, [currentStepName, addStrugglePoints, hasDeclinedHelp]);

  // Record a successful login
  const recordSuccessLogin = useCallback(() => {
    setFailedLoginAttempts(0);
    setIsPromptEligible(false);
  }, []);

  // Idle detection (>10s)
  useEffect(() => {
    const timer = setTimeout(() => {
      addStrugglePoints(1, 'idle_10s');
    }, 10000);

    const handleUserActivity = () => {
      clearTimeout(timer);
    };

    window.addEventListener('keydown', handleUserActivity, { once: true });
    window.addEventListener('click', handleUserActivity, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [currentStepName, addStrugglePoints]);

  // If score >= 5 and help not declined, become prompt eligible
  useEffect(() => {
    if (score >= 5 && !hasDeclinedHelp && !isGuidedMode) {
      setIsPromptEligible(true);
    }
  }, [score, hasDeclinedHelp, isGuidedMode]);

  // User selects "Yes, help me"
  const acceptHelp = useCallback(() => {
    setIsGuidedMode(true);
    setIsPromptEligible(false);
    logEvent('AUTHBUDDY_ACCEPTED', { step: currentStepName });
  }, [currentStepName]);

  // User selects "No, I'll try again"
  const declineHelp = useCallback(() => {
    setHasDeclinedHelp(true);
    setIsPromptEligible(false);
    setIsGuidedMode(false);
    logEvent('AUTHBUDDY_DECLINED', { step: currentStepName });
  }, [currentStepName]);

  const resetScore = useCallback(() => {
    setScore(0);
    setFailedLoginAttempts(0);
    setIsPromptEligible(false);
    setIsGuidedMode(false);
    setHasDeclinedHelp(false);
    setActiveHelpMode(null);
  }, []);

  return {
    score,
    failedLoginAttempts,
    isPromptEligible,
    isGuidedMode,
    hasDeclinedHelp,
    activeHelpMode,
    setActiveHelpMode,
    addStrugglePoints,
    recordFailedLogin,
    recordSuccessLogin,
    acceptHelp,
    declineHelp,
    resetScore,
  };
}
