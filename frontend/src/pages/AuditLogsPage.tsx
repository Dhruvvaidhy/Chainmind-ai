import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Shield } from 'lucide-react';
import { apiClient } from '../services/api';
import { ApiResponse, PagedResponse, AuditLog } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<ApiResponse<PagedResponse<AuditLog>>>('/audit-logs', {
        params: { page, size: 15 },
      });
      setLogs(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
      setTotalElements(response.data.data.totalElements);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-brand-500" /> Administrative Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-1">Immutable security log of user actions, status updates, and authentication events</p>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">User Email</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Entity</th>
                  <th className="px-6 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                    <td className="px-6 py-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{log.userEmail || 'System'}</td>
                    <td className="px-6 py-4"><StatusBadge status={log.action} /></td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{log.entity} #{log.entityId || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-sm">{log.details || 'No additional detail'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={15}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
