import React, { createContext, useContext, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('authbuddy_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [pendingOtpUser, setPendingOtpUser] = useState(null);

  const startOtpStep = (username) => {
    setPendingOtpUser(username);
  };

  const completeLogin = (userData) => {
    setUser(userData);
    setPendingOtpUser(null);
    try {
      sessionStorage.setItem('authbuddy_user', JSON.stringify(userData));
      localStorage.setItem('authbuddy_user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Could not save user session', e);
    }
  };

  const logout = () => {
    setUser(null);
    setPendingOtpUser(null);
    try {
      sessionStorage.removeItem('authbuddy_user');
      localStorage.removeItem('authbuddy_user');
    } catch (e) {
      console.warn('Could not remove user session', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        pendingOtpUser,
        startOtpStep,
        completeLogin,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
