import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  PlusCircle, 
  ShieldCheck, 
  Menu, 
  X, 
  Globe, 
  Check, 
  Sparkles,
  LogOut,
  LogIn,
  UserPlus,
  User,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../app/providers';
import { RoleBadge } from '../ui/Badge';
import { LANGUAGES, SupportedLanguage, getTranslation } from '../../lib/i18n';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, switchRole, language, setLanguage, logout, isDemoMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const demoRoles: { role: UserRole; label: string }[] = [
    { role: 'citizen', label: 'Citizen (Aarav)' },
    { role: 'volunteer', label: 'Volunteer (Priya)' },
    { role: 'organizer', label: 'NGO Organizer (Dr. Das)' },
    { role: 'moderator', label: 'Moderator (Anita)' },
    { role: 'admin', label: 'Administrator' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-slate-900 tracking-tight">HelpHub AI</span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 rounded border border-teal-200">
                    Civic
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 hidden md:block">Community Problem Solver</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/reports"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/reports')
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {getTranslation(language, 'reportsFeed')}
              </Link>
              <Link
                to="/volunteers"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/volunteers')
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {getTranslation(language, 'volunteering')}
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {getTranslation(language, 'dashboard')}
                </Link>
              )}
              {user && (user.role === 'moderator' || user.role === 'admin') && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/admin')
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>{getTranslation(language, 'admin')}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Report a Problem CTA */}
            <Link
              to="/create-report"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{getTranslation(language, 'reportProblem')}</span>
            </Link>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                aria-label="Select language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{LANGUAGES.find((l) => l.code === language)?.native || 'EN'}</span>
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-fade-in">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-between"
                    >
                      <span>{l.native}</span>
                      {language === l.code && <Check className="w-3 h-3 text-teal-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Demo Role Switcher Dropdown */}
            {isDemoMode && (
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                  title="Switch User Role in Demonstration Mode"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Role: {user ? user.role.toUpperCase() : 'GUEST'}</span>
                </button>
                {roleMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                    <div className="px-3 py-1 border-b border-slate-100 mb-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Demo Role Switcher</p>
                    </div>
                    {demoRoles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          user?.role === r.role ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <RoleBadge role={r.role} />
                          <span>{r.label}</span>
                        </div>
                        {user?.role === r.role && <Check className="w-3.5 h-3.5 text-teal-600" />}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setRoleMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        Switch to Guest (Log out)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Authentication Status */}
            {user ? (
              <div className="relative flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/60"
                  aria-label="User Account Menu"
                >
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left max-w-[130px]">
                    <span className="text-xs font-semibold text-slate-800 truncate leading-tight">
                      {user.display_name}
                    </span>
                    <span className="text-[10px] text-teal-700 font-medium capitalize leading-none">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Menu Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.display_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email || `${user.role}@helphub.local`}</p>
                      <div className="mt-1.5">
                        <RoleBadge role={user.role} />
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile & Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{getTranslation(language, 'signIn')}</span>
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          {/* User Status Card in Mobile Menu */}
          {user ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                  {user.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.display_name}</p>
                  <RoleBadge role={user.role} />
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 text-xs text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg font-medium flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Out</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-slate-900 rounded-lg"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          <Link
            to="/reports"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {getTranslation(language, 'reportsFeed')}
          </Link>
          <Link
            to="/volunteers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {getTranslation(language, 'volunteering')}
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {getTranslation(language, 'dashboard')}
            </Link>
          )}
          {user && (user.role === 'moderator' || user.role === 'admin') && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50"
            >
              {getTranslation(language, 'admin')}
            </Link>
          )}
          <Link
            to="/create-report"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium bg-teal-600 text-white shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{getTranslation(language, 'reportProblem')}</span>
          </Link>

          {/* Mobile Language and Role selectors */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Language:</span>
            <div className="flex gap-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2 py-1 text-xs rounded ${
                    language === l.code ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
