import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Plus, DollarSign, Clock, ShieldAlert, Edit3, Trash2 } from 'lucide-react';
import { productService, CreateProductParams } from '../services/productService';
import { supplierService } from '../services/supplierService';
import { Product, ProductCategory, Supplier } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

const productSchema = z.object({
  supplierId: z.coerce.number().min(1, 'Supplier is required'),
  categoryId: z.coerce.number().optional(),
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().default('PCS'),
  purchasePrice: z.coerce.number().min(0, 'Price cannot be negative'),
  leadTimeDays: z.coerce.number().default(7),
  reorderLevel: z.coerce.number().default(50),
  safetyStock: z.coerce.number().default(20),
});

type ProductFormValues = z.infer<typeof productSchema>;

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<number | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [prodData, suppData, catData] = await Promise.all([
        productService.getProducts({
          search,
          supplierId: supplierFilter,
          categoryId: categoryFilter,
          page,
          size: 10,
        }),
        supplierService.getAllSuppliers(),
        productService.getCategories(),
      ]);
      setProducts(prodData.content);
      setTotalPages(prodData.totalPages);
      setTotalElements(prodData.totalElements);
      setSuppliers(suppData);
      setCategories(catData);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, search, supplierFilter, categoryFilter]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    reset({
      supplierId: suppliers[0]?.id || 1,
      name: '',
      sku: '',
      unit: 'PCS',
      purchasePrice: 10.0,
      leadTimeDays: 7,
      reorderLevel: 50,
      safetyStock: 20,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    reset({
      supplierId: product.supplierId,
      categoryId: product.categoryId,
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      unit: product.unit,
      purchasePrice: product.purchasePrice,
      leadTimeDays: product.leadTimeDays,
      reorderLevel: product.reorderLevel,
      safetyStock: product.safetyStock,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, data as CreateProductParams);
      } else {
        await productService.createProduct(data as CreateProductParams);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      console.error('Failed to save product', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        loadProducts();
      } catch (err) {
        console.error('Failed to delete product', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">Manage SKUs, lead times, safety stocks, and cost evaluations</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <SearchInput value={search} onChange={setSearch} placeholder="Search product name or SKU..." />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={supplierFilter || ''}
            onChange={(e) => setSupplierFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products Found"
          description="No product records match your current catalog search."
          actionLabel="Add Product"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">SKU / Product Name</th>
                  <th className="px-6 py-3.5">Supplier</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Unit Price</th>
                  <th className="px-6 py-3.5">Lead Time</th>
                  <th className="px-6 py-3.5">Thresholds</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((prd) => (
                  <tr key={prd.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        <span>{prd.name}</span>
                        <span className="text-[10px] font-mono text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-md inline-block ml-2">{prd.sku}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{prd.supplierName}</td>
                    <td className="px-6 py-4 text-slate-500">{prd.categoryName || 'General'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">${prd.purchasePrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {prd.leadTimeDays} days</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      Reorder: <strong className="text-slate-900 dark:text-white">{prd.reorderLevel}</strong> | Safety: <strong className="text-slate-900 dark:text-white">{prd.safetyStock}</strong>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prd)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prd.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        subtitle="Catalog SKU specification"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Product Name</label>
            <input
              {...register('name')}
              type="text"
              placeholder="ARM Cortex Microcontroller"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            />
            {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Supplier</label>
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
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Purchase Price ($)</label>
              <input
                {...register('purchasePrice')}
                type="number"
                step="0.01"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Lead Time (Days)</label>
              <input
                {...register('leadTimeDays')}
                type="number"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Reorder Level</label>
              <input
                {...register('reorderLevel')}
                type="number"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Safety Stock</label>
              <input
                {...register('safetyStock')}
                type="number"
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
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
