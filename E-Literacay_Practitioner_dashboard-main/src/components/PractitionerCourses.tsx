import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PractitionerCourse } from '../types';

interface PractitionerCoursesProps {
  isDarkMode: boolean;
  practitionerName: string;
}

export const PractitionerCourses: React.FC<PractitionerCoursesProps> = ({ isDarkMode, practitionerName }) => {
  const [courses, setCourses] = useState<PractitionerCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Course Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [competencyArea, setCompetencyArea] = useState('using_devices');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [videoUrl, setVideoUrl] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses((data as PractitionerCourse[]) || []);
    } catch (err: any) {
      console.error('Error fetching practitioner courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setNotification({ message: 'Please provide course title and description.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      const newCoursePayload = {
        title,
        description,
        level,
        competency_area: competencyArea,
        estimated_minutes: estimatedMinutes,
        duration: `${estimatedMinutes} mins`,
        video_url: videoUrl || 'https://www.youtube.com/watch?v=Z1XJFdHlos4',
        status: 'pending',
        is_published: false,
        practitioner_name: practitionerName,
        image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      };

      const { data, error } = await supabase
        .from('courses')
        .insert(newCoursePayload)
        .select()
        .single();

      if (error) throw error;

      // Add a starter module in Supabase modules table
      if (data?.id) {
        await supabase.from('modules').insert({
          course_id: data.id,
          title: `Introduction to ${title}`,
          order_num: 1,
          estimated_minutes: 15,
          blocks: [
            { type: 'heading', content: 'Welcome & Core Objectives' },
            { type: 'paragraph', content: description },
          ],
        });
      }

      setNotification({
        message: 'Course created and submitted for administrator review!',
        type: 'success',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setShowCreateModal(false);
      await fetchCourses();
    } catch (err: any) {
      console.error('Error creating course in Supabase:', err);
      setNotification({ message: `Failed to create course: ${err.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Course Creation & Authoring</h2>
          <p className="text-sm text-gray-500 mt-1">
            Author and publish digital literacy curricula aligned with National SAQF competencies
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#E67012] hover:bg-[#D05505] text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
        >
          <i className="fas fa-plus"></i>
          <span>Author New Course</span>
        </button>
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
          <button onClick={() => setNotification(null)} className="font-bold">✕</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-500">Retrieving curriculum courses from Supabase...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      course.status === 'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : course.status === 'rejected'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                    }`}
                  >
                    {course.status}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
                    {course.level}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 dark:text-white">{course.title}</h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
                <span>⏱️ {course.duration || `${course.estimated_minutes || 45} mins`}</span>
                <span>👤 {course.practitioner_name || 'Practitioner'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-6 rounded-2xl shadow-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Author New Digital Literacy Course</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Skills: Safe Digital Banking"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Description & Learning Outcomes</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the skills learners will gain in this course..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Proficiency Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Competency Area</label>
                  <select
                    value={competencyArea}
                    onChange={(e) => setCompetencyArea(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  >
                    <option value="using_devices">Using Devices</option>
                    <option value="staying_safe">Staying Safe Online</option>
                    <option value="digital_work">Digital Work & Tools</option>
                    <option value="career">Job Search & CV</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">YouTube Preview / Lesson Video URL</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#E67012] hover:bg-[#D05505] text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Save & Submit Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
