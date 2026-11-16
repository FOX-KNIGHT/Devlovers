-- Migration 0004: Supabase Row Level Security (RLS) Policies
-- Enables RLS across all 18 tables with granular security rules

-- 1. Helper Functions
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.users
  WHERE external_auth_id = auth.uid()::text OR id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE (external_auth_id = auth.uid()::text OR id = auth.uid())
      AND role = 'ADMIN'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_judge()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE (external_auth_id = auth.uid()::text OR id = auth.uid())
      AND role IN ('JUDGE', 'ADMIN')
  );
$$;

-- ==============================================================================
-- 2. ENABLE ROW LEVEL SECURITY ON ALL 18 TABLES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_registrations ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. POLICIES: USERS
-- ==============================================================================
CREATE POLICY "users_public_read" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "users_self_insert" ON public.users
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      external_auth_id = auth.uid()::text OR id = auth.uid()
    )
  );

CREATE POLICY "users_self_update" ON public.users
  FOR UPDATE USING (
    external_auth_id = auth.uid()::text OR id = auth.uid() OR public.is_admin()
  );

-- ==============================================================================
-- 4. POLICIES: HACKATHONS
-- ==============================================================================
CREATE POLICY "hackathons_public_read" ON public.hackathons
  FOR SELECT USING (
    status != 'DRAFT' OR public.is_admin()
  );

CREATE POLICY "hackathons_admin_host_insert" ON public.hackathons
  FOR INSERT WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.users
      WHERE (external_auth_id = auth.uid()::text OR id = auth.uid())
        AND role IN ('HOST', 'ADMIN')
    )
  );

CREATE POLICY "hackathons_admin_host_update" ON public.hackathons
  FOR UPDATE USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.users
      WHERE (external_auth_id = auth.uid()::text OR id = auth.uid())
        AND role IN ('HOST', 'ADMIN')
    )
  );

-- ==============================================================================
-- 5. POLICIES: TRACKS
-- ==============================================================================
CREATE POLICY "tracks_public_read" ON public.tracks
  FOR SELECT USING (true);

CREATE POLICY "tracks_admin_insert" ON public.tracks
  FOR INSERT WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.users
      WHERE (external_auth_id = auth.uid()::text OR id = auth.uid())
        AND role IN ('HOST', 'ADMIN')
    )
  );

CREATE POLICY "tracks_admin_update" ON public.tracks
  FOR UPDATE USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.users
      WHERE (external_auth_id = auth.uid()::text OR id = auth.uid())
        AND role IN ('HOST', 'ADMIN')
    )
  );

-- ==============================================================================
-- 6. POLICIES: SQUADS
-- ==============================================================================
CREATE POLICY "squads_public_read" ON public.squads
  FOR SELECT USING (true);

CREATE POLICY "squads_auth_insert" ON public.squads
  FOR INSERT WITH CHECK (
    created_by = public.current_user_id() OR public.is_admin()
  );

CREATE POLICY "squads_leader_update" ON public.squads
  FOR UPDATE USING (
    created_by = public.current_user_id() OR public.is_admin() OR EXISTS (
      SELECT 1 FROM public.squad_members
      WHERE squad_id = squads.id AND user_id = public.current_user_id() AND role = 'LEAD'
    )
  );

-- ==============================================================================
-- 7. POLICIES: SQUAD MEMBERS
-- ==============================================================================
CREATE POLICY "squad_members_public_read" ON public.squad_members
  FOR SELECT USING (true);

CREATE POLICY "squad_members_join_insert" ON public.squad_members
  FOR INSERT WITH CHECK (
    user_id = public.current_user_id() OR public.is_admin() OR EXISTS (
      SELECT 1 FROM public.squads WHERE id = squad_id AND created_by = public.current_user_id()
    )
  );

CREATE POLICY "squad_members_leave_delete" ON public.squad_members
  FOR DELETE USING (
    user_id = public.current_user_id() OR public.is_admin() OR EXISTS (
      SELECT 1 FROM public.squads WHERE id = squad_id AND created_by = public.current_user_id()
    )
  );

-- ==============================================================================
-- 8. POLICIES: SUBMISSIONS
-- ==============================================================================
CREATE POLICY "submissions_read" ON public.submissions
  FOR SELECT USING (
    status != 'DRAFT' OR public.is_admin() OR public.is_judge() OR EXISTS (
      SELECT 1 FROM public.squad_members
      WHERE squad_id = submissions.squad_id AND user_id = public.current_user_id()
    )
  );

CREATE POLICY "submissions_squad_insert" ON public.submissions
  FOR INSERT WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.squad_members
      WHERE squad_id = submissions.squad_id AND user_id = public.current_user_id()
    )
  );

CREATE POLICY "submissions_squad_update" ON public.submissions
  FOR UPDATE USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.squad_members
      WHERE squad_id = submissions.squad_id AND user_id = public.current_user_id()
    )
  );

-- ==============================================================================
-- 9. POLICIES: EVALUATIONS (Blind Evaluation Support)
-- ==============================================================================
CREATE POLICY "evaluations_read" ON public.evaluations
  FOR SELECT USING (
    judge_id = public.current_user_id() OR public.is_admin() OR EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.hackathons h ON s.hackathon_id = h.id
      WHERE s.id = evaluations.submission_id AND h.status = 'FINISHED'
    )
  );

CREATE POLICY "evaluations_judge_insert" ON public.evaluations
  FOR INSERT WITH CHECK (
    (judge_id = public.current_user_id() AND public.is_judge()) OR public.is_admin()
  );

CREATE POLICY "evaluations_judge_update" ON public.evaluations
  FOR UPDATE USING (
    (judge_id = public.current_user_id() AND public.is_judge()) OR public.is_admin()
  );

-- ==============================================================================
-- 10. POLICIES: BOOKMARKS
-- ==============================================================================
CREATE POLICY "bookmarks_owner_select" ON public.bookmarks
  FOR SELECT USING (user_id = public.current_user_id() OR public.is_admin());

CREATE POLICY "bookmarks_owner_insert" ON public.bookmarks
  FOR INSERT WITH CHECK (user_id = public.current_user_id() OR public.is_admin());

CREATE POLICY "bookmarks_owner_delete" ON public.bookmarks
  FOR DELETE USING (user_id = public.current_user_id() OR public.is_admin());

-- ==============================================================================
-- 11. POLICIES: COMMENTS
-- ==============================================================================
CREATE POLICY "comments_public_read" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "comments_auth_insert" ON public.comments
  FOR INSERT WITH CHECK (user_id = public.current_user_id() OR public.is_admin());

CREATE POLICY "comments_owner_update" ON public.comments
  FOR UPDATE USING (user_id = public.current_user_id() OR public.is_admin());

CREATE POLICY "comments_owner_delete" ON public.comments
  FOR DELETE USING (user_id = public.current_user_id() OR public.is_admin());

-- ==============================================================================
-- 12. POLICIES: LIKES
-- ==============================================================================
CREATE POLICY "likes_public_read" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "likes_auth_insert" ON public.likes
  FOR INSERT WITH CHECK (user_id = public.current_user_id() OR public.is_admin());

CREATE POLICY "likes_auth_delete" ON public.likes
  FOR DELETE USING (user_id = public.current_user_id() OR public.is_admin());

-- ==============================================================================
-- 13. POLICIES: SPONSOR CREDITS
-- ==============================================================================
CREATE POLICY "sponsor_credits_read" ON public.sponsor_credits
  FOR SELECT USING (true);

CREATE POLICY "sponsor_credits_claim_update" ON public.sponsor_credits
  FOR UPDATE USING (
    public.is_admin() OR (claimed_by IS NULL OR claimed_by = public.current_user_id())
  );

-- ==============================================================================
-- 14. POLICIES: EVENTS (Analytics)
-- ==============================================================================
CREATE POLICY "events_insert_all" ON public.events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "events_admin_select" ON public.events
  FOR SELECT USING (public.is_admin());

-- ==============================================================================
-- 15. POLICIES: CONVERSATIONS & MEMBERS
-- ==============================================================================
CREATE POLICY "conversations_members_select" ON public.conversations
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = conversations.id AND user_id = public.current_user_id()
    )
  );

CREATE POLICY "conversations_auth_insert" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "conversation_members_select" ON public.conversation_members
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
        AND cm.user_id = public.current_user_id()
    )
  );

CREATE POLICY "conversation_members_insert" ON public.conversation_members
  FOR INSERT WITH CHECK (
    public.is_admin() OR user_id = public.current_user_id() OR EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
        AND cm.user_id = public.current_user_id()
    )
  );

-- ==============================================================================
-- 16. POLICIES: MESSAGES
-- ==============================================================================
CREATE POLICY "messages_member_select" ON public.messages
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = messages.conversation_id AND user_id = public.current_user_id()
    )
  );

CREATE POLICY "messages_member_insert" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = public.current_user_id() AND (
      public.is_admin() OR EXISTS (
        SELECT 1 FROM public.conversation_members
        WHERE conversation_id = messages.conversation_id AND user_id = public.current_user_id()
      )
    )
  );

-- ==============================================================================
-- 17. POLICIES: AUDIT LOGS
-- ==============================================================================
CREATE POLICY "audit_logs_admin_select" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "audit_logs_auth_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ==============================================================================
-- 18. POLICIES: NOTIFICATIONS
-- ==============================================================================
CREATE POLICY "notifications_owner_select" ON public.notifications
  FOR SELECT USING (user_id = public.current_user_id() OR public.is_admin());

CREATE POLICY "notifications_owner_update" ON public.notifications
  FOR UPDATE USING (user_id = public.current_user_id() OR public.is_admin());

CREATE POLICY "notifications_owner_delete" ON public.notifications
  FOR DELETE USING (user_id = public.current_user_id() OR public.is_admin());

-- ==============================================================================
-- 19. POLICIES: HACKATHON REGISTRATIONS
-- ==============================================================================
CREATE POLICY "registrations_read" ON public.hackathon_registrations
  FOR SELECT USING (
    user_id = public.current_user_id() OR public.is_admin() OR EXISTS (
      SELECT 1 FROM public.hackathons h
      JOIN public.users u ON (u.external_auth_id = auth.uid()::text OR u.id = auth.uid())
      WHERE h.id = hackathon_registrations.hackathon_id AND u.role IN ('HOST', 'ADMIN')
    )
  );

CREATE POLICY "registrations_user_insert" ON public.hackathon_registrations
  FOR INSERT WITH CHECK (user_id = public.current_user_id() OR public.is_admin());

CREATE POLICY "registrations_user_delete" ON public.hackathon_registrations
  FOR DELETE USING (user_id = public.current_user_id() OR public.is_admin());
