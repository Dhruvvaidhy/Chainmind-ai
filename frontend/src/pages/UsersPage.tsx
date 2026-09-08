import React, { useEffect, useState } from 'react';
import { UserCog, Plus, Mail, Shield } from 'lucide-react';
import { apiClient } from '../services/api';
import { ApiResponse, User } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Return seeded organization users
    setUsers([
      { id: 1, organizationId: 1, organizationName: 'NovaTech Supply Solutions', organizationCode: 'NOVATECH', email: 'admin@novatech.com', firstName: 'Sarah', lastName: 'Jenkins', role: 'ORGANIZATION_ADMIN', active: true },
      { id: 2, organizationId: 1, organizationName: 'NovaTech Supply Solutions', organizationCode: 'NOVATECH', email: 'manager@novatech.com', firstName: 'David', lastName: 'Chen', role: 'SUPPLY_CHAIN_MANAGER', active: true },
      { id: 3, organizationId: 1, organizationName: 'NovaTech Supply Solutions', organizationCode: 'NOVATECH', email: 'warehouse@novatech.com', firstName: 'Marcus', lastName: 'Vance', role: 'WAREHOUSE_MANAGER', active: true },
      { id: 4, organizationId: 1, organizationName: 'NovaTech Supply Solutions', organizationCode: 'NOVATECH', email: 'analyst@novatech.com', firstName: 'Elena', lastName: 'Rostova', role: 'ANALYST', active: true },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UserCog className="w-6 h-6 text-brand-500" /> Organization User Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage user roles, team permissions, and access controls</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
            <tr>
              <th className="px-6 py-3.5">User Name</th>
              <th className="px-6 py-3.5">Email</th>
              <th className="px-6 py-3.5">Role</th>
              <th className="px-6 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{u.firstName} {u.lastName}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                <td className="px-6 py-4 font-semibold text-brand-500">{u.role}</td>
                <td className="px-6 py-4"><StatusBadge status={u.active ? 'ACTIVE' : 'INACTIVE'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
