import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eiztmxysokakbgcahzod.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpenRteHlzb2tha2JnY2Foem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4ODU3MzksImV4cCI6MjEwODQ2MTczOX0.-pB9FnhTWbuVJATOC1hOyb7VStxiLFGPZVtkvVs6Fqg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
