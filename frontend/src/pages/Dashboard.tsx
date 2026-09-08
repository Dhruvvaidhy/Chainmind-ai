import React, { useEffect, useState } from 'react';
import {
  Users,
  Truck,
  AlertTriangle,
  DollarSign,
  PackageX,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { dashboardService, ExecutiveKpis, DashboardCharts } from '../services/dashboardService';
import { aiService } from '../services/aiService';
import { shipmentService } from '../services/shipmentService';
import { AIInsight, Shipment } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CardSkeleton } from '../components/ui/Skeleton';

export const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<ExecutiveKpis | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [kpiData, chartData, insightData, shipmentData] = await Promise.all([
        dashboardService.getKpis(),
        dashboardService.getCharts(),
        aiService.getInsights(),
        shipmentService.getShipments({ size: 5 }),
      ]);
      setKpis(kpiData);
      setCharts(chartData);
      setInsights(insightData);
      setRecentShipments(shipmentData.content);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading || !kpis || !charts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time supply chain operational metrics & intelligence summary</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Total Suppliers */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Suppliers</span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.totalSuppliers}</span>
            <span className="text-[11px] text-emerald-500 font-semibold block mt-0.5">Active Partners</span>
          </div>
        </div>

        {/* Active Shipments */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Shipments</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.activeShipments}</span>
            <span className="text-[11px] text-blue-500 font-semibold block mt-0.5">En-Route Transit</span>
          </div>
        </div>

        {/* High Risk Shipments */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">High Risk</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-rose-500">{kpis.highRiskShipments}</span>
            <span className="text-[11px] text-rose-400 font-semibold block mt-0.5">Delay Flagged</span>
          </div>
        </div>

        {/* Total Inventory Value */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Inventory Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 dark:text-white truncate block">{formatCurrency(kpis.totalInventoryValue)}</span>
            <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Asset Evaluation</span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <PackageX className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-amber-500">{kpis.lowStockProducts}</span>
            <span className="text-[11px] text-amber-400 font-semibold block mt-0.5">Below Threshold</span>
          </div>
        </div>

        {/* Health Score Card */}
        <div className="p-5 bg-gradient-to-br from-brand-900 to-slate-900 border border-brand-800/50 rounded-2xl shadow-md text-white space-y-3">
          <div className="flex items-center justify-between text-brand-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Supply Chain Health</span>
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{kpis.healthScore.overallHealthScore}</span>
              <span className="text-xs text-brand-300 font-semibold uppercase">{kpis.healthScore.healthLevel}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-brand-400 h-full rounded-full transition-all"
                style={{ width: `${kpis.healthScore.overallHealthScore}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Shipment Status Distribution Pie */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Shipment Status Distribution</h3>
          <p className="text-xs text-slate-500 mb-6">Current breakdown across logistics stages</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.shipmentStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.shipmentStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {charts.shipmentStatusDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name}: <strong className="text-slate-900 dark:text-white">{item.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Performance Bar Chart */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Monthly Delivery Performance</h3>
          <p className="text-xs text-slate-500 mb-6">Comparison of on-time vs delayed shipments over last 5 months</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyShipmentPerformance}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="onTime" name="On Time" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delayed" name="Delayed" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Operational Insights & Recent Shipments Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* AI Operational Insights */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Operational Insights</h3>
            </div>
            <span className="text-xs text-brand-400 font-semibold">Autonomous Alerts</span>
          </div>

          <div className="space-y-3">
            {insights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{insight.title}</span>
                  <StatusBadge status={insight.severity} />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{insight.description}</p>
                {insight.recommendedAction && (
                  <div className="text-[11px] text-brand-400 bg-brand-500/10 p-2 rounded-lg font-medium">
                    💡 <strong>Action:</strong> {insight.recommendedAction}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Active Shipments */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Active Shipments</h3>
            <a href="/shipments" className="text-xs font-semibold text-brand-500 hover:underline inline-flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            {recentShipments.map((shp) => (
              <div
                key={shp.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{shp.shipmentNumber}</span>
                  <span className="text-slate-500">{shp.carrier} • {shp.origin} → {shp.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={shp.status} />
                  <StatusBadge status={shp.riskLevel} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
