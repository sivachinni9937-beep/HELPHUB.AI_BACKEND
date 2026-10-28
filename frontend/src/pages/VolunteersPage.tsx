import React, { useEffect, useState } from 'react';
import { 
  HeartHandshake, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Accessibility
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../app/providers';
import { apiClient } from '../lib/api-client';
import { VolunteerOpportunity } from '../types';

export const VolunteersPage: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'my_commitments'>('all');

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [capacity, setCapacity] = useState(15);
  const [accessibilityNotes, setAccessibilityNotes] = useState('');
  const [skills, setSkills] = useState('');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadOpportunities();
  }, [user]);

  const loadOpportunities = () => {
    const list = apiClient.getLocalVolunteers();
    setOpportunities(list);
  };

  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSignup = (oppId: string) => {
    if (!user) {
      showToast('Please sign in or select a demo role to join volunteer drives.', 'error');
      return;
    }

    const updated = opportunities.map((opp) => {
      if (opp.id === oppId) {
        if (opp.is_signed_up_by_user) {
          showToast('You are already registered for this drive.', 'error');
          return opp;
        }
        if (opp.current_signups_count >= opp.capacity) {
          showToast('Registration capacity has been reached for this drive.', 'error');
          return opp;
        }
        showToast('Successfully signed up! Thank you for volunteering.', 'success');
        return {
          ...opp,
          is_signed_up_by_user: true,
          current_signups_count: opp.current_signups_count + 1,
        };
      }
      return opp;
    });

    setOpportunities(updated);
    apiClient.saveLocalVolunteers(updated);
  };

  const handleWithdraw = (oppId: string) => {
    const updated = opportunities.map((opp) => {
      if (opp.id === oppId) {
        showToast('Your registration has been withdrawn.', 'success');
        return {
          ...opp,
          is_signed_up_by_user: false,
          current_signups_count: Math.max(0, opp.current_signups_count - 1),
        };
      }
      return opp;
    });

    setOpportunities(updated);
    apiClient.saveLocalVolunteers(updated);
  };

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) return;

    const newOpp: VolunteerOpportunity = {
      id: `opp-${Date.now()}`,
      organizer_id: user?.id || 'org',
      organizer_name: user?.display_name || 'Community Organizer',
      organization_name: 'Odisha Urban Care Foundation',
      title,
      description,
      location,
      start_at: dateStr ? new Date(dateStr).toISOString() : new Date(Date.now() + 259200000).toISOString(),
      end_at: dateStr ? new Date(new Date(dateStr).getTime() + 10800000).toISOString() : new Date(Date.now() + 270000000).toISOString(),
      capacity,
      current_signups_count: 0,
      is_signed_up_by_user: false,
      status: 'open',
      accessibility_notes: accessibilityNotes,
      skills_needed: skills ? skills.split(',').map((s) => s.trim()) : ['teamwork'],
      created_at: new Date().toISOString(),
    };

    const updated = [newOpp, ...opportunities];
    setOpportunities(updated);
    apiClient.saveLocalVolunteers(updated);
    setCreateModalOpen(false);
    showToast('New volunteer opportunity created successfully!', 'success');

    // Reset form
    setTitle('');
    setDescription('');
    setLocation('');
    setAccessibilityNotes('');
    setSkills('');
  };

  const isOrganizer = user && (user.role === 'organizer' || user.role === 'admin');

  const filteredOpportunities = opportunities.filter((o) => {
    if (activeTab === 'open') return o.status === 'open';
    if (activeTab === 'my_commitments') return o.is_signed_up_by_user;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-500 hover:text-slate-800">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Volunteer Drives & Opportunities
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Join hands-on neighborhood cleanups, accessibility paint campaigns, and public space repair drives
          </p>
        </div>

        {isOrganizer && (
          <Button onClick={() => setCreateModalOpen(true)} size="md">
            <PlusCircle className="w-4 h-4" />
            <span>Create Volunteer Drive</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'all'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Drives ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveTab('open')}
          className={`px-4 py-2.5 border-b-2 transition ${
            activeTab === 'open'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Open for Signups
        </button>
        {user && (
          <button
            onClick={() => setActiveTab('my_commitments')}
            className={`px-4 py-2.5 border-b-2 transition ${
              activeTab === 'my_commitments'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Signups ({opportunities.filter((o) => o.is_signed_up_by_user).length})
          </button>
        )}
      </div>

      {/* Opportunities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOpportunities.map((opp) => {
          const spotsLeft = opp.capacity - opp.current_signups_count;
          const isFull = spotsLeft <= 0;

          return (
            <Card key={opp.id} className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{opp.title}</h3>
                    <p className="text-xs text-teal-700 font-medium">{opp.organization_name || opp.organizer_name}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      isFull
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {isFull ? 'Capacity Full' : `${spotsLeft} spots available`}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {opp.description}
                </p>

                {/* Capacity progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Volunteers: {opp.current_signups_count} registered</span>
                    <span>Max: {opp.capacity}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-teal-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (opp.current_signups_count / opp.capacity) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{opp.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{new Date(opp.start_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Accessibility Notes */}
                {opp.accessibility_notes && (
                  <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <Accessibility className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="text-[11px]">{opp.accessibility_notes}</span>
                  </div>
                )}

                {/* Skills tags */}
                {opp.skills_needed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {opp.skills_needed.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {opp.is_signed_up_by_user ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>You are registered</span>
                    </span>
                    <Button onClick={() => handleWithdraw(opp.id)} variant="outline" size="sm">
                      Withdraw
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleSignup(opp.id)}
                    disabled={isFull}
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto ml-auto"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Join Volunteer Drive</span>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Opportunity Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Community Volunteer Drive">
        <form onSubmit={handleCreateOpportunity} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Drive Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Saheed Nagar Park Sapling Planting & Trash Pickup"
              required
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Detailed Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will volunteers do? Are tools provided? Outline schedule..."
              rows={3}
              required
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Meeting Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="E.g., Park North Gate, Bhubaneswar"
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Volunteer Capacity</label>
              <input
                type="number"
                min={1}
                max={500}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 10)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Accessibility Information</label>
            <input
              type="text"
              value={accessibilityNotes}
              onChange={(e) => setAccessibilityNotes(e.target.value)}
              placeholder="E.g., Level paving, resting benches available, drinking water provided."
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Helpful Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="E.g., painting, gardening, heavy lifting"
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button onClick={() => setCreateModalOpen(false)} variant="outline" size="sm">Cancel</Button>
            <Button type="submit" size="sm">Publish Volunteer Drive</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

