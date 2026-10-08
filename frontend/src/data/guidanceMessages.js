import { t } from '../i18n';

/**
 * Get localized guidance object by key, supporting English, Hindi, Tamil, and Malayalam.
 */
export function getGuidance(key, lang = 'en') {
  switch (key) {
    case 'LOGIN_FAILED':
      return {
        state: 'LOGIN_FAILED',
        title: t(lang, 'errInvalidCredsTitle'),
        whatToDo: t(lang, 'errInvalidCredsText'),
        whyRequired: t(lang, 'pwdHint8Chars'),
        alternativeAction: t(lang, 'forgotPassword'),
        speechText: t(lang, 'errInvalidCredsText')
      };
    case 'OTP_ENTER':
      return {
        state: 'OTP_ENTER',
        title: t(lang, 'otpTitle'),
        whatToDo: t(lang, 'guidanceOtpText'),
        whyRequired: t(lang, 'otpStepTitle'),
        alternativeAction: t(lang, 'noAccessContacts'),
        speechText: t(lang, 'guidanceOtpText')
      };
    case 'PHONE_VERIFICATION':
      return {
        state: 'PHONE_VERIFICATION',
        title: t(lang, 'recoveryPhoneTitle'),
        whatToDo: t(lang, 'guidancePhoneText'),
        whyRequired: t(lang, 'recoveryPhoneTitle'),
        alternativeAction: t(lang, 'autoFillDemoCode'),
        speechText: t(lang, 'guidancePhoneText')
      };
    case 'EMAIL_VERIFICATION':
      return {
        state: 'EMAIL_VERIFICATION',
        title: t(lang, 'recoveryEmailTitle'),
        whatToDo: t(lang, 'guidanceEmailText'),
        whyRequired: t(lang, 'recoveryEmailTitle'),
        alternativeAction: t(lang, 'recoveryEmailTitle'),
        speechText: t(lang, 'guidanceEmailText')
      };
    case 'AUTHENTICATOR_VERIFICATION':
      return {
        state: 'AUTHENTICATOR_VERIFICATION',
        title: t(lang, 'recoveryTotpTitle'),
        whatToDo: t(lang, 'guidanceTotpText'),
        whyRequired: t(lang, 'recoveryTotpTitle'),
        alternativeAction: t(lang, 'autoFillDemoCode'),
        speechText: t(lang, 'guidanceTotpText')
      };
    case 'NO_ACCESS_TO_METHOD':
      return {
        state: 'NO_ACCESS_TO_METHOD',
        title: t(lang, 'guidanceNoAccessTitle'),
        whatToDo: t(lang, 'guidanceNoAccessText'),
        whyRequired: t(lang, 'contact1Status'),
        alternativeAction: t(lang, 'noAccessContacts'),
        speechText: t(lang, 'guidanceNoAccessText')
      };
    case 'RECOVERY_PENDING':
      return {
        state: 'RECOVERY_PENDING',
        title: t(lang, 'recoveryPendingTitle'),
        whatToDo: t(lang, 'recoveryPendingDesc'),
        whyRequired: t(lang, 'approvalsNeeded'),
        alternativeAction: t(lang, 'contact1Status'),
        speechText: t(lang, 'recoveryPendingDesc')
      };
    case 'LOGIN_INITIAL':
    default:
      return {
        state: 'LOGIN_INITIAL',
        title: t(lang, 'guidanceLoginInitialTitle'),
        whatToDo: t(lang, 'guidanceLoginInitialText'),
        whyRequired: t(lang, 'pwdHint8Chars'),
        alternativeAction: t(lang, 'forgotPassword'),
        speechText: t(lang, 'guidanceLoginInitialText')
      };
  }
}
