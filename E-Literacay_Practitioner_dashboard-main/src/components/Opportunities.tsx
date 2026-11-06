import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { JobItem } from '../types';

interface OpportunitiesProps {
  isDarkMode: boolean;
}

export const Opportunities: React.FC<OpportunitiesProps> = ({ isDarkMode }) => {
  const [opportunities, setOpportunities] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New opportunity form state
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [type, setType] = useState('learnership');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [stipend, setStipend] = useState('');
  const [applyLink, setApplyLink] = useState('');
  const [description, setDescription] = useState('');

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      let query = supabase.from('opportunities').select('*').order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Ensure applyLink is always populated from url or applyLink
      const formatted = (data || []).map((item: any) => ({
        ...item,
        applyLink: item.url || item.applyLink || '#',
      }));

      setOpportunities(formatted);
    } catch (err: any) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [filterType]);

  const handleAddOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !organization.trim() || !applyLink.trim()) {
      setNotification({ message: 'Please provide title, organization, and application link.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('opportunities').insert({
        title,
        organization,
        type,
        location: location || 'National / Remote',
        deadline: deadline || 'Open',
        stipend: stipend || 'Disclosed upon application',
        url: applyLink,
        description: description || 'Digital economy opportunity for verified learners and facilitators.',
        is_published: true,
      });

      if (error) throw error;

      setNotification({ message: 'Opportunity published successfully to Supabase!', type: 'success' });
      setTitle('');
      setOrganization('');
      setLocation('');
      setDeadline('');
      setStipend('');
      setApplyLink('');
      setDescription('');
      setShowAddModal(false);
      await fetchOpportunities();
    } catch (err: any) {
      console.error('Error adding opportunity:', err);
      setNotification({ message: `Failed to publish opportunity: ${err.message}`, type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filteredOpportunities = opportunities.filter((op) => {
    const matchesSearch =
      op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Youth Employment & Digital Opportunities</h2>
          <p className="text-sm text-gray-500 mt-1">
            Connect accredited learners to digital learnerships, internships, and entry-level tech roles
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#E67012] hover:bg-[#D05505] text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
        >
          <i className="fas fa-plus"></i>
          <span>Post New Opportunity</span>
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

      {/* Controls: Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3.5 top-3.5 text-gray-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search by title, organization, or province..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border ${
            isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <option value="all">All Types</option>
          <option value="learnership">Learnerships</option>
          <option value="internship">Internships</option>
          <option value="job">Jobs</option>
          <option value="bursary">Bursaries</option>
        </select>
      </div>

      {/* Grid of Opportunities */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-500">Querying live opportunities from Supabase...</span>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className={`p-8 text-center rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
          No opportunities match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOpportunities.map((op) => (
            <div
              key={op.id}
              className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } shadow-sm flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-[#E67012] dark:bg-orange-950/50 dark:text-orange-300">
                    {op.type}
                  </span>
                  {op.deadline && (
                    <span className="text-[11px] text-gray-400 font-medium">
                      Closes: {op.deadline}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-gray-900 dark:text-white mt-1">{op.title}</h3>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">{op.organization}</p>

                <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 line-clamp-3 leading-relaxed">
                  {op.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>📍 {op.location}</span>
                  {op.stipend && <span className="font-semibold text-green-600 dark:text-green-400">{op.stipend}</span>}
                </div>

                <a
                  href={op.applyLink || op.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#E67012] dark:text-orange-300 hover:bg-[#E67012] hover:text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <span>Apply on Partner Site</span>
                  <i className="fas fa-external-link-alt text-[10px]"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Opportunity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-6 rounded-2xl shadow-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Post New Opportunity</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleAddOpportunity} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Community Tech Facilitator Internship"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Organization / Partner</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MICT SETA"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  >
                    <option value="learnership">Learnership</option>
                    <option value="internship">Internship</option>
                    <option value="job">Full-time Job</option>
                    <option value="bursary">Bursary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Location / Province</label>
                  <input
                    type="text"
                    placeholder="e.g. Johannesburg / Gauteng"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Stipend / Salary</label>
                  <input
                    type="text"
                    placeholder="e.g. R 6,500 / month"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Application URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.org/apply"
                    value={applyLink}
                    onChange={(e) => setApplyLink(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Deadline Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Dec 2026"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Outline requirements and responsibilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#E67012] hover:bg-[#D05505] text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {submitting ? 'Publishing...' : 'Publish to Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
