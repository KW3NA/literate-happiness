import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ProvinceMetric, UserProfile } from '../types';

interface HomeProps {
  isDark?: boolean;
  isDarkMode?: boolean;
  currentUser?: UserProfile | null;
}

export const Home: React.FC<HomeProps> = ({ isDark = false, isDarkMode: propDark = false, currentUser = null }) => {
  const isDarkMode = isDark || propDark;
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [pendingVerifications, setPendingVerifications] = useState<number>(0);
  const [levelStats, setLevelStats] = useState({
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true);

        // Fetch live counts from Supabase
        const [{ count: userCount, data: usersList }, { count: courseCount }, { count: verifCount }, { data: metricsData }] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact' }).limit(5).order('created_at', { ascending: false }),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('practitioner_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('province_metrics').select('*'),
        ]);

        setTotalUsers(userCount || 0);
        setTotalCourses(courseCount || 0);
        setPendingVerifications(verifCount || 0);
        setRecentUsers((usersList as UserProfile[]) || []);

        if (metricsData && metricsData.length > 0) {
          const totals = (metricsData as ProvinceMetric[]).reduce(
            (acc, curr) => ({
              beginner: acc.beginner + (curr.beginner_count || 0),
              intermediate: acc.intermediate + (curr.intermediate_count || 0),
              advanced: acc.advanced + (curr.advanced_count || 0),
            }),
            { beginner: 0, intermediate: 0, advanced: 0 }
          );
          setLevelStats(totals);
        } else if (usersList) {
          // Calculate from users table directly
          const beginner = usersList.filter((u: any) => u.current_level === 'Beginner').length;
          const intermediate = usersList.filter((u: any) => u.current_level === 'Intermediate').length;
          const advanced = usersList.filter((u: any) => u.current_level === 'Advanced').length;
          setLevelStats({ beginner, intermediate, advanced });
        }
      } catch (err) {
        console.error('Error fetching live stats from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  const totalLevelSum = levelStats.beginner + levelStats.intermediate + levelStats.advanced || totalUsers || 1;
  const beginnerPct = ((levelStats.beginner / totalLevelSum) * 100).toFixed(1);
  const intermediatePct = ((levelStats.intermediate / totalLevelSum) * 100).toFixed(1);
  const advancedPct = ((levelStats.advanced / totalLevelSum) * 100).toFixed(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-4 text-gray-500">Loading live platform statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div
        className="rounded-2xl p-6 shadow-md text-white transition-all"
        style={{ background: 'linear-gradient(135deg, #E67012 0%, #D05505 100%)' }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {currentUser?.name || 'Platform Administrator'}
            </h1>
            <p className="text-white/80 text-sm mt-1">
              National Digital Literacy Program Monitoring & Administration Portal
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider">
            Live Supabase Connected
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Registered Citizens</span>
            <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600">
              <i className="fas fa-users text-sm"></i>
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-extrabold text-[#E67012]">{totalUsers.toLocaleString()}</h2>
            <p className="text-xs text-gray-400 mt-1">Active participants nationwide</p>
          </div>
        </div>

        {/* Total Courses */}
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Curriculum Courses</span>
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <i className="fas fa-book-open text-sm"></i>
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-extrabold text-blue-600">{totalCourses.toLocaleString()}</h2>
            <p className="text-xs text-gray-400 mt-1">Approved digital modules</p>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Practitioner Review</span>
            <div className="w-9 h-9 rounded-lg bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center text-yellow-600">
              <i className="fas fa-user-check text-sm"></i>
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-extrabold text-yellow-600">{pendingVerifications.toLocaleString()}</h2>
            <p className="text-xs text-gray-400 mt-1">Pending verification submissions</p>
          </div>
        </div>

        {/* Completion Rate / Level Summary */}
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Dominant Tier</span>
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center text-green-600">
              <i className="fas fa-graduation-cap text-sm"></i>
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-extrabold text-green-600">
              {levelStats.intermediate >= levelStats.beginner ? 'Intermediate' : 'Beginner'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">{intermediatePct}% enrolled in tier 2</p>
          </div>
        </div>
      </div>

      {/* Proficiency Distribution Grid */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <h3 className="text-lg font-bold mb-4">Learner Proficiency Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-orange-50 dark:bg-gray-700/50 border border-orange-100 dark:border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Beginner Tier</span>
              <span className="text-xs font-bold text-orange-600">{beginnerPct}%</span>
            </div>
            <p className="text-2xl font-bold text-[#E67012]">{levelStats.beginner.toLocaleString()}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#E67012] h-full rounded-full" style={{ width: `${beginnerPct}%` }}></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Intermediate Tier</span>
              <span className="text-xs font-bold text-blue-600">{intermediatePct}%</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{levelStats.intermediate.toLocaleString()}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${intermediatePct}%` }}></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-green-50 dark:bg-gray-700/50 border border-green-100 dark:border-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Advanced Tier</span>
              <span className="text-xs font-bold text-green-600">{advancedPct}%</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{levelStats.advanced.toLocaleString()}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-green-600 h-full rounded-full" style={{ width: `${advancedPct}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent User Enrollments */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Recent Registered Citizens</h3>
          <span className="text-xs text-gray-400">Live Supabase Sync</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400">
                <th className="pb-3">Learner Name</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="py-3 font-semibold">{u.name}</td>
                  <td className="py-3 text-gray-500">{u.email}</td>
                  <td className="py-3 capitalize">
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 font-medium">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{u.town || u.province || 'Gauteng, ZA'}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
