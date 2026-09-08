import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Boxes, ArrowUpDown, History, ShieldAlert, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { inventoryService, StockAdjustmentParams } from '../services/inventoryService';
import { warehouseService } from '../services/warehouseService';
import { Inventory, StockMovement, Warehouse } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

const adjustmentSchema = z.object({
  inventoryId: z.coerce.number().min(1, 'Inventory record is required'),
  type: z.enum(['INCREASE', 'DECREASE', 'DAMAGE', 'CORRECTION']),
  quantity: z.coerce.number().min(1, 'Quantity must be positive'),
  notes: z.string().optional(),
});

type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

export const InventoryPage: React.FC = () => {
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Stock Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);

  // Movements Audit Modal
  const [movementsModalOpen, setMovementsModalOpen] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      type: 'INCREASE',
      quantity: 100,
    },
  });

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [invData, whData] = await Promise.all([
        inventoryService.getInventory({
          search,
          warehouseId: warehouseFilter,
          page,
          size: 10,
        }),
        warehouseService.getAllWarehouses(),
      ]);
      setInventoryList(invData.content);
      setTotalPages(invData.totalPages);
      setTotalElements(invData.totalElements);
      setWarehouses(whData);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [page, search, warehouseFilter]);

  const handleOpenAdjustModal = (inv: Inventory) => {
    setSelectedInventory(inv);
    setValue('inventoryId', inv.id);
    setValue('type', 'INCREASE');
    setValue('quantity', 50);
    setValue('notes', '');
    setAdjustModalOpen(true);
  };

  const onAdjustSubmit = async (data: AdjustmentFormValues) => {
    try {
      await inventoryService.adjustStock(data as StockAdjustmentParams);
      setAdjustModalOpen(false);
      loadInventory();
    } catch (err) {
      console.error('Failed to adjust stock', err);
    }
  };

  const handleViewMovements = async (inv?: Inventory) => {
    try {
      const data = await inventoryService.getStockMovements({
        inventoryId: inv?.id,
        size: 15,
      });
      setMovements(data.content);
      setMovementsModalOpen(true);
    } catch (err) {
      console.error('Failed to load movements', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Stock & Inventory Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock calculations formula: <strong>Available = Current - Reserved</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleViewMovements()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>Stock Audit Movements</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <SearchInput value={search} onChange={setSearch} placeholder="Search product SKU or name..." />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={warehouseFilter || ''}
            onChange={(e) => setWarehouseFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : inventoryList.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No Inventory Records"
          description="No stock levels exist for the selected search filters."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Product SKU / Name</th>
                  <th className="px-6 py-3.5">Warehouse Hub</th>
                  <th className="px-6 py-3.5">Current Stock</th>
                  <th className="px-6 py-3.5">Reserved</th>
                  <th className="px-6 py-3.5">Available Stock</th>
                  <th className="px-6 py-3.5">Stockout Risk</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inventoryList.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        <span>{inv.productName}</span>
                        <span className="text-[10px] font-mono text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-md inline-block ml-2">{inv.productSku}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{inv.warehouseName}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{inv.currentStock?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500">{inv.reservedStock?.toLocaleString()}</td>
                    <td className="px-6 py-4 font-extrabold text-brand-500">{inv.availableStock?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inv.stockoutRiskStatus || 'NORMAL'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenAdjustModal(inv)}
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-1"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" /> Adjust Stock
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

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={`Stock Adjustment: ${selectedInventory?.productName}`}
        subtitle="Record inventory increase, decrease, damage, or audit correction"
      >
        <form onSubmit={handleSubmit(onAdjustSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Adjustment Type</label>
            <select
              {...register('type')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
            >
              <option value="INCREASE">INCREASE (Add Stock)</option>
              <option value="DECREASE">DECREASE (Remove Stock)</option>
              <option value="DAMAGE">DAMAGE (Write-off Damaged Stock)</option>
              <option value="CORRECTION">CORRECTION (Inventory Audit Overwrite)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Quantity</label>
            <input
              {...register('quantity')}
              type="number"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            />
            {errors.quantity && <p className="text-red-400 text-[11px] mt-1">{errors.quantity.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Reason / Audit Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Quarterly inventory audit or shipment arrival notes..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAdjustModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-600/20"
            >
              Apply Stock Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Movements Audit Modal */}
      <Modal
        isOpen={movementsModalOpen}
        onClose={() => setMovementsModalOpen(false)}
        title="Stock Movements Audit Log"
        subtitle="Complete chronological history of stock adjustments and receipts"
        maxWidth="4xl"
      >
        <div className="space-y-4">
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Prev → New</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850">
                    <td className="px-4 py-3 text-slate-500">{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{m.productName}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{m.warehouseName}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.type} /></td>
                    <td className="px-4 py-3 font-bold text-brand-500">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</td>
                    <td className="px-4 py-3 text-slate-400">{m.previousQuantity} → <strong className="text-slate-900 dark:text-white">{m.newQuantity}</strong></td>
                    <td className="px-4 py-3 text-slate-500 truncate max-w-xs">{m.notes || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};
