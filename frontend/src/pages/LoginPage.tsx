import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Sparkles, UserCheck, Shield, HeartHandshake, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../app/providers';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, isDemoMode, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await login(email, 'citizen');
    navigate('/dashboard');
  };

  const handleQuickDemoRole = async (role: UserRole) => {
    await login(`${role}@helphub.local`, role);
    navigate(role === 'moderator' || role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white mx-auto shadow-md">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to HelpHub AI</h1>
        <p className="text-xs text-slate-500">Collaborate with neighbors and organizers on local civic solutions</p>
      </div>

      {/* Quick Demo Sign-in Panel */}
      <Card className="p-5 border-teal-200 bg-gradient-to-b from-teal-50/50 to-white space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <h3 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
            One-Click Instant Role Demo
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Test any role without setting up an external database. Click to explore permissions:
        </p>

        <div className="grid grid-cols-1 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleQuickDemoRole('citizen')}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/30 transition text-left text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                C
              </div>
              <div>
                <p className="font-semibold text-slate-900">Registered Citizen (Aarav)</p>
                <p className="text-[11px] text-slate-500">Submit reports, comment, follow issues</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoRole('volunteer')}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/30 transition text-left text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                V
              </div>
              <div>
                <p className="font-semibold text-slate-900">Community Volunteer (Priya)</p>
                <p className="text-[11px] text-slate-500">Sign up for drives, participate in remediation</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoRole('organizer')}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/30 transition text-left text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                O
              </div>
              <div>
                <p className="font-semibold text-slate-900">NGO Organizer (Dr. Rajesh Das)</p>
                <p className="text-[11px] text-slate-500">Create volunteer drives, update status</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoRole('moderator')}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:bg-purple-50/30 transition text-left text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                M
              </div>
              <div>
                <p className="font-semibold text-slate-900">Community Moderator (Anita)</p>
                <p className="text-[11px] text-slate-500">Review flagged comments & abuse reports</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoRole('admin')}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-800 hover:bg-slate-50 transition text-left text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div>
                <p className="font-semibold text-slate-900">Platform Administrator</p>
                <p className="text-[11px] text-slate-500">System health, metrics, audit logs, categories</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </Card>

      {/* Standard Email Sign-In */}
      <Card className="p-6 space-y-4">
        <form onSubmit={handleCustomLogin} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            <span>Continue to HelpHub</span>
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>New to HelpHub? </span>
          <Link to="/signup" className="font-semibold text-teal-600 hover:text-teal-700">
            Create an account
          </Link>
        </div>
      </Card>

    </div>
  );
};

