-- LogiTrack Database Schema
-- Complete logistics management system for NetSuite integration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (linked to auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'operator', 'driver', 'customer')),
  company_name TEXT,
  netsuite_customer_id TEXT,
  is_2fa_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('logistics_provider', 'shipper', 'consignee')),
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  netsuite_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRUCKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_number TEXT NOT NULL UNIQUE,
  truck_type TEXT NOT NULL CHECK (truck_type IN ('small_van', 'medium_truck', 'large_truck', 'trailer', 'container')),
  capacity_kg NUMERIC(10,2),
  capacity_volume_cbm NUMERIC(10,2),
  driver_id UUID REFERENCES public.profiles(id),
  driver_name TEXT,
  driver_phone TEXT,
  driver_license_number TEXT,
  current_status TEXT DEFAULT 'available' CHECK (current_status IN ('available', 'in_transit', 'maintenance', 'offline')),
  current_latitude NUMERIC(10,7),
  current_longitude NUMERIC(10,7),
  last_location_update TIMESTAMPTZ,
  netsuite_asset_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONSIGNMENTS TABLE (Main shipment records)
-- ============================================
CREATE TABLE IF NOT EXISTS public.consignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number TEXT NOT NULL UNIQUE,
  consignment_type TEXT NOT NULL CHECK (consignment_type IN ('incoming', 'outgoing')),
  
  -- Sender/Receiver Info
  sender_id UUID REFERENCES public.profiles(id),
  sender_company_id UUID REFERENCES public.companies(id),
  sender_name TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  sender_city TEXT,
  sender_state TEXT,
  sender_country TEXT,
  sender_postal_code TEXT,
  sender_phone TEXT,
  
  receiver_id UUID REFERENCES public.profiles(id),
  receiver_company_id UUID REFERENCES public.companies(id),
  receiver_name TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  receiver_city TEXT,
  receiver_state TEXT,
  receiver_country TEXT,
  receiver_postal_code TEXT,
  receiver_phone TEXT,
  
  -- Consignment Details
  total_parcels INTEGER NOT NULL DEFAULT 1,
  total_weight_kg NUMERIC(10,2),
  total_volume_cbm NUMERIC(10,2),
  description TEXT,
  special_instructions TEXT,
  
  -- Shipping Info
  truck_id UUID REFERENCES public.trucks(id),
  origin_latitude NUMERIC(10,7),
  origin_longitude NUMERIC(10,7),
  destination_latitude NUMERIC(10,7),
  destination_longitude NUMERIC(10,7),
  
  -- Dates
  pickup_date TIMESTAMPTZ,
  estimated_delivery_date TIMESTAMPTZ,
  actual_delivery_date TIMESTAMPTZ,
  delivery_started_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'picked_up', 'in_transit', 
    'out_for_delivery', 'delivered', 'failed', 'returned', 'cancelled'
  )),
  
  -- NetSuite Integration
  netsuite_sales_order_id TEXT,
  netsuite_invoice_id TEXT,
  netsuite_sync_status TEXT DEFAULT 'pending' CHECK (netsuite_sync_status IN ('pending', 'synced', 'failed')),
  netsuite_last_sync TIMESTAMPTZ,
  
  -- Meta
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONSIGNMENT ITEMS TABLE (Parcels/Items in a shipment)
-- ============================================
CREATE TABLE IF NOT EXISTS public.consignment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consignment_id UUID NOT NULL REFERENCES public.consignments(id) ON DELETE CASCADE,
  item_number INTEGER NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  weight_kg NUMERIC(10,2),
  length_cm NUMERIC(10,2),
  width_cm NUMERIC(10,2),
  height_cm NUMERIC(10,2),
  barcode TEXT,
  is_fragile BOOLEAN DEFAULT FALSE,
  is_hazardous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GPS TRACKING TABLE (Location history)
-- ============================================
CREATE TABLE IF NOT EXISTS public.gps_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consignment_id UUID REFERENCES public.consignments(id) ON DELETE CASCADE,
  truck_id UUID REFERENCES public.trucks(id) ON DELETE CASCADE,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  speed_kmh NUMERIC(6,2),
  heading NUMERIC(5,2),
  altitude_m NUMERIC(8,2),
  accuracy_m NUMERIC(6,2),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DELIVERY UPDATES TABLE (Status history)
-- ============================================
CREATE TABLE IF NOT EXISTS public.delivery_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consignment_id UUID NOT NULL REFERENCES public.consignments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  notes TEXT,
  photo_url TEXT,
  signature_url TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MISSING REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.missing_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consignment_id UUID NOT NULL REFERENCES public.consignments(id) ON DELETE CASCADE,
  report_number TEXT NOT NULL UNIQUE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('missing_parcel', 'damaged', 'delayed', 'wrong_delivery', 'other')),
  description TEXT NOT NULL,
  items_affected TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  netsuite_case_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMER NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consignment_id UUID REFERENCES public.consignments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('delivery_started', 'out_for_delivery', 'delivered', 'delayed', 'status_update', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  push_sent BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NETSUITE SYNC LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.netsuite_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('consignment', 'customer', 'invoice', 'truck')),
  entity_id UUID NOT NULL,
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('to_netsuite', 'from_netsuite')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_consignments_tracking ON public.consignments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_consignments_status ON public.consignments(status);
CREATE INDEX IF NOT EXISTS idx_consignments_sender ON public.consignments(sender_id);
CREATE INDEX IF NOT EXISTS idx_consignments_receiver ON public.consignments(receiver_id);
CREATE INDEX IF NOT EXISTS idx_consignments_type ON public.consignments(consignment_type);
CREATE INDEX IF NOT EXISTS idx_consignments_dates ON public.consignments(pickup_date, estimated_delivery_date);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_consignment ON public.gps_tracking(consignment_id);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_truck ON public.gps_tracking(truck_id);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_time ON public.gps_tracking(recorded_at);
CREATE INDEX IF NOT EXISTS idx_delivery_updates_consignment ON public.delivery_updates(consignment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_missing_reports_consignment ON public.missing_reports(consignment_id);
CREATE INDEX IF NOT EXISTS idx_trucks_status ON public.trucks(current_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON public.trucks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consignments_updated_at BEFORE UPDATE ON public.consignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missing_reports_updated_at BEFORE UPDATE ON public.missing_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Generate Tracking Number
-- ============================================
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
DECLARE
    prefix TEXT := 'LT';
    date_part TEXT;
    random_part TEXT;
BEGIN
    date_part := TO_CHAR(NOW(), 'YYMMDD');
    random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    RETURN prefix || date_part || random_part;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Generate Report Number
-- ============================================
CREATE OR REPLACE FUNCTION generate_report_number()
RETURNS TEXT AS $$
DECLARE
    prefix TEXT := 'MR';
    date_part TEXT;
    random_part TEXT;
BEGIN
    date_part := TO_CHAR(NOW(), 'YYMMDD');
    random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    RETURN prefix || date_part || random_part;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-generate tracking number
-- ============================================
CREATE OR REPLACE FUNCTION set_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
        NEW.tracking_number := generate_tracking_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_tracking_number
    BEFORE INSERT ON public.consignments
    FOR EACH ROW
    EXECUTE FUNCTION set_tracking_number();

-- ============================================
-- TRIGGER: Auto-generate report number
-- ============================================
CREATE OR REPLACE FUNCTION set_report_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.report_number IS NULL OR NEW.report_number = '' THEN
        NEW.report_number := generate_report_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_report_number
    BEFORE INSERT ON public.missing_reports
    FOR EACH ROW
    EXECUTE FUNCTION set_report_number();

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer'),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Create notification on delivery status change
-- ============================================
CREATE OR REPLACE FUNCTION notify_delivery_status_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_title TEXT;
    notification_message TEXT;
    notification_type TEXT;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        CASE NEW.status
            WHEN 'in_transit' THEN
                notification_title := 'Delivery Started';
                notification_message := 'Your consignment ' || NEW.tracking_number || ' is now in transit.';
                notification_type := 'delivery_started';
            WHEN 'out_for_delivery' THEN
                notification_title := 'Out for Delivery';
                notification_message := 'Your consignment ' || NEW.tracking_number || ' is out for delivery today.';
                notification_type := 'out_for_delivery';
            WHEN 'delivered' THEN
                notification_title := 'Delivered';
                notification_message := 'Your consignment ' || NEW.tracking_number || ' has been delivered.';
                notification_type := 'delivered';
            ELSE
                notification_title := 'Status Update';
                notification_message := 'Your consignment ' || NEW.tracking_number || ' status: ' || NEW.status;
                notification_type := 'status_update';
        END CASE;
        
        -- Notify receiver
        IF NEW.receiver_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, consignment_id, type, title, message)
            VALUES (NEW.receiver_id, NEW.id, notification_type, notification_title, notification_message);
        END IF;
        
        -- Also notify sender
        IF NEW.sender_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, consignment_id, type, title, message)
            VALUES (NEW.sender_id, NEW.id, notification_type, notification_title, notification_message);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_status_change
    AFTER UPDATE ON public.consignments
    FOR EACH ROW
    EXECUTE FUNCTION notify_delivery_status_change();
