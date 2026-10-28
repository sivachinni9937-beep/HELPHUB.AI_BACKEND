import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Server, 
  FileText,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../app/providers';
import { apiClient } from '../lib/api-client';

interface AbuseItem {
  id: string;
  reporter_name: string;
  target_type: string;
  target_id: string;
  reason: string;
  review_status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
}

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'moderation' | 'system'>('metrics');
  const [metrics, setMetrics] = useState({
    totalReports: 4,
    resolvedCount: 1,
    inProgressCount: 1,
    openCount: 2,
    resolutionRate: '25.0%',
    volunteerCommitments: 9,
  });

  const [abuseQueue, setAbuseQueue] = useState<AbuseItem[]>([
    {
      id: 'ab-1',
      reporter_name: 'Priya Patel',
      target_type: 'comment',
      target_id: 'c-99',
      reason: 'Profane argument regarding parking space allocation in residential lane.',
      review_status: 'pending',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'ab-2',
      reporter_name: 'Aarav Sharma',
      target_type: 'report',
      target_id: 'r-55',
      reason: 'Duplicate submission of existing Saheed Nagar streetlight outage.',
      review_status: 'pending',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    }
  ]);

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isPrivileged = user && (user.role === 'moderator' || user.role === 'admin');

  if (!isPrivileged) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          This dashboard requires Community Moderator or Platform Administrator privileges.
        </p>
        <p className="text-xs text-teal-700 font-medium">
          Tip: In Demonstration Mode, use the role switcher in the top navigation bar to select Moderator or Administrator.
        </p>
      </div>
    );
  }

  const handleReviewAction = (id: string, newStatus: 'reviewed' | 'dismissed') => {
    setAbuseQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, review_status: newStatus } : item))
    );
    setActionMessage(`Moderation action recorded: Marked item as ${newStatus}.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Administration & Moderation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              {user.role.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time platform telemetry, community moderation queue, and Gemma 4 runtime status
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'metrics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Platform Impact
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'moderation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Moderation Queue ({abuseQueue.filter((a) => a.review_status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'system' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI & System Health
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tab 1: Platform Metrics */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-5 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reports</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{metrics.totalReports}</p>
              <span className="text-[11px] text-teal-600 font-medium">Logged on platform</span>
            </Card>
            <Card className="p-5 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved</span>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{metrics.resolvedCount}</p>
              <span className="text-[11px] text-emerald-700 font-medium">Verified solutions</span>
            </Card>
            <Card className="p-5 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
              <p className="text-3xl font-extrabold text-blue-600 mt-1">{metrics.inProgressCount}</p>
              <span className="text-[11px] text-blue-700 font-medium">Volunteers mobilized</span>
            </Card>
            <Card className="p-5 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolution Rate</span>
              <p className="text-3xl font-extrabold text-purple-600 mt-1">{metrics.resolutionRate}</p>
              <span className="text-[11px] text-purple-700 font-medium">Community completion</span>
            </Card>
          </div>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>Civic Activity Audit Log Preview</span>
            </h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor Role</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-3">{new Date().toLocaleTimeString()}</td>
                    <td className="p-3"><span className="font-semibold text-purple-700">moderator</span></td>
                    <td className="p-3">METRICS_INSPECT</td>
                    <td className="p-3 font-mono text-[11px]">telemetry/impact</td>
                  </tr>
                  <tr>
                    <td className="p-3">{new Date(Date.now() - 3600000).toLocaleTimeString()}</td>
                    <td className="p-3"><span className="font-semibold text-indigo-700">organizer</span></td>
                    <td className="p-3">VOLUNTEER_DRIVE_PUBLISH</td>
                    <td className="p-3 font-mono text-[11px]">drive/saheed-nagar</td>
                  </tr>
                  <tr>
                    <td className="p-3">{new Date(Date.now() - 7200000).toLocaleTimeString()}</td>
                    <td className="p-3"><span className="font-semibold text-teal-700">citizen</span></td>
                    <td className="p-3">REPORT_CREATE</td>
                    <td className="p-3 font-mono text-[11px]">report/patia-sanitation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Reported Items Awaiting Review</h2>
            <span className="text-xs text-slate-500">Moderation actions are recorded in immutable audit logs</span>
          </div>

          <div className="space-y-3">
            {abuseQueue.map((item) => (
              <Card key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 uppercase tracking-wide">
                      Target: {item.target_type} ({item.target_id})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.review_status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.review_status}
                    </span>
                  </div>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    "{item.reason}"
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Reported by {item.reporter_name} • {new Date(item.created_at).toLocaleTimeString()}
                  </p>
                </div>

                {item.review_status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleReviewAction(item.id, 'reviewed')}
                      variant="primary"
                      size="sm"
                    >
                      Take Action
                    </Button>
                    <Button
                      onClick={() => handleReviewAction(item.id, 'dismissed')}
                      variant="outline"
                      size="sm"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI & System Health */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Gemma 4 & Ollama Runtime</h3>
            </div>
            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Configured Model Identifier:</span>
                <span className="font-mono font-bold text-teal-800">gemma4</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Ollama Base URL:</span>
                <span className="font-mono text-slate-600">http://localhost:11434</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Heuristic Fallback Pipeline:</span>
                <span className="font-semibold text-emerald-700">Active (Safe Fallback)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Max Prompt Limit:</span>
                <span>5,000 Characters</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Rate Limit:</span>
                <span>20 requests / min</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Server className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Database & Security Policies</h3>
            </div>
            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Database Engine:</span>
                <span className="font-semibold">Supabase PostgreSQL 15</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Row Level Security (RLS):</span>
                <span className="font-semibold text-emerald-700">Enabled across 14 tables</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Active Operational Mode:</span>
                <span className="font-semibold text-amber-800">Demonstration Mode</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Audit Logging:</span>
                <span className="font-semibold text-emerald-700">Enabled</span>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

