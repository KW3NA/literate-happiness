import React, { useState } from 'react';
import { Home } from './components/Home';
import { Reports } from './components/Reports';
import { UserInsightsMap } from './components/UserInsightsMap';
import { ManageCourses } from './components/ManageCourses';
import { ManageUsers } from './components/ManageUsers';
import { Settings } from './components/Settings';

export type NavPage = 'Dashboard' | 'Reports' | 'User Insights' | 'Manage Courses' | 'Manage Users' | 'Settings';

const navIcons: Record<NavPage, string> = {
  'Dashboard': 'fas fa-chart-pie',
  'Reports': 'fas fa-file-alt',
  'User Insights': 'fas fa-map-marked-alt',
  'Manage Courses': 'fas fa-book-reader',
  'Manage Users': 'fas fa-users-cog',
  'Settings': 'fas fa-sliders-h',
};

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavPage>('Dashboard');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const navItems: NavPage[] = [
    'Dashboard',
    'Reports',
    'User Insights',
    'Manage Courses',
    'Manage Users',
    'Settings',
  ];

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-neutral-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } transition-all duration-300 flex-shrink-0 border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between p-4 sticky top-0 h-screen`}
      >
        <div className="space-y-6">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-neutral-800">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-extrabold text-base shadow">
                  E
                </div>
                <div>
                  <span className="font-extrabold tracking-tight text-base text-gray-900 dark:text-white">E-Literacy</span>
                  <span className="block text-[10px] uppercase font-bold text-orange-600 tracking-wider">Admin Portal</span>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <i className={`fas ${sidebarCollapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map(item => {
              const active = currentPage === item;
              return (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-neutral-800/80 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                  title={item}
                >
                  <i className={`${navIcons[item]} text-base w-5 text-center`}></i>
                  {!sidebarCollapsed && <span>{item}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom utility controls */}
        <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <i className={`fas ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-gray-600'} w-5 text-center`}></i>
            {!sidebarCollapsed && <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>}
          </button>
          <div className="px-3.5 py-2 text-[10px] text-gray-400">
            {!sidebarCollapsed && <span>Supabase Connected</span>}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {currentPage === 'Dashboard' && <Home isDarkMode={isDark} currentUser={{ id: 'admin-1', name: 'Platform Administrator', email: 'admin@eliteracy.gov.za', role: 'admin' }} />}
        {currentPage === 'Reports' && <Reports isDark={isDark} />}
        {currentPage === 'User Insights' && <UserInsightsMap isDarkMode={isDark} />}
        {currentPage === 'Manage Courses' && <ManageCourses isDarkMode={isDark} />}
        {currentPage === 'Manage Users' && <ManageUsers isDark={isDark} />}
        {currentPage === 'Settings' && <Settings isDark={isDark} />}
      </main>
    </div>
  );
};

export default App;
