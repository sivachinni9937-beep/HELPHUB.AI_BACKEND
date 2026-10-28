import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  HeartHandshake, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  ShieldAlert,
  Bell
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge, UrgencyBadge, RoleBadge } from '../components/ui/Badge';
import { useAuth } from '../app/providers';
import { apiClient } from '../lib/api-client';
import { ReportItem, VolunteerOpportunity } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [myReports, setMyReports] = useState<ReportItem[]>([]);
  const [followedReports, setFollowedReports] = useState<ReportItem[]>([]);
  const [volunteerDrives, setVolunteerDrives] = useState<VolunteerOpportunity[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const allReports = await apiClient.getReports();
      if (user) {
        setMyReports(allReports.filter((r) => r.creator.id === user.id));
        setFollowedReports(allReports.filter((r) => r.is_followed_by_user && r.creator.id !== user.id));
      } else {
        setMyReports(allReports.slice(0, 1));
        setFollowedReports(allReports.slice(1, 2));
      }
      const allOpps = apiClient.getLocalVolunteers();
      setVolunteerDrives(allOpps);
    };
    loadDashboard();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Please Sign In to Access Your Dashboard</h2>
        <p className="text-xs text-slate-500">Track your submissions, followed reports, and volunteer commitments.</p>
        <Link to="/login">
          <Button>Sign In to Continue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user.display_name}
            </h1>
            <RoleBadge role={user.role} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {user.broad_location || 'Community Member'} • Active Civic Participant
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/create-report">
            <Button size="md">
              <PlusCircle className="w-4 h-4" />
              <span>Report a Problem</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-white">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Submissions</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{myReports.length}</p>
          <span className="text-[11px] text-teal-600 font-medium">Logged in community feed</span>
        </Card>
        <Card className="p-5 bg-white">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Followed Reports</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{followedReports.length}</p>
          <span className="text-[11px] text-blue-600 font-medium">Receiving status updates</span>
        </Card>
        <Card className="p-5 bg-white">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Volunteer Drives</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{volunteerDrives.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Active in your region</span>
        </Card>
        <Card className="p-5 bg-white">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Solved</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {myReports.filter((r) => r.status === 'resolved').length}
          </p>
          <span className="text-[11px] text-purple-600 font-medium">Community impact</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: My Reports & Followed Reports */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* My Reports */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Reports Created by You</h2>
              <Link to="/reports" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                View all in feed →
              </Link>
            </div>

            {myReports.length === 0 ? (
              <Card className="p-8 text-center space-y-3 bg-slate-50/50">
                <p className="text-sm font-medium text-slate-700">You haven't submitted any community reports yet.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Notice a broken pipe, pothole, garbage dump, or dark street? Submit a report with optional Gemma 4 assistance.
                </p>
                <Link to="/create-report">
                  <Button size="sm">Create Your First Report</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {myReports.map((rep) => (
                  <Card key={rep.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={rep.status} />
                        <UrgencyBadge urgency={rep.user_confirmed_urgency} />
                      </div>
                      <Link to={`/reports/${rep.id}`} className="font-semibold text-slate-900 hover:text-teal-600 transition block text-sm">
                        {rep.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rep.approximate_public_location}</span>
                        <span>•</span>
                        <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link to={`/reports/${rep.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Followed Reports */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Reports You Are Following</h2>

            {followedReports.length === 0 ? (
              <Card className="p-6 text-center text-xs text-slate-500 bg-slate-50/50">
                Follow reports in your neighborhood to track municipal and volunteer repair progress.
              </Card>
            ) : (
              <div className="space-y-3">
                {followedReports.map((rep) => (
                  <Card key={rep.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={rep.status} />
                        <span className="text-xs font-semibold text-slate-900">{rep.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">{rep.approximate_public_location}</p>
                    </div>
                    <Link to={`/reports/${rep.id}`}>
                      <Button variant="outline" size="sm">Progress</Button>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Volunteer Commitments & Civic Actions */}
        <div className="space-y-6">
          
          {/* Volunteer Drives */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>Nearby Volunteer Drives</span>
              </h3>
              <Link to="/volunteers" className="text-xs text-teal-600 font-semibold hover:underline">
                Explore
              </Link>
            </div>

            <div className="space-y-3">
              {volunteerDrives.slice(0, 2).map((opp) => (
                <div key={opp.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-900">{opp.title}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {opp.capacity - opp.current_signups_count} spots
                    </span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.location}</span>
                  </div>
                  <Link to="/volunteers" className="block text-teal-700 font-semibold pt-1">
                    Sign up or view schedule →
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Guidance Box */}
          <Card className="p-5 bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200 space-y-2 text-xs text-teal-950">
            <div className="flex items-center gap-1.5 font-bold text-teal-900">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Civic Problem Solving Tip</span>
            </div>
            <p className="leading-relaxed text-slate-700">
              When reporting, take a clear photo of the problem and note specific cross-streets. 
              Gemma 4 will auto-detect the category and generate Hindi & Odia translations for maximum community reach.
            </p>
          </Card>

        </div>

      </div>

    </div>
  );
};

