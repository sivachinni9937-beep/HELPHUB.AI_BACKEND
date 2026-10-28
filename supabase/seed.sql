-- HelpHub AI — Community Problem Solver Seed Data
-- Realistic demo data labeled clearly as demonstration dataset

-- 1. DEMO PROFILES (UUIDs represent demo users)
INSERT INTO public.profiles (id, display_name, role, preferred_language, broad_location, bio, volunteer_interests)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Aarav Sharma', 'citizen', 'en', 'Bhubaneswar, Odisha', 'College student passionate about clean streets and green spaces.', ARRAY['sanitation', 'parks']),
    ('00000000-0000-0000-0000-000000000002', 'Priya Patel', 'volunteer', 'hi', 'Mumbai, Maharashtra', 'Active youth volunteer for civic infrastructure and accessibility.', ARRAY['accessibility', 'roads', 'water']),
    ('00000000-0000-0000-0000-000000000003', 'Dr. Rajesh Das', 'organizer', 'or', 'Cuttack, Odisha', 'Coordinator at Odisha Urban Care Foundation.', ARRAY['sanitation', 'water', 'parks']),
    ('00000000-0000-0000-0000-000000000004', 'Anita Rao', 'moderator', 'en', 'Bengaluru, Karnataka', 'Civic tech enthusiast maintaining community guidelines.', ARRAY['accessibility', 'electricity']),
    ('00000000-0000-0000-0000-000000000005', 'HelpHub Admin', 'admin', 'en', 'New Delhi', 'Platform administrator ensuring system health.', ARRAY['sanitation', 'roads', 'water', 'electricity', 'accessibility', 'parks'])
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;

-- 2. DEMO ORGANIZATIONS
INSERT INTO public.organizations (id, name, description, contact_email, website, verification_status)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'Odisha Urban Care Foundation', 'Grassroots NGO focusing on community sanitation, park revitalization, and clean public drainage.', 'contact@odishaurbancare.org', 'https://odishaurbancare.org', 'verified')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.organization_members (organization_id, user_id, membership_role, membership_status)
VALUES 
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'admin', 'active')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 3. DEMO REPORTS (Multi-category, multilingual: EN, HI, OR)
INSERT INTO public.reports (
    id, creator_id, title, original_description, current_description, category, user_confirmed_urgency,
    status, resolution_type, latitude, longitude, approximate_public_location, preferred_language, ai_structured, translations, created_at
)
VALUES 
    (
        '20000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'Garbage accumulation near Patia College Bus Stop',
        'Heavy waste dump piling up for 5 days near the student waiting shed, blocking sidewalk access and attracting stray animals.',
        'Heavy waste dump piling up for 5 days near the student waiting shed, blocking sidewalk access and attracting stray animals.',
        'sanitation',
        'high',
        'in_progress',
        NULL,
        20.3533,
        85.8195,
        'Patia Square near College Gate, Bhubaneswar',
        'en',
        true,
        '{"en": "Garbage accumulation near Patia College Bus Stop", "hi": "पाटिया कॉलेज बस स्टॉप के पास कचरे का ढेर", "or": "ପଟିଆ କଲେଜ ବସ୍ ଷ୍ଟପ୍ ନିକଟରେ ଅଳିଆ ଆବର୍ଜନା ଜମା ହୋଇଛି"}'::jsonb,
        NOW() - INTERVAL '3 days'
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000002',
        'Broken Streetlights causing hazards in Saheed Nagar 4th Lane',
        'Three consecutive pole lamps are non-functional for past two weeks making the junction dangerous for night commuters and pedestrians.',
        'Three consecutive pole lamps are non-functional for past two weeks making the junction dangerous for night commuters and pedestrians.',
        'electricity',
        'medium',
        'open',
        NULL,
        20.2917,
        85.8456,
        '4th Lane Crossing, Saheed Nagar, Bhubaneswar',
        'en',
        true,
        '{"en": "Broken Streetlights in Saheed Nagar", "hi": "शहीद नगर में खराब स्ट्रीट लाइटें", "or": "ସହିଦ ନଗରରେ ଷ୍ଟ୍ରିଟ୍ ଲାଇଟ୍ ଖରାପ ଅଛି"}'::jsonb,
        NOW() - INTERVAL '5 days'
    ),
    (
        '20000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000001',
        'Public drinking water pipe burst flooding road near Unit-2 Market',
        'Potable water pipeline rupture wasting hundreds of liters per hour and creating deep slush on commercial road.',
        'Potable water pipeline rupture wasting hundreds of liters per hour and creating deep slush on commercial road.',
        'water',
        'critical',
        'resolved',
        'community_solution_reported',
        20.2681,
        85.8369,
        'Unit-2 Market Road, Bhubaneswar',
        'en',
        true,
        '{"en": "Drinking water pipe burst near Unit-2", "hi": "यूनिट-2 के पास पानी की पाइपलाइन फटी", "or": "ୟୁନିଟ୍-୨ ନିକଟରେ ଜଳ ପାଇପ୍ ଫାଟିଯାଇଛି"}'::jsonb,
        NOW() - INTERVAL '10 days'
    ),
    (
        '20000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000002',
        'Damaged Wheelchair Ramp at Government Health Dispensary',
        'The ramp entrance is cracked with high slope edge preventing senior citizens and persons with disability from safely entering.',
        'The ramp entrance is cracked with high slope edge preventing senior citizens and persons with disability from safely entering.',
        'accessibility',
        'high',
        'open',
        NULL,
        20.2458,
        85.8234,
        'Old Town Dispensary, Bhubaneswar',
        'en',
        true,
        '{"en": "Damaged Wheelchair Ramp at Health Dispensary", "hi": "स्वास्थ्य औषधालय में टूटी व्हीलचेयर रैंप", "or": "ସ୍ୱାସ୍ଥ୍ୟ ଡିସପେନସାରୀରେ ଭଙ୍ଗା ହୁଇଲଚେୟାର ରାମ୍ପ"}'::jsonb,
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. STATUS HISTORY
INSERT INTO public.report_status_history (report_id, actor_id, previous_status, new_status, reason, created_at)
VALUES 
    (
        '20000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000003',
        'open',
        'in_progress',
        'Odisha Urban Care Foundation coordinated a volunteer clean-up drive and notified local ward sanitary inspector.',
        NOW() - INTERVAL '2 days'
    ),
    (
        '20000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000004',
        'in_progress',
        'resolved',
        'Water board emergency repair crew replaced the ruptured valve; street cleared by local shopkeepers association.',
        NOW() - INTERVAL '8 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 5. COMMENTS
INSERT INTO public.comments (id, report_id, author_id, content, moderation_status, created_at)
VALUES 
    (
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        'I pass this stop every morning. Happy to join a Saturday morning volunteer cleanup if safety gloves are provided!',
        'approved',
        NOW() - INTERVAL '2 days'
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000003',
        'Our NGO has scheduled a drive for this Saturday at 8 AM. We have 15 waste bags, safety gloves, and hand sanitizer ready.',
        'approved',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. VOLUNTEER OPPORTUNITIES
INSERT INTO public.volunteer_opportunities (
    id, organizer_id, organization_id, report_id, title, description, location,
    latitude, longitude, start_at, end_at, capacity, status, accessibility_notes, skills_needed
)
VALUES 
    (
        '40000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'Patia Bus Stop Clean-Up & Segregation Drive',
        'Join local residents and university volunteers to clear accumulated waste, segregate plastics for recycling, and plant saplings.',
        'Patia Square, Bhubaneswar',
        20.3533,
        85.8195,
        NOW() + INTERVAL '3 days',
        NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
        25,
        'open',
        'Ground is mostly level; sitting benches available for resting. Gloves provided.',
        ARRAY['waste segregation', 'teamwork', 'gardening']
    ),
    (
        '40000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000003',
        'Dispensary Ramp Safety Assessment & Painting',
        'Survey accessibility ramps in Old Town healthcare centers and apply high-contrast non-slip safety paint along edges.',
        'Old Town Health Center, Bhubaneswar',
        20.2458,
        85.8234,
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '7 days' + INTERVAL '4 hours',
        10,
        'open',
        'Wheelchair accessible facility; indoor and outdoor work available.',
        ARRAY['measuring', 'painting', 'accessibility audit']
    )
ON CONFLICT (id) DO NOTHING;

-- 7. VOLUNTEER SIGNUPS
INSERT INTO public.volunteer_signups (id, opportunity_id, volunteer_id, participation_status, notes)
VALUES 
    (
        '50000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        'registered',
        'Excited to help with plastics sorting.'
    )
ON CONFLICT (opportunity_id, volunteer_id) DO NOTHING;

-- 8. FOLLOWS
INSERT INTO public.report_follows (user_id, report_id)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001')
ON CONFLICT (user_id, report_id) DO NOTHING;

-- 9. NOTIFICATIONS
INSERT INTO public.notifications (recipient_id, notification_type, title, message, related_entity_type, related_entity_id)
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        'status_change',
        'Report In Progress',
        'Your report "Garbage accumulation near Patia College Bus Stop" was updated to In Progress by Odisha Urban Care Foundation.',
        'report',
        '20000000-0000-0000-0000-000000000001'
    )
ON CONFLICT (id) DO NOTHING;

