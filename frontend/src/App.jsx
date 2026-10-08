import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { A11yProvider } from './context/A11yContext';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityBar } from './components/AccessibilityBar';
import { Navbar } from './components/Navbar';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyOtp } from './pages/VerifyOtp';
import { Dashboard } from './pages/Dashboard';
import { RecoveryStart } from './pages/RecoveryStart';
import { RecoveryStatus } from './pages/RecoveryStatus';
import { ResetPassword } from './pages/ResetPassword';
import { ContactApproval } from './pages/ContactApproval';
import { AdminFriction } from './pages/AdminFriction';

export function App() {
  return (
    <A11yProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors">
            {/* Always visible WCAG Accessibility Toolbar */}
            <AccessibilityBar />

            {/* Top Navigation Bar */}
            <Navbar />

            {/* Main Application Routes */}
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/recovery-start" element={<RecoveryStart />} />
                <Route path="/recovery-status" element={<RecoveryStatus />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/contact-approval" element={<ContactApproval />} />
                <Route path="/admin-friction" element={<AdminFriction />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>

            {/* Accessible Footer */}
            <footer className="bg-slate-900 text-slate-400 py-6 px-4 text-center text-xs border-t border-slate-800">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-semibold text-slate-300">
                  <span>AuthBuddy &copy; 2026</span>
                  <span>&bull;</span>
                  <span>SecureBank Demo</span>
                </div>
                <p className="text-slate-400">
                  WCAG 2.1 AA Compliant &bull; Plain-Language Error Explainer &bull; Adaptive Assistance
                </p>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </A11yProvider>
  );
}

export default App;
