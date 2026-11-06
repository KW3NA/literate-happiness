import React, { useState } from 'react';

interface SettingsProps {
  isDark?: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ isDark = false }) => {
  const [nationalIdValidation, setNationalIdValidation] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={`p-8 space-y-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="border-b pb-6 border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure identity verification rules, regional caching, and platform notifications
        </p>
      </div>

      <div className="max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800">
          <div>
            <p className="font-bold text-sm">South African National ID Luhn Verification</p>
            <p className="text-xs text-gray-500">Require 13-digit valid ID checksum on citizen registration</p>
          </div>
          <input
            type="checkbox"
            checked={nationalIdValidation}
            onChange={e => setNationalIdValidation(e.target.checked)}
            className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800">
          <div>
            <p className="font-bold text-sm">Offline Learning Mode Support</p>
            <p className="text-xs text-gray-500">Allow citizen mobile app to cache course modules in indexed storage</p>
          </div>
          <input
            type="checkbox"
            checked={offlineSync}
            onChange={e => setOfflineSync(e.target.checked)}
            className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800">
          <div>
            <p className="font-bold text-sm">Practitioner Verification Email Alerts</p>
            <p className="text-xs text-gray-500">Notify administrators immediately when new practitioner credentials are uploaded</p>
          </div>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={e => setEmailAlerts(e.target.checked)}
            className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <i className="fas fa-check"></i> Preferences saved successfully
            </span>
          ) : <span></span>}
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
