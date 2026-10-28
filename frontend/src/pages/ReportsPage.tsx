import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Map as MapIcon, 
  List, 
  PlusCircle, 
  Clock, 
  MessageSquare, 
  Heart, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge, UrgencyBadge } from '../components/ui/Badge';
import { ReportMap } from '../components/reports/ReportMap';
import { useAuth } from '../app/providers';
import { apiClient } from '../lib/api-client';
import { ReportItem, ReportCategory, ReportStatus } from '../types';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getReports({
        category: categoryFilter,
        status: statusFilter,
        search: searchTerm,
      });
      setReports(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const handleToggleFollow = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const isFollowed = !r.is_followed_by_user;
          return {
            ...r,
            is_followed_by_user: isFollowed,
            follows_count: isFollowed ? r.follows_count + 1 : Math.max(0, r.follows_count - 1),
          };
        }
        return r;
      })
    );
  };

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Issues' },
    { key: 'sanitation', label: 'Sanitation' },
    { key: 'roads', label: 'Roads & Potholes' },
    { key: 'water', label: 'Water Supply' },
    { key: 'electricity', label: 'Electricity' },
    { key: 'accessibility', label: 'Accessibility' },
    { key: 'parks', label: 'Parks & Spaces' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Community Reports Feed
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, and monitor local civic infrastructure concerns reported by citizens
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>

          <Link to="/create-report">
            <Button size="md">
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports by title, description, or landmark..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="md">Search</Button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategoryFilter(c.key)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition border ${
                categoryFilter === c.key
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="space-y-3">
          <ReportMap reports={reports} height="480px" />
          <p className="text-[11px] text-slate-500 text-center">
            Pins display approximate public coordinates for reported sanitation, road, and water issues. Click any pin to open details.
          </p>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {reports.length === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <h3 className="text-base font-bold text-slate-800">No reports found matching your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search terms or selecting a different category filter.
              </p>
              <Button onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); setSearchTerm(''); fetchReports(); }} variant="outline" size="sm">
                Reset Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((rep) => (
                <Card key={rep.id} className="flex flex-col hover:border-teal-300 transition-colors">
                  
                  {/* Image preview if present */}
                  {rep.images && rep.images.length > 0 && (
                    <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={rep.images[0]}
                        alt={rep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {rep.ai_structured && (
                        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-semibold text-teal-800 border border-teal-200 flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          <span>Gemma 4</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-5 flex-1 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={rep.status} />
                      <UrgencyBadge urgency={rep.user_confirmed_urgency} />
                    </div>

                    <Link to={`/reports/${rep.id}`} className="block group">
                      <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 text-base">
                        {rep.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {rep.current_description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{rep.approximate_public_location}</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleFollow(rep.id)}
                        className={`flex items-center gap-1 transition ${
                          rep.is_followed_by_user ? 'text-teal-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Follow updates"
                      >
                        <Heart className={`w-3.5 h-3.5 ${rep.is_followed_by_user ? 'fill-teal-600 text-teal-600' : ''}`} />
                        <span>{rep.follows_count}</span>
                      </button>

                      <div className="flex items-center gap-1 text-slate-500">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{rep.comments_count}</span>
                      </div>
                    </div>

                    <Link
                      to={`/reports/${rep.id}`}
                      className="font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </Card>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
};

