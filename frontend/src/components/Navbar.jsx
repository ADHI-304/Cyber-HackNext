import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useA11yPrefs } from '../context/A11yContext';
import { Shield, LogOut, BarChart3, HelpCircle, UserPlus, LogIn } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useA11yPrefs();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            to={user?.role === 'admin' ? '/admin-friction' : '/'} 
            className="flex items-center gap-2.5 font-bold text-slate-900 text-lg sm:text-xl rounded-lg focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:outline-none p-1"
          >
            <div className="bg-sky-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-slate-900 font-bold">{t('appName')}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-700">{t('demoBadge')}</span>
            </div>
          </Link>

          <nav aria-label="Main Navigation">
            <ul className="flex items-center space-x-1 sm:space-x-2">
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <li>
                      <Link
                        to="/admin-friction"
                        className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                          isActive('/admin-friction') ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4 text-amber-700" aria-hidden="true" />
                        <span>{t('navAdmin')}</span>
                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link
                        to="/dashboard"
                        className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                          isActive('/dashboard') ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {t('navDashboard')}
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg text-rose-700 hover:bg-rose-50 flex items-center gap-1.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      <span>{t('navLogout')}</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                        isActive('/login') || isActive('/') ? 'bg-sky-100 text-sky-900 font-semibold' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <LogIn className="w-4 h-4" aria-hidden="true" />
                      <span>{t('navLogin')}</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                        isActive('/register') ? 'bg-sky-600 text-white font-semibold shadow-sm' : 'bg-sky-700 text-white hover:bg-sky-800 shadow-sm'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" aria-hidden="true" />
                      <span>{t('navRegister')}</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact-approval"
                      className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg text-purple-800 hover:bg-purple-50 flex items-center gap-1.5 transition-colors ${
                        isActive('/contact-approval') ? 'bg-purple-100 font-semibold' : ''
                      }`}
                    >
                      <Shield className="w-4 h-4 text-purple-700" aria-hidden="true" />
                      <span>{t('navAcceptContact')}</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/recovery-start"
                      className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors ${
                        isActive('/recovery-start') ? 'bg-slate-100 text-slate-900 font-semibold' : ''
                      }`}
                    >
                      <HelpCircle className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <span>{t('navRecovery')}</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
