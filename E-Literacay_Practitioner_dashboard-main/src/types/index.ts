export interface JobItem {
  id: string;
  title: string;
  organization: string;
  type: string;
  location: string;
  province?: string;
  deadline?: string;
  stipend?: string;
  applyLink?: string;
  url?: string;
  description?: string;
  is_published?: boolean;
  created_at?: string;
}

export interface Lesson {
  id: string;
  title: string;
  order_num: number;
  estimated_minutes: number;
  video_url?: string;
}

export interface PractitionerCourse {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  competency_area?: string;
  duration?: string;
  estimated_minutes?: number;
  status: 'pending' | 'approved' | 'rejected';
  practitioner_name?: string;
  is_published?: boolean;
  lessons?: Lesson[];
  created_at?: string;
}

export interface VerificationSubmission {
  id: string;
  practitioner_email: string;
  id_document_name: string;
  reference_document_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'verified';
  submitted_at: string;
}
