import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Warehouse as WarehouseIcon, Plus, MapPin, User, Boxes, Edit3, Trash2 } from 'lucide-react';
import { warehouseService, CreateWarehouseParams } from '../services/warehouseService';
import { Warehouse } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';

const warehouseSchema = z.object({
  name: z.string().min(2, 'Warehouse name is required'),
  code: z.string().min(2, 'Warehouse code is required'),
  location: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  managerName: z.string().optional(),
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

export const Warehouses: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
  });

  const loadWarehouses = async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getAllWarehouses();
      setWarehouses(data);
    } catch (err) {
      console.error('Failed to load warehouses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingWarehouse(null);
    reset({ name: '', code: '', location: '', city: '', country: '', capacity: 20000, managerName: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    reset({
      name: wh.name,
      code: wh.code,
      location: wh.location || '',
      city: wh.city || '',
      country: wh.country || '',
      capacity: wh.capacity,
      managerName: wh.managerName || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: WarehouseFormValues) => {
    try {
      if (editingWarehouse) {
        await warehouseService.updateWarehouse(editingWarehouse.id, data as CreateWarehouseParams);
      } else {
        await warehouseService.createWarehouse(data as CreateWarehouseParams);
      }
      setIsModalOpen(false);
      loadWarehouses();
    } catch (err) {
      console.error('Failed to save warehouse', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await warehouseService.deleteWarehouse(id);
        loadWarehouses();
      } catch (err) {
        console.error('Failed to delete warehouse', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Warehouse Logistics Hubs</h1>
          <p className="text-xs text-slate-500 mt-1">Manage global distribution facilities, max capacities, and stock utilization</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Warehouse</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      ) : warehouses.length === 0 ? (
        <EmptyState
          icon={WarehouseIcon}
          title="No Warehouses Configured"
          description="Register distribution hubs to start tracking localized stock."
          actionLabel="Add Warehouse"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((wh) => (
            <div
              key={wh.id}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                      <WarehouseIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{wh.name}</h3>
                      <span className="text-[10px] font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md inline-block mt-0.5">{wh.code}</span>
                    </div>
                  </div>
                  <StatusBadge status={wh.status} />
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{wh.city ? `${wh.city}, ${wh.country}` : 'Global Location'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Manager: <strong className="text-slate-900 dark:text-slate-200">{wh.managerName || 'Unassigned'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Capacity Visualization Card */}
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Capacity Utilization</span>
                  <span className="font-bold text-slate-900 dark:text-white">{wh.utilizationPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (wh.utilizationPercentage || 0) > 85
                        ? 'bg-rose-500'
                        : (wh.utilizationPercentage || 0) > 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${wh.utilizationPercentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Used: {wh.usedCapacity?.toLocaleString()} units</span>
                  <span>Max: {wh.capacity?.toLocaleString()} units</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleOpenEditModal(wh)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(wh.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? 'Edit Warehouse' : 'Create New Warehouse'}
        subtitle="Logistics distribution hub specs"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Warehouse Name</label>
              <input
                {...register('name')}
                type="text"
                placeholder="Main Distribution Hub"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
              {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Warehouse Code</label>
              <input
                {...register('code')}
                type="text"
                placeholder="WH-CHI-01"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white uppercase"
              />
              {errors.code && <p className="text-red-400 text-[11px] mt-1">{errors.code.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">City</label>
              <input
                {...register('city')}
                type="text"
                placeholder="Chicago"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Country</label>
              <input
                {...register('country')}
                type="text"
                placeholder="USA"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Max Capacity</label>
              <input
                {...register('capacity')}
                type="number"
                placeholder="25000"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Warehouse Manager</label>
            <input
              {...register('managerName')}
              type="text"
              placeholder="Marcus Vance"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            />
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
              Save Warehouse
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
