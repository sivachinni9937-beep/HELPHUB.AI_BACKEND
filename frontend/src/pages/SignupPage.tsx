import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, UserCheck, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../app/providers';
import { UserRole } from '../types';

export const SignupPage: React.FC = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !displayName) return;
    await signup(email, displayName, role);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white mx-auto shadow-md">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Your Account</h1>
        <p className="text-xs text-slate-500">Join HelpHub AI to report, volunteer, and track civic progress</p>
      </div>

      <Card className="p-6 space-y-4">
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="E.g., Aarav Sharma"
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

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
              placeholder="At least 8 characters"
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">How will you participate?</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('citizen')}
                className={`p-2.5 rounded-xl border text-center transition ${
                  role === 'citizen' ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs">Citizen</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`p-2.5 rounded-xl border text-center transition ${
                  role === 'volunteer' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs">Volunteer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('organizer')}
                className={`p-2.5 rounded-xl border text-center transition ${
                  role === 'organizer' ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs">Organizer</span>
              </button>
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            <span>Register & Get Started</span>
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Already registered? </span>
          <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
            Sign in
          </Link>
        </div>
      </Card>

    </div>
  );
};

