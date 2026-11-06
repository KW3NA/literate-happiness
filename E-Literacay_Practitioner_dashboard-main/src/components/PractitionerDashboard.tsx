import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { VerificationSubmission, PractitionerCourse } from '../types';

interface PractitionerDashboardProps {
  isDarkMode: boolean;
  practitionerName: string;
  practitionerEmail: string;
  onNavigate: (tab: string) => void;
}

export const PractitionerDashboard: React.FC<PractitionerDashboardProps> = ({
  isDarkMode,
  practitionerName,
  practitionerEmail,
  onNavigate,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [myCoursesCount, setMyCoursesCount] = useState<number>(0);
  const [totalEnrollments, setTotalEnrollments] = useState<number>(0);
  const [totalOpportunities, setTotalOpportunities] = useState<number>(0);
  const [verification, setVerification] = useState<VerificationSubmission | null>(null);
  const [recentCourses, setRecentCourses] = useState<PractitionerCourse[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);

        const [
          { count: coursesCount, data: coursesData },
          { count: myCourses },
          { count: enrollCount },
          { count: oppCount },
          { data: verifData },
        ] = await Promise.all([
          supabase.from('courses').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(4),
          supabase.from('courses').select('*', { count: 'exact', head: true }).eq('practitioner_name', practitionerName),
          supabase.from('enrollments').select('*', { count: 'exact', head: true }),
          supabase.from('opportunities').select('*', { count: 'exact', head: true }),
          supabase.from('practitioner_verifications').select('*').eq('practitioner_email', practitionerEmail).order('submitted_at', { ascending: false }).limit(1),
        ]);

        setTotalCourses(coursesCount || 0);
        setMyCoursesCount(myCourses || 0);
        setTotalEnrollments(enrollCount || 0);
        setTotalOpportunities(oppCount || 0);
        setRecentCourses((coursesData as PractitionerCourse[]) || []);
        if (verifData && verifData.length > 0) {
          setVerification(verifData[0] as VerificationSubmission);
        }
      } catch (err) {
        console.error('Failed to load practitioner metrics from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [practitionerName, practitionerEmail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-500">Loading practitioner live workspace...</span>
      </div>
    );
  }

  const verifStatus = verification?.status || 'unverified';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 shadow-md text-white transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #E67012 0%, #B84700 100%)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20">
              Accredited Educator Portal
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                verifStatus === 'approved' || verifStatus === 'verified'
                  ? 'bg-green-500/80 text-white'
                  : verifStatus === 'pending'
                  ? 'bg-amber-400 text-gray-900'
                  : 'bg-red-400 text-white'
              }`}
            >
              Verification: {verifStatus}
            </span>
          </div>
          <h1 className="text-2xl font-bold">Welcome back, {practitionerName}</h1>
          <p className="text-white/80 text-sm mt-1">
            Educator & Digital Inclusion Facilitator • {practitionerEmail}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('Courses')}
            className="px-4 py-2 rounded-xl bg-white text-[#E67012] font-bold text-xs shadow hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span>Author Course</span>
          </button>
          <button
            onClick={() => onNavigate('Verify Documents')}
            className="px-4 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-white font-bold text-xs border border-white/20 transition-all"
          >
            Accreditation
          </button>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex justify-between items-center text-gray-400 text-xs font-semibold mb-2">
            <span>Authored Courses</span>
            <i className="fas fa-book-open text-orange-500"></i>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{myCoursesCount}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Of {totalCourses} catalog courses</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex justify-between items-center text-gray-400 text-xs font-semibold mb-2">
            <span>Platform Enrollments</span>
            <i className="fas fa-user-graduate text-green-500"></i>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEnrollments}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Live Supabase enrollments</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex justify-between items-center text-gray-400 text-xs font-semibold mb-2">
            <span>Digital Opportunities</span>
            <i className="fas fa-briefcase text-blue-500"></i>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOpportunities}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Learnerships & internships</span>
        </div>

        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex justify-between items-center text-gray-400 text-xs font-semibold mb-2">
            <span>Accreditation Status</span>
            <i className="fas fa-shield-alt text-amber-500"></i>
          </div>
          <p className="text-lg font-bold capitalize text-[#E67012] mt-1">{verifStatus}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {verification ? `Ref: ${verification.id_document_name}` : 'Not submitted yet'}
          </span>
        </div>
      </div>

      {/* Main Content: Recent Courses & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses in Curriculum */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Active Curriculum Courses</h3>
            <button
              onClick={() => onNavigate('Courses')}
              className="text-xs font-semibold text-[#E67012] hover:underline"
            >
              View All ({totalCourses})
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentCourses.map((c) => (
              <div key={c.id} className="py-3.5 flex justify-between items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{c.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {c.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">{c.description}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.status === 'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="block text-[11px] text-gray-400 mt-1">
                    {c.duration || `${c.estimated_minutes || 45} mins`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm flex flex-col justify-between`}>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Facilitator Tools</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Maintain your teaching qualifications and publish community opportunities.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('Courses')}
                className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#E67012] flex items-center justify-center text-sm font-bold">
                    <i className="fas fa-plus"></i>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block group-hover:text-[#E67012]">Create Course</span>
                    <span className="text-[10px] text-gray-400">Add modules and learning objectives</span>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-xs text-gray-400"></i>
              </button>

              <button
                onClick={() => onNavigate('Verify Documents')}
                className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#E67012] flex items-center justify-center text-sm font-bold">
                    <i className="fas fa-file-upload"></i>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block group-hover:text-[#E67012]">Accreditation Upload</span>
                    <span className="text-[10px] text-gray-400">ID & references for SAQA compliance</span>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-xs text-gray-400"></i>
              </button>

              <button
                onClick={() => onNavigate('Opportunities')}
                className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#E67012] flex items-center justify-center text-sm font-bold">
                    <i className="fas fa-bullhorn"></i>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block group-hover:text-[#E67012]">Post Opportunity</span>
                    <span className="text-[10px] text-gray-400">Share learnerships with citizens</span>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-xs text-gray-400"></i>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-[11px] text-gray-400 flex items-center gap-2">
            <i className="fas fa-database text-green-500"></i>
            <span>Connected to Supabase PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
