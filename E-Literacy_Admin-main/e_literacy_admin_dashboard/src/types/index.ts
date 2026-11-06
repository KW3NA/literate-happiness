export type NavItem = 'Dashboard' | 'Reports' | 'User Insights' | 'Manage Courses' | 'Manage Users' | 'Settings';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_picture_url?: string;
  town?: string;
  province?: string;
  status?: string;
  created_at?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  competency_area?: string;
  duration?: string;
  estimated_minutes?: number;
  thumbnail?: string;
  image_url?: string;
  video_url?: string;
  is_published?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  practitioner_name?: string;
  created_at?: string;
}

export interface Hub {
  id: string;
  name: string;
  type: string;
  province: string;
  town: string;
  address?: string;
  latitude: number;
  longitude: number;
  active_learners_count: number;
  contact_phone?: string;
  contact_email?: string;
  is_active?: boolean;
}

export interface ProvinceMetric {
  id: string;
  province_code: string;
  province_name: string;
  learner_count: number;
  beginner_count: number;
  intermediate_count: number;
  advanced_count: number;
  hub_count: number;
}

export interface PractitionerVerification {
  id: string;
  practitioner_email: string;
  id_document_name: string;
  reference_document_name: string;
  status: 'pending' | 'verified' | 'rejected';
  submitted_at: string;
}
