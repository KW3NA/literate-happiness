import React, { useState } from 'react';
import { PractitionerDashboard } from './components/PractitionerDashboard';
import { PractitionerCourses } from './components/PractitionerCourses';
import { Opportunities } from './components/Opportunities';
import { VerifyDocuments } from './components/VerifyDocuments';

export type NavTab = 'Dashboard' | 'Courses' | 'Opportunities' | 'Verify Documents';

const navIcons: Record<NavTab, string> = {
  'Dashboard': 'fas fa-chart-pie',
  'Courses': 'fas fa-book-reader',
  'Opportunities': 'fas fa-briefcase',
  'Verify Documents': 'fas fa-shield-alt',
};

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Authenticated practitioner context
  const practitionerName = 'Thabo Nkosi';
  const practitionerEmail = 'thabo@eliteracy.org.za';

  const tabs: NavTab[] = ['Dashboard', 'Courses', 'Opportunities', 'Verify Documents'];

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-neutral-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
                  <span className="block text-[10px] uppercase font-bold text-orange-600 tracking-wider">Practitioner</span>
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

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {tabs.map((tab) => {
              const active = currentTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-neutral-800/80 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                  title={tab}
                >
                  <i className={`${navIcons[tab]} text-base w-5 text-center`}></i>
                  {!sidebarCollapsed && <span>{tab}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility */}
        <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <i className={`fas ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon text-gray-600'} w-5 text-center`}></i>
            {!sidebarCollapsed && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <div className="px-3.5 py-2 text-[10px] text-gray-400">
            {!sidebarCollapsed && <span>Supabase Connected</span>}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {currentTab === 'Dashboard' && (
          <PractitionerDashboard
            isDarkMode={isDarkMode}
            practitionerName={practitionerName}
            practitionerEmail={practitionerEmail}
            onNavigate={(tab) => setCurrentTab(tab as NavTab)}
          />
        )}
        {currentTab === 'Courses' && (
          <PractitionerCourses
            isDarkMode={isDarkMode}
            practitionerName={practitionerName}
          />
        )}
        {currentTab === 'Opportunities' && (
          <Opportunities
            isDarkMode={isDarkMode}
          />
        )}
        {currentTab === 'Verify Documents' && (
          <VerifyDocuments
            isDarkMode={isDarkMode}
            practitionerEmail={practitionerEmail}
          />
        )}
      </main>
    </div>
  );
};

export default App;
