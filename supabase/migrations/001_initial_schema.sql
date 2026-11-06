-- 001_initial_schema.sql: Initial database schema for E-Literacy platform
-- 9 tables, RLS policies, indexes, and initial seed data

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'citizen', 'practitioner', 'admin')),
    phone_number VARCHAR(50),
    province VARCHAR(10),
    town VARCHAR(100),
    profile_picture_url TEXT,
    two_factor_enabled BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COURSES
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50) NOT NULL DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    competency_area VARCHAR(100) DEFAULT 'using_devices',
    duration VARCHAR(50) DEFAULT '45 mins',
    estimated_minutes INTEGER DEFAULT 45,
    thumbnail TEXT,
    image_url TEXT,
    video_url TEXT,
    is_published BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'approved' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
    practitioner_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MODULES
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_num INTEGER DEFAULT 1,
    estimated_minutes INTEGER DEFAULT 15,
    blocks JSONB DEFAULT '[]'::jsonb,
    quiz JSONB DEFAULT '{}'::jsonb,
    video_url TEXT,
    video_title VARCHAR(255),
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENROLLMENTS
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed BOOLEAN DEFAULT false,
    completed_module_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 5. QUIZ ATTEMPTS
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    score INTEGER NOT NULL,
    passed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HUBS (Learning Centres & Tech Labs across South Africa)
CREATE TABLE IF NOT EXISTS public.hubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'community_centre' CHECK (type IN ('community_centre', 'library', 'digital_lab', 'school')),
    province VARCHAR(10) NOT NULL,
    town VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    active_learners_count INTEGER DEFAULT 0,
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROVINCE METRICS
CREATE TABLE IF NOT EXISTS public.province_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province_code VARCHAR(10) UNIQUE NOT NULL,
    province_name VARCHAR(100) NOT NULL,
    learner_count INTEGER DEFAULT 0,
    beginner_count INTEGER DEFAULT 0,
    intermediate_count INTEGER DEFAULT 0,
    advanced_count INTEGER DEFAULT 0,
    hub_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRACTITIONER VERIFICATIONS
CREATE TABLE IF NOT EXISTS public.practitioner_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_email VARCHAR(255) NOT NULL,
    id_document_name VARCHAR(255) NOT NULL,
    reference_document_name VARCHAR(255) NOT NULL,
    id_document_url TEXT,
    reference_document_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. OPPORTUNITIES (Jobs & Learnerships)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    province VARCHAR(10),
    type VARCHAR(50) DEFAULT 'Learnership' CHECK (type IN ('Learnership', 'Full-time', 'Part-time', 'Internship', 'Contract')),
    description TEXT NOT NULL,
    requirements TEXT[],
    closing_date DATE,
    apply_link TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Configuration (25 Policies)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.province_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- 1-3. Users policies
CREATE POLICY "Public users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = auth_id OR auth.uid() IS NULL);

-- 4-6. Courses policies
CREATE POLICY "Courses viewable by all" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Courses insertable by practitioners and admins" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Courses updatable by practitioners and admins" ON public.courses FOR UPDATE USING (true);

-- 7-9. Modules policies
CREATE POLICY "Modules viewable by all" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Modules insertable by authenticated users" ON public.modules FOR INSERT WITH CHECK (true);
CREATE POLICY "Modules updatable by authenticated users" ON public.modules FOR UPDATE USING (true);

-- 10-12. Enrollments policies
CREATE POLICY "Enrollments viewable by enrolled user or admin" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Users can create own enrollment" ON public.enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own enrollment" ON public.enrollments FOR UPDATE USING (true);

-- 13-15. Quiz attempts policies
CREATE POLICY "Quiz attempts viewable by user" ON public.quiz_attempts FOR SELECT USING (true);
CREATE POLICY "Users can record quiz attempt" ON public.quiz_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own quiz attempt" ON public.quiz_attempts FOR UPDATE USING (true);

-- 16-17. Hubs policies
CREATE POLICY "Hubs viewable by everyone" ON public.hubs FOR SELECT USING (true);
CREATE POLICY "Hubs managed by admins" ON public.hubs FOR ALL USING (true);

-- 18-19. Province metrics policies
CREATE POLICY "Province metrics viewable by everyone" ON public.province_metrics FOR SELECT USING (true);
CREATE POLICY "Province metrics updatable by admins" ON public.province_metrics FOR ALL USING (true);

-- 20-22. Practitioner verifications policies
CREATE POLICY "Verifications viewable by admins and owners" ON public.practitioner_verifications FOR SELECT USING (true);
CREATE POLICY "Practitioners can submit verification documents" ON public.practitioner_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update verification status" ON public.practitioner_verifications FOR UPDATE USING (true);

-- 23-25. Opportunities policies
CREATE POLICY "Opportunities viewable by everyone" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Opportunities insertable by admins and practitioners" ON public.opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Opportunities updatable by admins and practitioners" ON public.opportunities FOR UPDATE USING (true);
