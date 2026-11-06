import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'learner' | 'citizen' | 'practitioner' | 'admin';
  phone_number: string | null;
  province: string | null;
  town: string | null;
  email_verified: boolean;
  created_at: string;
}

interface ManageUsersProps {
  isDark?: boolean;
}

export const ManageUsers: React.FC<ManageUsersProps> = ({ isDark = false }) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = supabase.from('users').select('*').order('created_at', { ascending: false });
      if (roleFilter !== 'All') {
        query = query.eq('role', roleFilter.toLowerCase());
      }
      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users from Supabase:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleUpdateRole = async (userId: string, newRole: 'learner' | 'citizen' | 'practitioner' | 'admin') => {
    try {
      setUpdatingId(userId);
      const { error } = await supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className={`p-8 space-y-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6 border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Platform Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Access control, accreditation role verification, and citizen registration records
          </p>
        </div>
        <div className="flex gap-2">
          {['All', 'Learner', 'Practitioner', 'Admin'].map(filter => (
            <button
              key={filter}
              onClick={() => setRoleFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                roleFilter === filter
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 mt-2">Loading users from Supabase...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800">
          <p className="text-sm text-gray-500">No users found with role "{roleFilter}".</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-neutral-800 text-gray-400 text-xs uppercase bg-gray-50/50 dark:bg-neutral-800/40">
                  <th className="py-4 px-6 font-semibold">User</th>
                  <th className="py-4 px-4 font-semibold">Email</th>
                  <th className="py-4 px-4 font-semibold">Current Role</th>
                  <th className="py-4 px-4 font-semibold">Location</th>
                  <th className="py-4 px-6 font-semibold text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-4 px-6 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 flex items-center justify-center font-bold text-xs">
                        {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name || 'Citizen'}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300 text-xs">{u.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : u.role === 'practitioner'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500">
                      {u.town ? `${u.town}, ${u.province || 'SA'}` : 'South Africa'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <select
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={e => handleUpdateRole(u.id, e.target.value as any)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none"
                      >
                        <option value="learner">Learner</option>
                        <option value="citizen">Citizen</option>
                        <option value="practitioner">Practitioner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
