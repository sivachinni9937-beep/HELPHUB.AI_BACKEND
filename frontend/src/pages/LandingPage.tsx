import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  ArrowRight, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Languages, 
  FileCheck2, 
  MapPin, 
  Calendar, 
  HeartHandshake, 
  TrendingUp,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { StatusBadge, UrgencyBadge } from '../components/ui/Badge';
import { useAuth } from '../app/providers';
import { getTranslation } from '../lib/i18n';
import { apiClient } from '../lib/api-client';
import { ReportItem, VolunteerOpportunity } from '../types';

export const LandingPage: React.FC = () => {
  const { language } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [stats, setStats] = useState({
    totalReports: 4,
    resolvedReports: 1,
    activeVolunteers: 9,
    drivesCount: 2,
  });

  useEffect(() => {
    const loadData = async () => {
      const rep = await apiClient.getReports();
      setReports(rep.slice(0, 3));
      const opp = apiClient.getLocalVolunteers();
      setOpportunities(opp.slice(0, 2));
      const totalVolunteers = opp.reduce((acc, curr) => acc + curr.current_signups_count, 0);
      setStats({
        totalReports: rep.length,
        resolvedReports: rep.filter((r) => r.status === 'resolved').length,
        activeVolunteers: totalVolunteers,
        drivesCount: opp.length,
      });
    };
    loadData();
  }, []);

  return (
    <div className="space-y-16 py-4">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-teal-900 via-teal-800 to-slate-900 text-white px-6 py-16 sm:px-12 sm:py-20 shadow-xl">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Civic Problem Solving with Local Gemma 4 AI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Report a problem.<br />
            Find a solution.<br />
            <span className="text-teal-300">Build a better community.</span>
          </h1>

          <p className="text-base sm:text-lg text-teal-100/90 leading-relaxed max-w-2xl mx-auto font-normal">
            A social-impact collaboration platform connecting citizens, college students, NGOs, and local volunteers to solve garbage, potholes, water leaks, and public accessibility challenges.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/create-report" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-teal-400 text-slate-950 hover:bg-teal-300 font-semibold shadow-lg">
                <span>{getTranslation(language, 'reportProblem')}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/volunteers" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-teal-300/40 text-teal-100 hover:bg-teal-700/50">
                <span>{getTranslation(language, 'findOpportunities')}</span>
              </Button>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-teal-200/80 border-t border-teal-700/50">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-300" />
              <span>Works without AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-teal-300" />
              <span>English • हिन्दी • ଓଡ଼ିଆ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>Transparent Status Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Impact Statistics */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Community Impact</h2>
            <p className="text-xs text-slate-500">Live platform metrics from authenticated civic submissions</p>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Seeded Demonstration Dataset
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-6 bg-gradient-to-b from-white to-teal-50/30">
            <span className="text-3xl font-extrabold text-teal-700">{stats.totalReports}</span>
            <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">Reports Logged</p>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-b from-white to-emerald-50/30">
            <span className="text-3xl font-extrabold text-emerald-700">{stats.resolvedReports}</span>
            <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">Issues Solved</p>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-b from-white to-blue-50/30">
            <span className="text-3xl font-extrabold text-blue-700">{stats.drivesCount}</span>
            <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">Volunteer Drives</p>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-b from-white to-purple-50/30">
            <span className="text-3xl font-extrabold text-purple-700">{stats.activeVolunteers}</span>
            <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">Volunteers Engaged</p>
          </Card>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section className="space-y-8 py-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How HelpHub Works</h2>
          <p className="text-sm text-slate-600">
            A transparent four-step cycle from community observation to verified resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-lg mb-4">
              1
            </div>
            <h3 className="font-semibold text-slate-900 mb-1.5">1. Report</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Describe the problem in your words. Gemma 4 helps structure categories and provides Hindi & Odia translations.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg mb-4">
              2
            </div>
            <h3 className="font-semibold text-slate-900 mb-1.5">2. Collaborate</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Neighbors, students, and NGOs discuss remediation in respectful threads and draft formal letters to ward officials.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-lg mb-4">
              3
            </div>
            <h3 className="font-semibold text-slate-900 mb-1.5">3. Mobilize</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              NGO organizers coordinate scheduled volunteer cleanups and accessibility improvement drives with safety gear.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-lg mb-4">
              4
            </div>
            <h3 className="font-semibold text-slate-900 mb-1.5">4. Resolve</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every status transition is audited. Community solutions and verified municipal outcomes are clearly distinguished.
            </p>
          </div>
        </div>
      </section>

      {/* Gemma 4 AI Civic Capabilities */}
      <section className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Local Gemma 4 Civic AI Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            AI that empowers citizens, never replaces accountability
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            HelpHub AI strictly complies with civic safety guidelines: it runs locally via Ollama, validates outputs through Pydantic, and never pretends to be a government official.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <FileCheck2 className="w-5 h-5 text-teal-400" />
            <h4 className="font-semibold text-sm">Complaint Structuring</h4>
            <p className="text-xs text-slate-400">
              Transforms unstructured complaints into concise categories, advisory urgencies, and clear next steps.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <Languages className="w-5 h-5 text-teal-400" />
            <h4 className="font-semibold text-sm">Multilingual Bridges</h4>
            <p className="text-xs text-slate-400">
              Preserves facts, numbers, and names across English, Hindi, and Odia to make civic action inclusive.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <Users className="w-5 h-5 text-teal-400" />
            <h4 className="font-semibold text-sm">Discussion Summaries</h4>
            <p className="text-xs text-slate-400">
              Distills active community comments into main concerns, proposed fixes, and questions without hallucinated votes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <h4 className="font-semibold text-sm">Complaint Letter Drafts</h4>
            <p className="text-xs text-slate-400">
              Drafts polite, formal letters to municipal ward officers ready for the citizen to copy, verify, and submit.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Public Reports */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Community Reports</h2>
            <p className="text-xs text-slate-500">Public problems awaiting action or undergoing community resolution</p>
          </div>
          <Link to="/reports" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reports.map((rep) => (
            <Card key={rep.id} className="flex flex-col">
              <div className="p-5 flex-1 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={rep.status} />
                  <UrgencyBadge urgency={rep.user_confirmed_urgency} />
                </div>
                <Link to={`/reports/${rep.id}`} className="block group">
                  <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {rep.title}
                  </h3>
                </Link>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {rep.current_description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{rep.approximate_public_location}</span>
                </div>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>By {rep.creator.display_name}</span>
                <Link to={`/reports/${rep.id}`} className="font-semibold text-teal-600 hover:text-teal-700">
                  Details & Discussion →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Volunteer Opportunities */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Volunteer Drives Nearby</h2>
            <p className="text-xs text-slate-500">Hands-on neighborhood drives organized by local NGOs and community groups</p>
          </div>
          <Link to="/volunteers" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            <span>View All Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{opp.title}</h3>
                  <p className="text-xs text-teal-700 font-medium mt-0.5">{opp.organization_name || opp.organizer_name}</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {opp.capacity - opp.current_signups_count} spots left
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {opp.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{opp.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(opp.start_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="flex gap-1.5">
                  {opp.skills_needed.slice(0, 2).map((s) => (
                    <span key={s} className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">
                      {s}
                    </span>
                  ))}
                </div>
                <Link to="/volunteers">
                  <Button size="sm">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>View & Join</span>
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
};
