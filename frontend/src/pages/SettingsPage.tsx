import React from 'react';
import { Settings, Building2, Shield, Key } from 'lucide-react';
import { useAppSelector } from '../app/hooks';

export const SettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-500" /> Organization Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage workspace credentials, integration preferences, and profile defaults</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{user?.organizationName}</h3>
            <span className="text-xs text-slate-500">Organization Code: <strong className="text-brand-500">{user?.organizationCode}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold uppercase">Administrator Email</span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{user?.email}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold uppercase">Assigned Role</span>
            <p className="font-bold text-brand-500 text-sm">{user?.role}</p>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <Key className="w-4 h-4" /> AI Integration Key Configuration
          </div>
          <p>AI provider keys are managed securely on the server via environment variables (<code>AI_API_KEY</code>, <code>AI_PROVIDER</code>).</p>
        </div>
      </div>
    </div>
  );
};
