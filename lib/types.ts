export type UserRole = 'system_admin' | 'dispatcher' | 'driver' | 'customer'

export type ConsignmentStatus = 
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export type ConsignmentType = 'incoming' | 'outgoing'

export type TruckStatus = 'available' | 'in_transit' | 'maintenance' | 'retired'

export type MissingReportStatus = 'open' | 'investigating' | 'found' | 'closed'

export type DeliveryUpdateStatus = 
  | 'order_placed'
  | 'picked_up'
  | 'in_transit'
  | 'at_hub'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_attempted'
  | 'exception'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  company_id: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  type: 'logistics_provider' | 'customer'
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postal_code: string | null
  phone: string | null
  email: string | null
  netsuite_id: string | null
  created_at: string
  updated_at: string
}

export interface Truck {
  id: string
  registration_number: string
  make: string | null
  model: string | null
  year: number | null
  capacity_kg: number | null
  capacity_volume_m3: number | null
  driver_name: string | null
  driver_phone: string | null
  driver_license: string | null
  status: TruckStatus
  current_latitude: number | null
  current_longitude: number | null
  last_location_update: string | null
  company_id: string | null
  netsuite_id: string | null
  created_at: string
  updated_at: string
}

export interface Consignment {
  id: string
  tracking_number: string
  type: ConsignmentType
  status: ConsignmentStatus
  sender_company_id: string | null
  sender_name: string
  sender_address: string
  sender_city: string
  sender_state: string | null
  sender_country: string
  sender_postal_code: string | null
  sender_phone: string | null
  receiver_company_id: string | null
  receiver_name: string
  receiver_address: string
  receiver_city: string
  receiver_state: string | null
  receiver_country: string
  receiver_postal_code: string | null
  receiver_phone: string | null
  parcels_count: number
  total_weight_kg: number | null
  total_volume_m3: number | null
  pickup_date: string | null
  expected_delivery_date: string | null
  actual_delivery_date: string | null
  truck_id: string | null
  assigned_driver_id: string | null
  special_instructions: string | null
  netsuite_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined fields
  truck?: Truck
  sender_company?: Company
  receiver_company?: Company
}

export interface ConsignmentItem {
  id: string
  consignment_id: string
  description: string
  quantity: number
  weight_kg: number | null
  length_cm: number | null
  width_cm: number | null
  height_cm: number | null
  sku: string | null
  created_at: string
}

export interface GpsTracking {
  id: string
  consignment_id: string | null
  truck_id: string | null
  latitude: number
  longitude: number
  speed_kmh: number | null
  heading: number | null
  altitude_m: number | null
  accuracy_m: number | null
  recorded_at: string
  created_at: string
}

export interface DeliveryUpdate {
  id: string
  consignment_id: string
  status: DeliveryUpdateStatus
  location: string | null
  notes: string | null
  photo_url: string | null
  signature_url: string | null
  updated_by: string | null
  created_at: string
}

export interface MissingReport {
  id: string
  consignment_id: string
  reported_by: string | null
  description: string
  items_missing: string | null
  estimated_value: number | null
  status: MissingReportStatus
  resolution_notes: string | null
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
  // Joined fields
  consignment?: Consignment
  reporter?: Profile
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'delivery_update' | 'consignment_created' | 'missing_report' | 'system'
  reference_type: string | null
  reference_id: string | null
  read: boolean
  created_at: string
}

export interface NetSuiteSyncLog {
  id: string
  entity_type: string
  entity_id: string
  netsuite_id: string | null
  action: 'create' | 'update' | 'delete'
  status: 'pending' | 'success' | 'failed'
  request_payload: Record<string, unknown> | null
  response_payload: Record<string, unknown> | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

// Dashboard stats
export interface DashboardStats {
  totalConsignments: number
  inTransit: number
  delivered: number
  pending: number
  totalTrucks: number
  activeTrucks: number
  openMissingReports: number
}
