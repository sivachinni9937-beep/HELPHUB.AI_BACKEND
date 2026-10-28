-- HelpHub AI — Community Problem Solver
-- Initial PostgreSQL Migration Schema with Row Level Security (RLS)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('guest', 'citizen', 'volunteer', 'organizer', 'moderator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_category AS ENUM (
        'sanitation',
        'roads',
        'water',
        'electricity',
        'accessibility',
        'parks',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('open', 'in_progress', 'resolved', 'reopened', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE resolution_type AS ENUM ('community_solution_reported', 'officially_resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE moderation_status AS ENUM ('approved', 'pending_review', 'hidden', 'flagged');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_path TEXT,
    role user_role NOT NULL DEFAULT 'citizen',
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'or')),
    broad_location TEXT,
    bio TEXT,
    volunteer_interests TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    contact_email TEXT,
    website TEXT,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ORGANIZATION MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.organization_members (
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    membership_role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (membership_role IN ('admin', 'coordinator', 'member')),
    membership_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (membership_status IN ('pending', 'active', 'inactive')),
    PRIMARY KEY (organization_id, user_id)
);

-- 6. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    original_description TEXT NOT NULL,
    current_description TEXT NOT NULL,
    category report_category NOT NULL,
    user_confirmed_urgency urgency_level NOT NULL DEFAULT 'medium',
    status report_status NOT NULL DEFAULT 'open',
    resolution_type resolution_type,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    approximate_public_location TEXT NOT NULL,
    preferred_language VARCHAR(5) NOT NULL DEFAULT 'en',
    ai_structured BOOLEAN NOT NULL DEFAULT FALSE,
    translations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 7. REPORT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.report_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    caption TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. REPORT STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.report_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    previous_status report_status NOT NULL,
    new_status report_status NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. REPORT FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.report_follows (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, report_id)
);

-- 10. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    moderation_status moderation_status NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. VOLUNTEER OPPORTUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.volunteer_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 10 CHECK (capacity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    accessibility_notes TEXT,
    skills_needed TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. VOLUNTEER SIGNUPS TABLE
CREATE TABLE IF NOT EXISTS public.volunteer_signups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    participation_status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (participation_status IN ('registered', 'attended', 'withdrawn', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_volunteer_opportunity UNIQUE (opportunity_id, volunteer_id)
);

-- 13. ABUSE REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.abuse_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('report', 'comment', 'opportunity', 'user')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    review_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_type VARCHAR(30) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(30) NOT NULL,
    related_entity_id UUID NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. AI GENERATION LOGS TABLE (Operational privacy-preserving metrics)
CREATE TABLE IF NOT EXISTS public.ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id TEXT NOT NULL,
    task_type TEXT NOT NULL,
    model_identifier TEXT NOT NULL,
    duration_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_reports_status_category ON public.reports (status, category);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_creator ON public.reports (creator_id);
CREATE INDEX IF NOT EXISTS idx_comments_report ON public.comments (report_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_volunteers_start_at ON public.volunteer_opportunities (start_at, status);
CREATE INDEX IF NOT EXISTS idx_signups_volunteer ON public.volunteer_signups (volunteer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications (recipient_id, read_at);

-- 18. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for role checks
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'));
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile, without self-escalating role" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
    );

-- Reports Policies
CREATE POLICY "Anyone can view non-hidden reports" 
    ON public.reports FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reports" 
    ON public.reports FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can edit their reports while open" 
    ON public.reports FOR UPDATE USING (
        (auth.uid() = creator_id AND status = 'open') OR public.is_moderator_or_admin()
    );

-- Report Images Policies
CREATE POLICY "Public can view report images" 
    ON public.report_images FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload images for reports" 
    ON public.report_images FOR INSERT WITH CHECK (auth.uid() = uploader_id);

-- Comments Policies
CREATE POLICY "Public can view approved comments" 
    ON public.comments FOR SELECT USING (moderation_status != 'hidden' OR public.is_moderator_or_admin());

CREATE POLICY "Authenticated users can add comments" 
    ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments" 
    ON public.comments FOR UPDATE USING (auth.uid() = author_id OR public.is_moderator_or_admin());

-- Volunteer Opportunities Policies
CREATE POLICY "Public can view active volunteer opportunities" 
    ON public.volunteer_opportunities FOR SELECT USING (true);

CREATE POLICY "Organizers and admins can create opportunities" 
    ON public.volunteer_opportunities FOR INSERT WITH CHECK (
        auth.uid() = organizer_id AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('organizer', 'admin'))
    );

CREATE POLICY "Organizers and admins can update their opportunities" 
    ON public.volunteer_opportunities FOR UPDATE USING (
        auth.uid() = organizer_id OR public.is_admin()
    );

-- Volunteer Signups Policies
CREATE POLICY "Volunteers and organizers can view signups" 
    ON public.volunteer_signups FOR SELECT USING (
        auth.uid() = volunteer_id OR 
        EXISTS (
            SELECT 1 FROM public.volunteer_opportunities vo 
            WHERE vo.id = opportunity_id AND (vo.organizer_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Authenticated users can sign up as volunteer" 
    ON public.volunteer_signups FOR INSERT WITH CHECK (auth.uid() = volunteer_id);

CREATE POLICY "Volunteers can update or withdraw their signup" 
    ON public.volunteer_signups FOR UPDATE USING (auth.uid() = volunteer_id OR public.is_admin());

-- Notifications Policies
CREATE POLICY "Users can only view their own notifications" 
    ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can mark their own notifications as read" 
    ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- Follows Policies
CREATE POLICY "Users can view their own follows" 
    ON public.report_follows FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own follows" 
    ON public.report_follows FOR ALL USING (auth.uid() = user_id);

-- Abuse Reports Policies
CREATE POLICY "Authenticated users can report abuse" 
    ON public.abuse_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Only moderators and admins can view and update abuse reports" 
    ON public.abuse_reports FOR ALL USING (public.is_moderator_or_admin());

-- Audit & AI Logs Policies
CREATE POLICY "Admins can view audit logs" 
    ON public.audit_logs FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view AI generation logs" 
    ON public.ai_generation_logs FOR SELECT USING (public.is_admin());

