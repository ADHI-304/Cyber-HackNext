# AuthBuddy — Universal Contextual AI Guidance & Progressive 2-Tier Account Recovery

AuthBuddy is a **friction-triggered AI guidance layer** and **progressive 2-tier account recovery system** built on top of bank-grade authentication (**React 18 + Vite**, **React Router**, **Tailwind CSS**, **Recharts**, and **Web Speech API**).

---

## 🤖 Universal AuthBuddy Guidance (`AuthBuddyGuidance.jsx`)

AuthBuddy provides **contextual visual and voice guidance** across every single step of the authentication and recovery journey, driven by `src/data/guidanceMessages.js`.

### Supported States & Message Mapping:
- `LOGIN_INITIAL` & `LOGIN_FAILED`
- `OTP_ENTER`, `OTP_INVALID`, `OTP_EXPIRED`
- `RECOVERY_START` & `RECOVERY_METHOD_SELECTION`
- `PHONE_VERIFICATION`, `EMAIL_VERIFICATION`, `AUTHENTICATOR_VERIFICATION`
- `NO_ACCESS_TO_METHOD` & `TRUSTED_CONTACT_SELECTION`
- `CONTACT_APPROVAL` & `RECOVERY_PENDING`
- `CREATE_NEW_PASSWORD` & `RECOVERY_COMPLETE`

### Guidance Features:
- 🔊 **Voice Control**: Web Speech API (`speechSynthesis`) with visible **Listen** / **Stop Voice** buttons.
- 🚫 **No Secrets Leaked**: Passwords, OTP codes, and secrets are NEVER exposed in speech or visual text.
- 🔒 **Zero Security Bypasses**: The AI guidance layer NEVER overrides password checks, 2FA codes, or lockouts.
- ⚡ **Smart Voice Triggers**: Auto-speaks when entering a new state (if Voice Guidance is toggled on) without repeatedly re-speaking on re-renders.

---

## 🎬 Complete Demo Flow (End-to-End)

```text
Login → 2 failed attempts → AuthBuddy → OTP → Forgot Password → Recovery Method Selection → No Access → Trusted Contacts → Recovery Pending → New Password → Complete
```

1. **Login & 2 Failed Attempts**:
   - Open `http://localhost:3000/login`.
   - Enter wrong password twice $\rightarrow$ AuthBuddy prompt activates (*"Are you trying to sign in?"*).
   - Click **"Yes, help me"** $\rightarrow$ Guided Authentication Mode activates. Click **Listen** on `AuthBuddyGuidance` to hear voice assistance.

2. **OTP Verification**:
   - Enter valid credentials $\rightarrow$ Advances to Step 2 OTP verification.
   - Test invalid code (`OTP_INVALID`) or wait 30s (`OTP_EXPIRED`). `AuthBuddyGuidance` automatically updates with plain-language action steps.

3. **Forgot Password & Recovery Method Selection**:
   - Click **"Forgot Password"** $\rightarrow$ Navigates to `/recovery-start`.
   - `AuthBuddyGuidance` displays `RECOVERY_METHOD_SELECTION` guidelines.
   - Select **"📱 Registered phone"**, **"📧 Recovery email"**, or **"🔐 Authenticator app"** to test simple recovery.

4. **No Access $\rightarrow$ Trusted Contacts Recovery**:
   - Select **"🆘 I can't access any of these"** on `/recovery-start`.
   - `AuthBuddyGuidance` updates to `NO_ACCESS_TO_METHOD` explaining why 2-of-3 contact approvals are required.
   - Submit recovery $\rightarrow$ `AuthBuddyGuidance` displays `RECOVERY_PENDING` on `/recovery-status`.
   - Simulate 2 approvals $\rightarrow$ Click **"Set Up New Device Now"**.

5. **Create New Password & Recovery Complete**:
   - Navigates to `/reset-password`.
   - `AuthBuddyGuidance` displays `CREATE_NEW_PASSWORD` guidance.
   - Type new password and submit $\rightarrow$ Guidance updates to `RECOVERY_COMPLETE`. Click **Return to Sign In**.

---

## 📊 Admin UX Telemetry (`/admin-friction`)

The **AdminFriction** dashboard displays real-time telemetry:
- **Users Successfully Recovered**: `48`
- **Users Assisted**: `34` (81% accepted)
- **`Security Requirements Bypassed: 0`**
- **AuthBuddy Activations**: `42`
- Recharts visualizations for failures per step, lockouts over time, and friction vs. risk matrix.

---

## 🛠️ Setup & Running

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Production build
npm run build
```
