-- LogiTrack Row Level Security (RLS) Policies
-- Secure data access based on user roles and ownership

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consignment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.netsuite_sync_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Check if user is admin/operator
-- ============================================
CREATE OR REPLACE FUNCTION is_admin_or_operator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'operator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================
-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- Admins/Operators can view all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles 
  FOR SELECT USING (is_admin_or_operator());

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "profiles_update_admin" ON public.profiles 
  FOR UPDATE USING (is_admin());

-- Only allow insert via trigger (handle_new_user)
CREATE POLICY "profiles_insert_trigger" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- COMPANIES POLICIES
-- ============================================
-- All authenticated users can view companies
CREATE POLICY "companies_select_all" ON public.companies 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins/operators can manage companies
CREATE POLICY "companies_insert_admin" ON public.companies 
  FOR INSERT WITH CHECK (is_admin_or_operator());

CREATE POLICY "companies_update_admin" ON public.companies 
  FOR UPDATE USING (is_admin_or_operator());

CREATE POLICY "companies_delete_admin" ON public.companies 
  FOR DELETE USING (is_admin());

-- ============================================
-- TRUCKS POLICIES
-- ============================================
-- All authenticated users can view trucks
CREATE POLICY "trucks_select_all" ON public.trucks 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins/operators can manage trucks
CREATE POLICY "trucks_insert_admin" ON public.trucks 
  FOR INSERT WITH CHECK (is_admin_or_operator());

CREATE POLICY "trucks_update_admin" ON public.trucks 
  FOR UPDATE USING (is_admin_or_operator());

-- Drivers can update their assigned truck location
CREATE POLICY "trucks_update_driver" ON public.trucks 
  FOR UPDATE USING (driver_id = auth.uid());

CREATE POLICY "trucks_delete_admin" ON public.trucks 
  FOR DELETE USING (is_admin());

-- ============================================
-- CONSIGNMENTS POLICIES
-- ============================================
-- Admins/Operators can view all consignments
CREATE POLICY "consignments_select_admin" ON public.consignments 
  FOR SELECT USING (is_admin_or_operator());

-- Customers can view their own consignments (sender or receiver)
CREATE POLICY "consignments_select_customer" ON public.consignments 
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid()
  );

-- Drivers can view consignments assigned to their truck
CREATE POLICY "consignments_select_driver" ON public.consignments 
  FOR SELECT USING (
    truck_id IN (SELECT id FROM public.trucks WHERE driver_id = auth.uid())
  );

-- Only admins/operators can create consignments
CREATE POLICY "consignments_insert_admin" ON public.consignments 
  FOR INSERT WITH CHECK (is_admin_or_operator());

-- Admins/operators can update any consignment
CREATE POLICY "consignments_update_admin" ON public.consignments 
  FOR UPDATE USING (is_admin_or_operator());

-- Drivers can update status of assigned consignments
CREATE POLICY "consignments_update_driver" ON public.consignments 
  FOR UPDATE USING (
    truck_id IN (SELECT id FROM public.trucks WHERE driver_id = auth.uid())
  );

CREATE POLICY "consignments_delete_admin" ON public.consignments 
  FOR DELETE USING (is_admin());

-- ============================================
-- CONSIGNMENT ITEMS POLICIES
-- ============================================
-- View items if can view parent consignment
CREATE POLICY "consignment_items_select" ON public.consignment_items 
  FOR SELECT USING (
    consignment_id IN (
      SELECT id FROM public.consignments 
      WHERE sender_id = auth.uid() 
         OR receiver_id = auth.uid()
         OR is_admin_or_operator()
    )
  );

-- Only admins/operators can manage items
CREATE POLICY "consignment_items_insert_admin" ON public.consignment_items 
  FOR INSERT WITH CHECK (is_admin_or_operator());

CREATE POLICY "consignment_items_update_admin" ON public.consignment_items 
  FOR UPDATE USING (is_admin_or_operator());

CREATE POLICY "consignment_items_delete_admin" ON public.consignment_items 
  FOR DELETE USING (is_admin_or_operator());

-- ============================================
-- GPS TRACKING POLICIES
-- ============================================
-- Admins/operators can view all tracking
CREATE POLICY "gps_tracking_select_admin" ON public.gps_tracking 
  FOR SELECT USING (is_admin_or_operator());

-- Customers can view tracking for their consignments
CREATE POLICY "gps_tracking_select_customer" ON public.gps_tracking 
  FOR SELECT USING (
    consignment_id IN (
      SELECT id FROM public.consignments 
      WHERE sender_id = auth.uid() OR receiver_id = auth.uid()
    )
  );

-- Only system/drivers can insert tracking data
CREATE POLICY "gps_tracking_insert_driver" ON public.gps_tracking 
  FOR INSERT WITH CHECK (
    is_admin_or_operator() OR
    truck_id IN (SELECT id FROM public.trucks WHERE driver_id = auth.uid())
  );

-- ============================================
-- DELIVERY UPDATES POLICIES
-- ============================================
-- Admins/operators can view all updates
CREATE POLICY "delivery_updates_select_admin" ON public.delivery_updates 
  FOR SELECT USING (is_admin_or_operator());

-- Customers can view updates for their consignments
CREATE POLICY "delivery_updates_select_customer" ON public.delivery_updates 
  FOR SELECT USING (
    consignment_id IN (
      SELECT id FROM public.consignments 
      WHERE sender_id = auth.uid() OR receiver_id = auth.uid()
    )
  );

-- Admins/operators/drivers can insert updates
CREATE POLICY "delivery_updates_insert" ON public.delivery_updates 
  FOR INSERT WITH CHECK (
    is_admin_or_operator() OR
    consignment_id IN (
      SELECT c.id FROM public.consignments c
      JOIN public.trucks t ON c.truck_id = t.id
      WHERE t.driver_id = auth.uid()
    )
  );

-- ============================================
-- MISSING REPORTS POLICIES
-- ============================================
-- Admins/operators can view all reports
CREATE POLICY "missing_reports_select_admin" ON public.missing_reports 
  FOR SELECT USING (is_admin_or_operator());

-- Users can view their own reports
CREATE POLICY "missing_reports_select_own" ON public.missing_reports 
  FOR SELECT USING (reported_by = auth.uid());

-- Users can view reports for their consignments
CREATE POLICY "missing_reports_select_consignment" ON public.missing_reports 
  FOR SELECT USING (
    consignment_id IN (
      SELECT id FROM public.consignments 
      WHERE sender_id = auth.uid() OR receiver_id = auth.uid()
    )
  );

-- Authenticated users can create reports
CREATE POLICY "missing_reports_insert" ON public.missing_reports 
  FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Only admins can update reports
CREATE POLICY "missing_reports_update_admin" ON public.missing_reports 
  FOR UPDATE USING (is_admin_or_operator());

-- Users can update their own reports (only if still open)
CREATE POLICY "missing_reports_update_own" ON public.missing_reports 
  FOR UPDATE USING (reported_by = auth.uid() AND status = 'open');

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
-- Users can only view their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications 
  FOR SELECT USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "notifications_insert_system" ON public.notifications 
  FOR INSERT WITH CHECK (is_admin_or_operator() OR user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON public.notifications 
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own" ON public.notifications 
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- NETSUITE SYNC LOG POLICIES
-- ============================================
-- Only admins can view sync logs
CREATE POLICY "netsuite_sync_log_select_admin" ON public.netsuite_sync_log 
  FOR SELECT USING (is_admin());

-- Only system (service role) can insert sync logs
CREATE POLICY "netsuite_sync_log_insert_admin" ON public.netsuite_sync_log 
  FOR INSERT WITH CHECK (is_admin());
