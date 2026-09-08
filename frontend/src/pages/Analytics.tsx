import React, { useEffect, useState } from 'react';
import { BarChart3, Activity, Download, TrendingUp, ShieldCheck, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { productService } from '../services/productService';
import { SupplyChainHealthResult, DemandForecastResult, Product } from '../types';

export const Analytics: React.FC = () => {
  const [health, setHealth] = useState<SupplyChainHealthResult | null>(null);
  const [forecast, setForecast] = useState<DemandForecastResult | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [healthData, prodData] = await Promise.all([
        analyticsService.getHealthScore(),
        productService.getAllProducts(),
      ]);
      setHealth(healthData);
      setProducts(prodData);
      if (prodData.length > 0) {
        const pId = prodData[0].id;
        setSelectedProductId(pId);
        const fcData = await analyticsService.getDemandForecast(pId);
        setForecast(fcData);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleProductChange = async (pId: number) => {
    setSelectedProductId(pId);
    try {
      const fcData = await analyticsService.getDemandForecast(pId);
      setForecast(fcData);
    } catch (err) {
      console.error('Failed to forecast demand', err);
    }
  };

  const handleExportCsv = () => {
    if (!forecast) return;
    const rows = [
      ['Month', 'Quantity'],
      ...forecast.historicalDemand.map((h) => [h.month, h.quantity]),
      ...forecast.forecastData.map((f) => [f.month, f.predictedQuantity]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `demand_forecast_product_${selectedProductId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !health) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading analytics intelligence...</span>
      </div>
    );
  }

  // Combine historical & forecast chart data
  const combinedChartData = [
    ...(forecast?.historicalDemand.map((h) => ({ month: h.month, demand: h.quantity, type: 'Historical' })) || []),
    ...(forecast?.forecastData.map((f) => ({ month: f.month, demand: f.predictedQuantity, type: 'Forecast' })) || []),
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Supply Chain Intelligence & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Composite health calculations and statistical demand forecasting</p>
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Forecast CSV</span>
        </button>
      </div>

      {/* Health Score Breakdown Grid */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Organization Supply Chain Health Index</h3>
              <span className="text-xs text-slate-500">Overall score: <strong className="text-brand-500">{health.overallHealthScore} / 100</strong> ({health.healthLevel})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Supplier Performance (25%)</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{health.supplierPerformanceScore}</div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${health.supplierPerformanceScore}%` }}></div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Shipment On-Time Rate (25%)</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{health.shipmentPerformanceScore}</div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${health.shipmentPerformanceScore}%` }}></div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Inventory Health (25%)</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{health.inventoryHealthScore}</div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${health.inventoryHealthScore}%` }}></div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Demand Stability (25%)</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{health.demandStabilityScore}</div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${health.demandStabilityScore}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Demand Forecasting Engine Section */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Statistical Demand Forecasting Engine</h3>
            <p className="text-xs text-slate-500 mt-0.5">Weighted moving average & trend projection models</p>
          </div>
          <div className="w-full sm:w-64">
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
        </div>

        {forecast && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-400 block">Predicted Next Month Demand</span>
                <span className="text-2xl font-bold text-brand-500">{forecast.predictedDemand} units</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-400 block">Demand Trend</span>
                <span className="text-2xl font-bold text-emerald-500 uppercase">{forecast.trend}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-400 block">Recommended Stock Level</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{forecast.recommendedStockLevel} units</span>
              </div>
            </div>

            {/* Demand Chart */}
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedChartData}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="demand" stroke="#0c8ee9" fill="#0c8ee9" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
