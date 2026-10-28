export type UserRole = 'guest' | 'citizen' | 'volunteer' | 'organizer' | 'moderator' | 'admin';

export type ReportCategory = 
  | 'sanitation' 
  | 'roads' 
  | 'water' 
  | 'electricity' 
  | 'accessibility' 
  | 'parks' 
  | 'other';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus = 'open' | 'in_progress' | 'resolved' | 'reopened' | 'rejected';

export type ResolutionType = 'community_solution_reported' | 'officially_resolved';

export interface UserProfile {
  id: string;
  email?: string;
  display_name: string;
  role: UserRole;
  preferred_language: 'en' | 'hi' | 'or';
  avatar_path?: string;
  broad_location?: string;
  bio?: string;
  volunteer_interests?: string[];
}

export interface StatusHistoryItem {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  previous_status: ReportStatus;
  new_status: ReportStatus;
  reason?: string;
  created_at: string;
}

export interface ReportItem {
  id: string;
  creator: {
    id: string;
    display_name: string;
    role: UserRole;
    avatar_path?: string;
  };
  title: string;
  original_description: string;
  current_description: string;
  category: ReportCategory;
  user_confirmed_urgency: UrgencyLevel;
  status: ReportStatus;
  resolution_type?: ResolutionType;
  approximate_public_location: string;
  latitude?: number;
  longitude?: number;
  preferred_language: string;
  ai_structured: boolean;
  translations?: Record<string, string>;
  images: string[];
  follows_count: number;
  comments_count: number;
  is_followed_by_user?: boolean;
  status_history: StatusHistoryItem[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface CommentItem {
  id: string;
  report_id: string;
  author: {
    id: string;
    display_name: string;
    role: UserRole;
    avatar_path?: string;
  };
  parent_comment_id?: string;
  content: string;
  moderation_status: 'approved' | 'pending_review' | 'hidden' | 'flagged';
  created_at: string;
  updated_at: string;
}

export interface VolunteerParticipant {
  id: string;
  display_name: string;
  role: string;
  participation_status: string;
  signed_up_at: string;
}

export interface VolunteerOpportunity {
  id: string;
  organizer_id: string;
  organizer_name: string;
  organization_name?: string;
  report_id?: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  start_at: string;
  end_at: string;
  capacity: number;
  current_signups_count: number;
  is_signed_up_by_user?: boolean;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  accessibility_notes?: string;
  skills_needed: string[];
  created_at: string;
  participants?: VolunteerParticipant[];
}

export interface InAppNotification {
  id: string;
  recipient_id: string;
  notification_type: string;
  title: string;
  message: string;
  related_entity_type: string;
  related_entity_id: string;
  read_at?: string;
  created_at: string;
}

export interface AIStructureResult {
  suggested_title: string;
  suggested_category: ReportCategory;
  suggested_urgency: UrgencyLevel;
  urgency_reasoning: string;
  summary: string;
  detected_language: string;
  translations: Record<string, string>;
  recommended_next_steps: string[];
  is_advisory_only: boolean;
  model_identifier: string;
}

export interface AIDiscussionSummary {
  summary: string;
  main_concerns: string[];
  proposed_solutions: string[];
  open_questions: string[];
  comments_analyzed: number;
  is_ai_generated: boolean;
  model_identifier: string;
}

export interface AIComplaintLetter {
  draft_letter: string;
  subject_line: string;
  language: string;
  recipient_authority: string;
  is_draft: boolean;
  filing_disclaimer: string;
  model_identifier: string;
}

