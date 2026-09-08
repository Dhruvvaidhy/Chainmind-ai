import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Plus, Star, Sparkles, Building2, Mail, Phone, MapPin, Edit3, Trash2 } from 'lucide-react';
import { supplierService, CreateSupplierParams } from '../services/supplierService';
import { aiService } from '../services/aiService';
import { Supplier } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

const supplierSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

export const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState('');
  const [analyzingSupplierName, setAnalyzingSupplierName] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
  });

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await supplierService.getSuppliers({
        search,
        status: statusFilter || undefined,
        page,
        size: 10,
      });
      setSuppliers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error('Failed to load suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [page, search, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingSupplier(null);
    reset({ name: '', contactPerson: '', email: '', phone: '', address: '', city: '', country: '', rating: 4.5 });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    reset({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || '',
      rating: supplier.rating,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, data as CreateSupplierParams);
      } else {
        await supplierService.createSupplier(data as CreateSupplierParams);
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (err) {
      console.error('Failed to save supplier', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierService.deleteSupplier(id);
        loadSuppliers();
      } catch (err) {
        console.error('Failed to delete supplier', err);
      }
    }
  };

  const handleRunAiAnalysis = async (supplier: Supplier) => {
    setAnalyzingSupplierName(supplier.name);
    setAiAnalysisText('Running AI performance analysis...');
    setAiAnalysisModalOpen(true);
    try {
      const text = await aiService.analyzeSupplier(supplier.id);
      setAiAnalysisText(text);
    } catch (err) {
      setAiAnalysisText('Failed to run AI analysis.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Suppliers Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage vendor contracts, performance scores, and risk profiles</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <SearchInput value={search} onChange={setSearch} placeholder="Search supplier by name, email..." />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : suppliers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Suppliers Found"
          description="No supplier records match your current filter criteria."
          actionLabel="Add Supplier"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Supplier Name</th>
                  <th className="px-6 py-3.5">Contact Person</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Rating</th>
                  <th className="px-6 py-3.5">Performance</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                          <Building2 className="w-4 h-4 text-brand-500" />
                        </div>
                        <div>
                          <span>{sup.name}</span>
                          <span className="text-[11px] text-slate-400 block font-normal">{sup.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {sup.contactPerson || 'N/A'}
                      <span className="text-[11px] text-slate-400 block">{sup.phone}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {sup.city && sup.country ? `${sup.city}, ${sup.country}` : 'Global'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{sup.rating?.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{sup.performanceScore?.toFixed(1)}</span>
                        <span className="text-[10px] text-emerald-500 font-semibold uppercase">/ 100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={sup.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRunAiAnalysis(sup)}
                          className="p-1.5 rounded-lg text-brand-500 hover:bg-brand-500/10 transition-colors"
                          title="Analyze with AI"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(sup)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sup.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete Supplier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={10}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create/Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier Details' : 'Create New Supplier'}
        subtitle="Fill in vendor details for organization procurement tracking"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Company Name</label>
            <input
              {...register('name')}
              type="text"
              placeholder="Global Tech Corp"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            />
            {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Contact Person</label>
              <input
                {...register('contactPerson')}
                type="text"
                placeholder="Hiroshi Tanaka"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="contact@company.com"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">City</label>
              <input
                {...register('city')}
                type="text"
                placeholder="Tokyo"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Country</label>
              <input
                {...register('country')}
                type="text"
                placeholder="Japan"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Rating (0 - 5)</label>
              <input
                {...register('rating')}
                type="number"
                step="0.1"
                placeholder="4.5"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-600/20"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Analysis Modal */}
      <Modal
        isOpen={aiAnalysisModalOpen}
        onClose={() => setAiAnalysisModalOpen(false)}
        title={`AI Supplier Analysis: ${analyzingSupplierName}`}
        subtitle="Automated performance & risk summary"
      >
        <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          {aiAnalysisText}
        </div>
      </Modal>
    </div>
  );
};
