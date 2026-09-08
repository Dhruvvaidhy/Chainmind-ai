import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, BrainCircuit, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loginUser, clearError } from '../features/auth/authSlice';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = (data: LoginFormValues) => {
    dispatch(loginUser(data));
  };

  const handleDemoFill = () => {
    setValue('email', 'admin@novatech.com');
    setValue('password', 'Admin@12345');
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100">
      {/* Left Column: Premium Branding & Feature Overview */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 p-12 flex-col justify-between border-r border-slate-800 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">ChainMind <span className="text-brand-400">AI</span></span>
            <p className="text-xs text-slate-400 font-medium">Supply Chain Intelligence Platform</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="my-auto space-y-6 relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> Autonomous Risk & Inventory Analytics
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Predict. Monitor. Optimize.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            Gain end-to-end operational visibility with AI-driven risk scoring, automatic stockout detection, supplier benchmarking, and real-time shipment monitoring.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Explainable Rule-Based Shipment Risk Scoring',
              'Automated Stockout & Safety Stock Monitoring',
              'Statistical Demand Forecasting & Trend Analytics',
              'AI-Assisted Operational Insights & Assistant',
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 border-t border-slate-800/80 pt-6 relative z-10">
          © 2026 ChainMind AI Systems. All rights reserved. Built for modern enterprise supply chains.
        </div>
      </div>

      {/* Right Column: Clean Authentication Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-slate-900 md:bg-slate-950">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">ChainMind <span className="text-brand-400">AI</span></span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Sign in to platform</h2>
            <p className="text-sm text-slate-400">Enter your credentials to access your organization dashboard</p>
          </div>

          {/* Demo Shortcut Banner */}
          <div className="bg-brand-950/60 border border-brand-800/50 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="text-xs">
              <span className="font-semibold text-brand-300 block">Default Demo Credentials</span>
              <span className="text-slate-400">admin@novatech.com • Admin@12345</span>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-colors flex-shrink-0 shadow-sm"
            >
              Fill Demo Login
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Authentication Error</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@company.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-brand-500'
                  } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs text-slate-500 hover:text-slate-400 cursor-pointer">Forgot password?</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-brand-500'
                  } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all`}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4 text-sm text-slate-400">
            Don't have an organization workspace?{' '}
            <Link to="/register" className="text-brand-400 font-semibold hover:underline">
              Register Organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
