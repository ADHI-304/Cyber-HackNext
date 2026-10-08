/**
 * Centralized AuthBuddy Guidance Messages Dictionary
 * 
 * Provides contextual visual and voice guidance across the entire authentication
 * and account recovery journey.
 */

export const GUIDANCE_MESSAGES = {
  LOGIN_INITIAL: {
    state: 'LOGIN_INITIAL',
    title: 'Sign In to SecureBank',
    whatToDo: 'Enter your email or username and password to sign in.',
    whyRequired: 'Password verification protects your account from unauthorized access.',
    alternativeAction: 'Click "Forgot or Locked out?" if you cannot remember your password.',
    speechText: 'Welcome to SecureBank. Please enter your email and password to sign in. Click Forgot Password if you need help recovering your account.'
  },
  LOGIN_FAILED: {
    state: 'LOGIN_FAILED',
    title: 'Login Attempt Unsuccessful',
    whatToDo: 'Double-check Caps Lock and re-type your password, or click "Forgot Password" to recover access.',
    whyRequired: 'We protect accounts by preventing incorrect credentials from gaining entry.',
    alternativeAction: 'Choose "Forgot Password" to reset your password or start secure contact recovery.',
    speechText: 'The password entered did not match. Check your password using the eye icon, or select Forgot Password to start account recovery.'
  },
  OTP_ENTER: {
    state: 'OTP_ENTER',
    title: 'Verify Verification Code',
    whatToDo: 'Enter the 6-digit verification code sent to your registered phone.',
    whyRequired: 'Two-factor authentication ensures only the device owner can complete sign in.',
    alternativeAction: 'Click "I cannot access my phone" if your device is unavailable.',
    speechText: 'Enter the 6-digit verification code sent to your phone. If you do not have your phone, click I cannot access my phone.'
  },
  OTP_INVALID: {
    state: 'OTP_INVALID',
    title: 'Incorrect Code Entered',
    whatToDo: 'Check your phone messages and re-enter the 6 digits carefully.',
    whyRequired: 'Each verification code must match exactly to verify device ownership.',
    alternativeAction: 'Click "Get new code" or select "I cannot access my phone".',
    speechText: 'The verification code entered did not match. Double-check your text messages or click Get new code.'
  },
  OTP_EXPIRED: {
    state: 'OTP_EXPIRED',
    title: 'Verification Code Expired',
    whatToDo: 'Click "Get new code" to receive a fresh 6-digit verification code.',
    whyRequired: 'Verification codes expire after 30 seconds to prevent unauthorized reuse.',
    alternativeAction: 'Click "Get new code" or choose "I cannot access my phone".',
    speechText: 'Your verification code has expired after 30 seconds for security. Click Get new code to receive a fresh code.'
  },
  RECOVERY_START: {
    state: 'RECOVERY_START',
    title: 'Account Recovery Assistant',
    whatToDo: 'Select a verification method you still have access to.',
    whyRequired: 'Recovery options allow you to prove your identity safely when locked out.',
    alternativeAction: 'Click "I cannot access any of these" to start 2-of-3 trusted contact recovery.',
    speechText: 'Welcome to Account Recovery. Select a verification method you still access, or choose I cannot access any of these.'
  },
  RECOVERY_METHOD_SELECTION: {
    state: 'RECOVERY_METHOD_SELECTION',
    title: 'Choose Recovery Method',
    whatToDo: 'Select Phone, Email, Authenticator App, or Trusted Contact Recovery.',
    whyRequired: 'Multiple recovery factors ensure you can safely regain access.',
    alternativeAction: 'Select "I cannot access any of these" if all standard methods are lost.',
    speechText: 'Choose whether to verify using your registered phone, recovery email, authenticator app, or trusted contacts.'
  },
  PHONE_VERIFICATION: {
    state: 'PHONE_VERIFICATION',
    title: 'Registered Phone Recovery',
    whatToDo: 'Enter the 6-digit code sent to your registered phone number.',
    whyRequired: 'Phone verification proves you still possess your primary mobile device.',
    alternativeAction: 'Choose another recovery method if you cannot receive text messages.',
    speechText: 'Phone recovery selected. Enter the code sent to your phone to create a new password.'
  },
  EMAIL_VERIFICATION: {
    state: 'EMAIL_VERIFICATION',
    title: 'Recovery Email Link',
    whatToDo: 'Click "Send Recovery Link" and check your email inbox.',
    whyRequired: 'Email link verification confirms control of your registered recovery email.',
    alternativeAction: 'Choose another recovery method if you cannot access your email inbox.',
    speechText: 'Email recovery selected. Click Send Recovery Link to receive a secure password reset link.'
  },
  AUTHENTICATOR_VERIFICATION: {
    state: 'AUTHENTICATOR_VERIFICATION',
    title: 'Authenticator App Verification',
    whatToDo: 'Open your authenticator app and enter the current 6-digit code.',
    whyRequired: 'Time-based codes from your authenticator app provide strong 2FA security.',
    alternativeAction: 'Use another recovery option if your authenticator app is lost.',
    speechText: 'Authenticator recovery selected. Enter the 6-digit code from your authenticator app.'
  },
  NO_ACCESS_TO_METHOD: {
    state: 'NO_ACCESS_TO_METHOD',
    title: 'Secure Account Recovery Required',
    whatToDo: 'Start 2-of-3 trusted contact recovery to verify your identity.',
    whyRequired: 'When all standard verification factors are lost, trusted contacts provide human-verified proof.',
    alternativeAction: 'You will need 2 of your 3 pre-assigned friends to approve your request.',
    speechText: 'No standard recovery methods available. We will use 2-of-3 trusted contact recovery for security.'
  },
  TRUSTED_CONTACT_SELECTION: {
    state: 'TRUSTED_CONTACT_SELECTION',
    title: 'Select Trusted Contacts',
    whatToDo: 'Review your 3 trusted contacts and click "Start Secure Recovery".',
    whyRequired: 'At least 2 contacts must independently approve to prevent account takeover.',
    alternativeAction: 'Ensure your friends can be reached via phone or email to approve.',
    speechText: 'Select 3 trusted contacts. At least 2 contacts must approve your recovery request.'
  },
  CONTACT_APPROVAL: {
    state: 'CONTACT_APPROVAL',
    title: 'Trusted Contact Verification',
    whatToDo: 'Verify that your friend personally requested this account recovery before approving.',
    whyRequired: 'Direct personal verification ensures attackers cannot trick your contacts.',
    alternativeAction: 'Click "Deny Request" if you have not spoken directly with your friend.',
    speechText: 'Trusted Contact Verification. Only approve if you confirmed directly with your friend via phone or in person.'
  },
  RECOVERY_PENDING: {
    state: 'RECOVERY_PENDING',
    title: 'Recovery Request Pending',
    whatToDo: 'Wait for 2 of 3 contact approvals and the mandatory security delay.',
    whyRequired: 'A mandatory safety wait period protects your account if someone else requested recovery.',
    alternativeAction: 'Simulate contact approvals using the demo buttons on screen.',
    speechText: 'Recovery pending. We are waiting for 2 contact approvals and the security delay to elapse.'
  },
  CREATE_NEW_PASSWORD: {
    state: 'CREATE_NEW_PASSWORD',
    title: 'Create New Password',
    whatToDo: 'Enter and confirm a strong new password (at least 8 characters).',
    whyRequired: 'Creating a fresh password ensures your account is secured after recovery.',
    alternativeAction: 'Check the password strength meter to make sure your password is strong.',
    speechText: 'Identity verified. Enter and confirm your new password to complete account recovery.'
  },
  RECOVERY_COMPLETE: {
    state: 'RECOVERY_COMPLETE',
    title: 'Recovery Complete!',
    whatToDo: 'Click "Return to Sign In" to log in with your new password.',
    whyRequired: 'Your new password is now active on your account.',
    alternativeAction: 'Use your new password on the sign-in screen.',
    speechText: 'Your account recovery is complete. Click Return to Sign In to log in with your new password.'
  }
};

/**
 * Get guidance object by key, with safe fallback
 */
export function getGuidance(key) {
  return GUIDANCE_MESSAGES[key] || GUIDANCE_MESSAGES.LOGIN_INITIAL;
}
