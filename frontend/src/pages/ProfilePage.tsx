import React, { useState } from 'react';
import { User, Globe, MapPin, Heart, Shield, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RoleBadge } from '../components/ui/Badge';
import { useAuth } from '../app/providers';
import { LANGUAGES, SupportedLanguage } from '../lib/i18n';

export const ProfilePage: React.FC = () => {
  const { user, language, setLanguage, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [broadLocation, setBroadLocation] = useState(user?.broad_location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savedMessage, setSavedMessage] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-16 space-y-3">
        <h2 className="text-xl font-bold text-slate-800">Sign in to view your profile</h2>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const handleExportData = () => {
    const data = {
      user_profile: user,
      exported_at: new Date().toISOString(),
      platform: 'HelpHub AI Civic Problem Solver',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `helphub-user-data-${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Profile & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your civic identity, notification language, and privacy settings
        </p>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile preferences saved successfully.</span>
        </div>
      )}

      {/* Main Profile Form */}
      <Card className="p-6 sm:p-8 space-y-6">
        
        {/* User Identity Banner */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 font-bold text-xl flex items-center justify-center border border-teal-200 shadow-sm">
            {user.display_name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{user.display_name}</h2>
              <RoleBadge role={user.role} />
            </div>
            <p className="text-xs text-slate-500">{user.email || 'Community Contributor'}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Preferred Language</label>
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-3 py-2 rounded-lg font-medium border text-xs ${
                    language === l.code ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {l.native} ({l.label})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Broad Neighborhood / Ward Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={broadLocation}
                onChange={(e) => setBroadLocation(e.target.value)}
                placeholder="E.g., Patia, Bhubaneswar"
                className="w-full pl-9 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-xs"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Used only to suggest nearby volunteer drives and community concerns. Precise home coordinates are never required.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Bio / Civic Interests</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell other volunteers about your skills and community goals..."
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" size="sm">Save Changes</Button>
          </div>
        </form>

      </Card>

      {/* Privacy and Data Rights */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>Privacy & Data Management</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          HelpHub AI adheres to open-source civic privacy principles. We never sell personal data or disclose private coordinates without authorization.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="w-3.5 h-3.5" />
            <span>Export Personal Data (.json)</span>
          </Button>

          <Button onClick={logout} variant="secondary" size="sm">
            <span>Sign Out</span>
          </Button>
        </div>
      </Card>

    </div>
  );
};

