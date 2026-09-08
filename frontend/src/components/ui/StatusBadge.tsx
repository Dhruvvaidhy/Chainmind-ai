import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'po' | 'shipment' | 'supplier' | 'risk' | 'stock' | 'health' | 'default';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'default' }) => {
  const getBadgeStyle = () => {
    const s = status.toUpperCase();

    // Risk levels
    if (s === 'CRITICAL') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    if (s === 'HIGH') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (s === 'MEDIUM') return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
    if (s === 'LOW') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

    // PO Statuses
    if (s === 'COMPLETED' || s === 'APPROVED' || s === 'CONFIRMED') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'IN_TRANSIT' || s === 'SUBMITTED' || s === 'OUT_FOR_DELIVERY') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (s === 'PARTIALLY_RECEIVED' || s === 'PICKED_UP') return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    if (s === 'DRAFT' || s === 'CREATED') return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    if (s === 'CANCELLED' || s === 'DELAYED') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';

    // Supplier / General
    if (s === 'ACTIVE' || s === 'EXCELLENT' || s === 'GOOD') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'AVERAGE' || s === 'FAIR') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (s === 'POOR' || s === 'UNDER_REVIEW') return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    if (s === 'INACTIVE' || s === 'DISCONTINUED') return 'bg-slate-500/10 text-slate-400 border-slate-500/20';

    // Stock
    if (s === 'HIGH_STOCKOUT_RISK') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    if (s === 'LOW_STOCK') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (s === 'NORMAL') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle()} uppercase tracking-wider`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {formatText(status)}
    </span>
  );
};
