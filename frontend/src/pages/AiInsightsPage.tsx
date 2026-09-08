import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { aiService } from '../services/aiService';
import { AIInsight } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';

export const AiInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiService.getInsights().then(setInsights).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-500" /> AI Operational Risk Insights
        </h1>
        <p className="text-xs text-slate-500 mt-1">Autonomous risk detection, stockout warnings, and action recommendations</p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      ) : insights.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Active Insights"
          description="All operational metrics are within normal parameters."
        />
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{insight.title}</h3>
                    <span className="text-[11px] text-slate-400">Type: {insight.type} • Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <StatusBadge status={insight.severity} />
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{insight.description}</p>

              {insight.recommendedAction && (
                <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-xs text-brand-300 font-medium">
                  💡 <strong>Recommended Action:</strong> {insight.recommendedAction}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
