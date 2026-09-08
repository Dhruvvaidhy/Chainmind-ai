import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingCart, Plus, CheckCircle2, Clock, PackageCheck, AlertCircle, Trash2, Eye } from 'lucide-react';
import { purchaseOrderService, CreatePOParams, ReceiveItemsParams } from '../services/purchaseOrderService';
import { supplierService } from '../services/supplierService';
import { productService } from '../services/productService';
import { warehouseService } from '../services/warehouseService';
import { PurchaseOrder, Supplier, Product, Warehouse } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

const poSchema = z.object({
  supplierId: z.coerce.number().min(1, 'Supplier is required'),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.coerce.number().min(1, 'Product is required'),
      quantity: z.coerce.number().min(1, 'Qty must be at least 1'),
      unitPrice: z.coerce.number().min(0, 'Price must be positive'),
    })
  ).min(1, 'At least one item required'),
});

type POFormValues = z.infer<typeof poSchema>;

export const PurchaseOrders: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  // Receiving state
  const [receiveWarehouseId, setReceiveWarehouseId] = useState<number>(0);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<number, number>>({});

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<POFormValues>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      items: [{ productId: 1, quantity: 100, unitPrice: 15.0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [poData, suppData, prodData, whData] = await Promise.all([
        purchaseOrderService.getPurchaseOrders({
          search,
          status: statusFilter || undefined,
          page,
          size: 10,
        }),
        supplierService.getAllSuppliers(),
        productService.getAllProducts(),
        warehouseService.getAllWarehouses(),
      ]);
      setOrders(poData.content);
      setTotalPages(poData.totalPages);
      setTotalElements(poData.totalElements);
      setSuppliers(suppData);
      setProducts(prodData);
      setWarehouses(whData);
      if (whData.length > 0) setReceiveWarehouseId(whData[0].id);
    } catch (err) {
      console.error('Failed to load purchase orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, search, statusFilter]);

  const handleOpenCreateModal = () => {
    reset({
      supplierId: suppliers[0]?.id || 1,
      notes: '',
      items: [{ productId: products[0]?.id || 1, quantity: 100, unitPrice: 10.0 }],
    });
    setCreateModalOpen(true);
  };

  const onSubmitCreate = async (data: POFormValues) => {
    try {
      await purchaseOrderService.createPurchaseOrder(data as CreatePOParams);
      setCreateModalOpen(false);
      loadOrders();
    } catch (err) {
      console.error('Failed to create purchase order', err);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await purchaseOrderService.updateStatus(id, newStatus);
      loadOrders();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleOpenReceiveModal = (po: PurchaseOrder) => {
    setSelectedPo(po);
    const initialQtys: Record<number, number> = {};
    po.items.forEach((item) => {
      if (item.id) {
        initialQtys[item.id] = Math.max(0, item.quantity - (item.receivedQuantity || 0));
      }
    });
    setReceiveQuantities(initialQtys);
    setReceiveModalOpen(true);
  };

  const handleConfirmReceive = async () => {
    if (!selectedPo || !receiveWarehouseId) return;
    try {
      const itemsPayload = Object.entries(receiveQuantities).map(([itemId, qty]) => ({
        itemId: Number(itemId),
        receivedQuantity: Number(qty),
      }));

      await purchaseOrderService.receiveItems(selectedPo.id, {
        warehouseId: receiveWarehouseId,
        items: itemsPayload,
      });

      setReceiveModalOpen(false);
      loadOrders();
    } catch (err) {
      console.error('Failed to receive items', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Purchase Order Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage vendor PO lifecycles, approval workflows, and automated inventory receiving</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <SearchInput value={search} onChange={setSearch} placeholder="Search PO number or supplier..." />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PARTIALLY_RECEIVED">PARTIALLY RECEIVED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No Purchase Orders Found"
          description="Create a purchase order to start tracking procurement fulfillments."
          actionLabel="Create PO"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">PO Number</th>
                  <th className="px-6 py-3.5">Supplier</th>
                  <th className="px-6 py-3.5">Order Date</th>
                  <th className="px-6 py-3.5">Expected Delivery</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-brand-500">{po.poNumber}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{po.supplierName}</td>
                    <td className="px-6 py-4 text-slate-500">{po.orderDate}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{po.expectedDeliveryDate || 'N/A'}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">${po.totalAmount?.toFixed(2)}</td>
                    <td className="px-6 py-4"><StatusBadge status={po.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {po.status === 'DRAFT' && (
                          <button
                            onClick={() => handleStatusChange(po.id, 'SUBMITTED')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-[11px]"
                          >
                            Submit
                          </button>
                        )}
                        {po.status === 'SUBMITTED' && (
                          <button
                            onClick={() => handleStatusChange(po.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-[11px]"
                          >
                            Approve
                          </button>
                        )}
                        {po.status === 'APPROVED' && (
                          <button
                            onClick={() => handleStatusChange(po.id, 'CONFIRMED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-[11px]"
                          >
                            Confirm
                          </button>
                        )}
                        {(po.status === 'CONFIRMED' || po.status === 'PARTIALLY_RECEIVED') && (
                          <button
                            onClick={() => handleOpenReceiveModal(po)}
                            className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                          >
                            <PackageCheck className="w-3.5 h-3.5" /> Receive Items
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedPo(po); setViewModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View PO Items"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Purchase Order"
        subtitle="Generate procurement requisition for approved supplier"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Select Supplier</label>
              <select
                {...register('supplierId')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Expected Delivery Date</label>
              <input
                {...register('expectedDeliveryDate')}
                type="date"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase">Order Line Items</label>
              <button
                type="button"
                onClick={() => append({ productId: products[0]?.id || 1, quantity: 50, unitPrice: 10.0 })}
                className="text-xs text-brand-500 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item Line
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex-1">
                  <select
                    {...register(`items.${index}.productId` as const)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <input
                    {...register(`items.${index}.quantity` as const)}
                    type="number"
                    placeholder="Qty"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div className="w-28">
                  <input
                    {...register(`items.${index}.unitPrice` as const)}
                    type="number"
                    step="0.01"
                    placeholder="Price $"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
                  />
                </div>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-600/20"
            >
              Submit Order Requisition
            </button>
          </div>
        </form>
      </Modal>

      {/* Receive Items Modal */}
      <Modal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        title={`Receive Items for ${selectedPo?.poNumber}`}
        subtitle="Specify destination warehouse and received quantities"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Destination Receiving Warehouse</label>
            <select
              value={receiveWarehouseId}
              onChange={(e) => setReceiveWarehouseId(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase">Item Quantities to Receive</label>
            {selectedPo?.items.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{item.productName}</span>
                  <span className="text-slate-500">Ordered: {item.quantity} | Previously Received: {item.receivedQuantity || 0}</span>
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    value={item.id ? receiveQuantities[item.id] || 0 : 0}
                    onChange={(e) => {
                      if (item.id) {
                        setReceiveQuantities({ ...receiveQuantities, [item.id]: Number(e.target.value) });
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-brand-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setReceiveModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReceive}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-600/20"
            >
              Confirm Receiving & Update Inventory
            </button>
          </div>
        </div>
      </Modal>

      {/* View PO Items Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`Purchase Order Items: ${selectedPo?.poNumber}`}
        subtitle={`Supplier: ${selectedPo?.supplierName}`}
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Subtotal:</span>
              <span className="font-semibold text-slate-900 dark:text-white">${selectedPo?.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tax (10%):</span>
              <span className="font-semibold text-slate-900 dark:text-white">${selectedPo?.tax?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Total Amount:</span>
              <span className="text-brand-500">${selectedPo?.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            {selectedPo?.items.map((item) => (
              <div key={item.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{item.productName}</span>
                  <span className="text-slate-500">SKU: {item.productSku} • Price: ${item.unitPrice}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-brand-500 block">Qty: {item.quantity}</span>
                  <span className="text-slate-400 text-[11px]">Received: {item.receivedQuantity || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
