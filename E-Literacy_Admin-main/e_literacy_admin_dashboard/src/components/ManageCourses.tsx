import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Course } from '../types';

interface ManageCoursesProps {
  isDark?: boolean;
  isDarkMode?: boolean;
}

export const ManageCourses: React.FC<ManageCoursesProps> = ({ isDark = false, isDarkMode: propDark = false }) => {
  const isDarkMode = isDark || propDark;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let query = supabase.from('courses').select('*').order('created_at', { ascending: false });

      if (activeFilter !== 'all') {
        query = query.eq('status', activeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCourses(data || []);
    } catch (err: any) {
      console.error('Error fetching courses from Supabase:', err);
      setNotification({ message: 'Failed to load courses from Supabase', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [activeFilter]);

  const handleUpdateStatus = async (courseId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setActionLoadingId(courseId);
      const updateData: Partial<Course> = {
        status: newStatus,
        is_published: newStatus === 'approved',
      };

      const { error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', courseId);

      if (error) throw error;

      setNotification({
        message: `Course successfully ${newStatus === 'approved' ? 'approved & published' : 'rejected'}`,
        type: 'success',
      });

      // Refresh list
      await fetchCourses();
    } catch (err: any) {
      console.error('Error updating course status:', err);
      setNotification({ message: `Failed to update course status: ${err.message}`, type: 'error' });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Course Curriculum Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Review, evaluate and approve practitioner-submitted digital literacy courses
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-[#E67012] text-white shadow'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300'
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-sm font-bold opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Courses List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-500">Retrieving courses from Supabase...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-[#E67012]">
            <i className="fas fa-inbox text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold">No {activeFilter} courses found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {activeFilter === 'pending'
              ? 'All submitted curriculum items have been reviewed.'
              : `There are currently no courses categorized as ${activeFilter}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      course.status === 'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : course.status === 'rejected'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                    }`}
                  >
                    {course.status}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    Level: <strong className="text-gray-700 dark:text-gray-200">{course.level}</strong>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                  {course.description || 'Comprehensive modular digital skills curriculum.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  {course.practitioner_name && (
                    <span className="flex items-center gap-1.5">
                      <i className="fas fa-user-tie text-orange-500"></i>
                      <span>{course.practitioner_name}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-clock text-blue-500"></i>
                    <span>{course.duration || `${course.estimated_minutes || 45} mins`}</span>
                  </span>
                  {course.competency_area && (
                    <span className="flex items-center gap-1.5 capitalize">
                      <i className="fas fa-tag text-green-500"></i>
                      <span>{course.competency_area.replace(/_/g, ' ')}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 flex items-center gap-3">
                {course.status !== 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(course.id, 'approved')}
                    disabled={actionLoadingId === course.id}
                    className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <i className="fas fa-check"></i>
                    <span>Approve & Publish</span>
                  </button>
                )}
                {course.status !== 'rejected' && (
                  <button
                    onClick={() => handleUpdateStatus(course.id, 'rejected')}
                    disabled={actionLoadingId === course.id}
                    className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <i className="fas fa-times"></i>
                    <span>Reject Course</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
