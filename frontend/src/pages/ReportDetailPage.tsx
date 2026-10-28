import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  Heart, 
  MessageSquare, 
  Share2, 
  ShieldAlert, 
  Sparkles, 
  Languages, 
  FileText, 
  Send,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge, UrgencyBadge, RoleBadge, AiBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ComplaintLetterModal } from '../components/ai/ComplaintLetterModal';
import { ReportMap } from '../components/reports/ReportMap';
import { useAuth } from '../app/providers';
import { apiClient } from '../lib/api-client';
import { ReportItem, CommentItem, ReportStatus, AIDiscussionSummary } from '../types';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [report, setReport] = useState<ReportItem | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Status transition state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ReportStatus>('in_progress');
  const [statusReason, setStatusReason] = useState('');
  const [resolutionType, setResolutionType] = useState<'community_solution_reported' | 'officially_resolved'>('community_solution_reported');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // AI Discussion Summary state
  const [aiSummary, setAiSummary] = useState<AIDiscussionSummary | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Complaint letter modal state
  const [letterModalOpen, setLetterModalOpen] = useState(false);

  // Abuse report modal state
  const [abuseModalOpen, setAbuseModalOpen] = useState(false);
  const [abuseReason, setAbuseReason] = useState('');
  const [abuseSubmitted, setAbuseSubmitted] = useState(false);

  const [activeTranslation, setActiveTranslation] = useState<'original' | 'en' | 'hi' | 'or'>('original');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const rep = await apiClient.getReportById(id);
      setReport(rep);
      
      // Load comments
      const demoComments: CommentItem[] = [
        {
          id: 'c1',
          report_id: id,
          author: { id: 'u2', display_name: 'Priya Patel', role: 'volunteer' },
          content: 'I pass by this area every morning on my way to college. Happy to join a community cleanup if we can organize gloves and trash bags.',
          moderation_status: 'approved',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'c2',
          report_id: id,
          author: { id: 'u3', display_name: 'Dr. Rajesh Das', role: 'organizer' },
          content: 'Our NGO has scheduled a volunteer drive for this Saturday. We have registered 15 bags and contacted the local ward sanitary supervisor.',
          moderation_status: 'approved',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        }
      ];
      setComments(demoComments);
    };
    loadData();
  }, [id]);

  if (!report) {
    return (
      <div className="text-center py-16 space-y-3">
        <h2 className="text-xl font-bold text-slate-800">Community Report Not Found</h2>
        <p className="text-xs text-slate-500">The requested report ID may have been removed or does not exist.</p>
        <Link to="/reports">
          <Button variant="outline" size="sm">Back to Reports Feed</Button>
        </Link>
      </div>
    );
  }

  const handleToggleFollow = () => {
    setReport((prev) => {
      if (!prev) return null;
      const nextFollow = !prev.is_followed_by_user;
      return {
        ...prev,
        is_followed_by_user: nextFollow,
        follows_count: nextFollow ? prev.follows_count + 1 : Math.max(0, prev.follows_count - 1),
      };
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setIsSubmittingComment(true);

    const commentItem: CommentItem = {
      id: `c-${Date.now()}`,
      report_id: report.id,
      author: {
        id: user.id,
        display_name: user.display_name,
        role: user.role,
      },
      content: newComment,
      moderation_status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setComments([...comments, commentItem]);
    setNewComment('');
    setIsSubmittingComment(false);
  };

  const handleSummarizeComments = async () => {
    setIsSummarizing(true);
    try {
      const texts = comments.map((c) => `${c.author.display_name}: ${c.content}`);
      const summary = await apiClient.summarizeDiscussion(report.title, texts);
      setAiSummary(summary);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleStatusTransition = async () => {
    if (!statusReason.trim()) return;
    setIsUpdatingStatus(true);
    try {
      const now = new Date().toISOString();
      const newHistoryItem = {
        id: `hist-${Date.now()}`,
        actor_id: user?.id || 'sys',
        actor_name: user?.display_name || 'Community Member',
        actor_role: user?.role || 'organizer',
        previous_status: report.status,
        new_status: targetStatus,
        reason: statusReason,
        created_at: now,
      };

      setReport({
        ...report,
        status: targetStatus,
        resolution_type: targetStatus === 'resolved' ? resolutionType : undefined,
        status_history: [...report.status_history, newHistoryItem],
        resolved_at: targetStatus === 'resolved' ? now : undefined,
      });

      setStatusModalOpen(false);
      setStatusReason('');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReportAbuse = () => {
    setAbuseSubmitted(true);
    setTimeout(() => {
      setAbuseSubmitted(false);
      setAbuseModalOpen(false);
      setAbuseReason('');
    }, 2000);
  };

  // Determine displayed text based on translation tab
  const displayedTitle = 
    activeTranslation !== 'original' && report.translations?.[activeTranslation]
      ? report.translations[activeTranslation]
      : report.title;

  const canTransitionStatus = user && (user.role === 'organizer' || user.role === 'moderator' || user.role === 'admin');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Back breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link to="/reports" className="hover:text-teal-600 font-medium">
          ← Back to Reports Feed
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
          <button
            onClick={() => setAbuseModalOpen(true)}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50"
            title="Report abuse or violation"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Main Report Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        
        {/* Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <UrgencyBadge urgency={report.user_confirmed_urgency} />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 uppercase tracking-wide">
              {report.category}
            </span>
            {report.ai_structured && <AiBadge />}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleFollow}
              variant={report.is_followed_by_user ? 'primary' : 'outline'}
              size="sm"
            >
              <Heart className={`w-3.5 h-3.5 ${report.is_followed_by_user ? 'fill-white' : ''}`} />
              <span>{report.is_followed_by_user ? 'Following' : 'Follow'}</span>
              <span className="ml-1 opacity-75">({report.follows_count})</span>
            </Button>

            {canTransitionStatus && (
              <Button onClick={() => setStatusModalOpen(true)} variant="secondary" size="sm">
                <span>Update Status</span>
              </Button>
            )}
          </div>
        </div>

        {/* Translation Switcher */}
        {report.translations && Object.keys(report.translations).length > 0 && (
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Languages className="w-4 h-4 text-teal-600" />
              <span>Read report in:</span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveTranslation('original')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${activeTranslation === 'original' ? 'bg-teal-600 text-white' : 'bg-white border text-slate-700'}`}
              >
                Original
              </button>
              {report.translations.en && (
                <button
                  onClick={() => setActiveTranslation('en')}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${activeTranslation === 'en' ? 'bg-teal-600 text-white' : 'bg-white border text-slate-700'}`}
                >
                  English
                </button>
              )}
              {report.translations.hi && (
                <button
                  onClick={() => setActiveTranslation('hi')}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${activeTranslation === 'hi' ? 'bg-teal-600 text-white' : 'bg-white border text-slate-700'}`}
                >
                  हिन्दी
                </button>
              )}
              {report.translations.or && (
                <button
                  onClick={() => setActiveTranslation('or')}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${activeTranslation === 'or' ? 'bg-teal-600 text-white' : 'bg-white border text-slate-700'}`}
                >
                  ଓଡ଼ିଆ
                </button>
              )}
            </div>
          </div>
        )}

        {/* Title & Author */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {displayedTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">{report.creator.display_name}</span>
              <RoleBadge role={report.creator.role} />
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Reported {new Date(report.created_at).toLocaleDateString()}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{report.approximate_public_location}</span>
            </div>
          </div>
        </div>

        {/* Full Problem Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Original Citizen Description</h3>
          <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {report.current_description}
          </p>
        </div>

        {/* Photos if attached */}
        {report.images && report.images.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reported Photos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.images.map((img, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 h-64 bg-slate-100">
                  <img src={img} alt="Community issue photo" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Location */}
        {report.latitude && report.longitude && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approximate Issue Location</h3>
            <ReportMap reports={[report]} height="250px" />
          </div>
        )}

        {/* AI Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <Button onClick={() => setLetterModalOpen(true)} variant="outline" size="sm">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Draft Formal Complaint Letter (Gemma 4)</span>
          </Button>

          <Button onClick={handleSummarizeComments} isLoading={isSummarizing} variant="secondary" size="sm">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Summarize Discussions</span>
          </Button>
        </div>

      </Card>

      {/* AI Discussion Summary Box */}
      {aiSummary && (
        <Card className="p-6 bg-gradient-to-br from-teal-50/70 to-blue-50/50 border-teal-200 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Gemma 4 Community Discussion Summary</h3>
            </div>
            <span className="text-[11px] font-mono text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
              {aiSummary.model_identifier}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            {aiSummary.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Main Concerns:</span>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {aiSummary.main_concerns.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">Proposed Community Actions:</span>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {aiSummary.proposed_solutions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Append-Only Status Transition History */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Status History & Verification Timeline</span>
        </h3>

        {report.status_history.length === 0 ? (
          <p className="text-xs text-slate-500">Report is currently awaiting initial volunteer or municipal coordination.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {report.status_history.map((hist) => (
              <div key={hist.id} className="relative space-y-1 text-xs">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-teal-600 ring-4 ring-white" />
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={hist.new_status} />
                  <span className="font-semibold text-slate-900">{hist.actor_name}</span>
                  <span className="text-slate-400">({hist.actor_role})</span>
                  <span>•</span>
                  <span className="text-slate-500">{new Date(hist.created_at).toLocaleString()}</span>
                </div>
                {hist.reason && (
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1">
                    "{hist.reason}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Discussion & Comments */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">Community Discussion</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {comments.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Respectful civic engagement guidelines apply</span>
        </div>

        {/* Comments Feed */}
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{c.author.display_name}</span>
                  <RoleBadge role={c.author.role} />
                </div>
                <span className="text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm">{c.content}</p>
            </div>
          ))}
        </div>

        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleAddComment} className="space-y-3 pt-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Contribute constructively: share updates, offer volunteer tools, or propose solutions..."
              rows={3}
              required
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSubmittingComment} size="sm">
                <Send className="w-3.5 h-3.5" />
                <span>Post Comment</span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-600 space-y-2">
            <p>Please sign in or choose a demo role from the top navigation to participate in community discussions.</p>
            <Link to="/login">
              <Button size="sm">Sign In to Comment</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Status Transition Modal */}
      <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Report Status">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Record a transparent status transition. All updates are logged in the audit history with your name and role.
          </p>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">New Status</label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as ReportStatus)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="in_progress">In Progress (Work started)</option>
              <option value="resolved">Resolved (Problem fixed)</option>
              <option value="reopened">Reopened (Issue recurred)</option>
              <option value="rejected">Rejected (Out of scope / duplicate)</option>
            </select>
          </div>

          {targetStatus === 'resolved' && (
            <div className="space-y-1.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <label className="block font-semibold text-emerald-950">Resolution Verification Type</label>
              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="resolutionType"
                    checked={resolutionType === 'community_solution_reported'}
                    onChange={() => setResolutionType('community_solution_reported')}
                  />
                  <span>Community Solution Reported (Fixed by volunteers/residents)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="resolutionType"
                    checked={resolutionType === 'officially_resolved'}
                    onChange={() => setResolutionType('officially_resolved')}
                  />
                  <span>Officially Resolved (Verified by municipal crew / authority)</span>
                </label>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Reason / Update Notes *</label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="E.g., Local volunteer team collected 8 bags of waste; municipal truck hauled it to recycling facility."
              rows={3}
              required
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button onClick={() => setStatusModalOpen(false)} variant="outline" size="sm">Cancel</Button>
            <Button onClick={handleStatusTransition} isLoading={isUpdatingStatus} size="sm">
              Confirm Status Change
            </Button>
          </div>
        </div>
      </Modal>

      {/* Complaint Letter Modal */}
      <ComplaintLetterModal
        isOpen={letterModalOpen}
        onClose={() => setLetterModalOpen(false)}
        report={report}
      />

      {/* Abuse Report Modal */}
      <Modal isOpen={abuseModalOpen} onClose={() => setAbuseModalOpen(false)} title="Report Inappropriate Content">
        <div className="space-y-4 text-xs">
          {abuseSubmitted ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="font-bold">Abuse report submitted</p>
              <p className="text-[11px]">Community moderators will review this item promptly.</p>
            </div>
          ) : (
            <>
              <p className="text-slate-600 leading-relaxed">
                Help us keep HelpHub AI safe, respectful, and constructive. Explain what violates our community guidelines:
              </p>
              <textarea
                value={abuseReason}
                onChange={(e) => setAbuseReason(e.target.value)}
                placeholder="E.g., Abusive language, false claims, or private information disclosed..."
                rows={4}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={() => setAbuseModalOpen(false)} variant="outline" size="sm">Cancel</Button>
                <Button onClick={handleReportAbuse} variant="danger" size="sm">Submit Report</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

    </div>
  );
};

