import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, Plus, ShieldAlert, MapPin, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Activity } from 'lucide-react';
import { shipmentService, CreateShipmentParams, AddShipmentEventParams } from '../services/shipmentService';
import { purchaseOrderService } from '../services/purchaseOrderService';
import { Shipment, ShipmentRiskResult, PurchaseOrder } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/ui/Pagination';
import { SearchInput } from '../components/ui/SearchInput';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

const shipmentSchema = z.object({
  purchaseOrderId: z.coerce.number().optional(),
  origin: z.string().min(2, 'Origin is required'),
  destination: z.string().min(2, 'Destination is required'),
  carrier: z.string().min(2, 'Carrier is required'),
  trackingNumber: z.string().optional(),
});

type ShipmentFormValues = z.infer<typeof shipmentSchema>;

export const Shipments: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<ShipmentRiskResult | null>(null);

  // Event form
  const [newEventStatus, setNewEventStatus] = useState('IN_TRANSIT');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
  });

  const loadShipments = async () => {
    setLoading(true);
    try {
      const [shpData, poData] = await Promise.all([
        shipmentService.getShipments({
          search,
          status: statusFilter || undefined,
          riskLevel: riskFilter || undefined,
          page,
          size: 10,
        }),
        purchaseOrderService.getPurchaseOrders(),
      ]);
      setShipments(shpData.content);
      setTotalPages(shpData.totalPages);
      setTotalElements(shpData.totalElements);
      setPurchaseOrders(poData.content);
    } catch (err) {
      console.error('Failed to load shipments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, [page, search, statusFilter, riskFilter]);

  const handleOpenCreateModal = () => {
    reset({
      origin: 'Tokyo, Japan',
      destination: 'Chicago, USA',
      carrier: 'DHL Express',
    });
    setCreateModalOpen(true);
  };

  const onSubmitCreate = async (data: ShipmentFormValues) => {
    try {
      await shipmentService.createShipment(data as CreateShipmentParams);
      setCreateModalOpen(false);
      loadShipments();
    } catch (err) {
      console.error('Failed to create shipment', err);
    }
  };

  const handleOpenRiskModal = async (shp: Shipment) => {
    setSelectedShipment(shp);
    try {
      const risk = await shipmentService.getRiskAnalysis(shp.id);
      setRiskAnalysis(risk);
      setRiskModalOpen(true);
    } catch (err) {
      console.error('Failed to load risk analysis', err);
    }
  };

  const handleOpenAddEventModal = (shp: Shipment) => {
    setSelectedShipment(shp);
    setNewEventStatus('IN_TRANSIT');
    setNewEventLocation(shp.destination);
    setNewEventDescription('Shipment in transit via logistics hub');
    setAddEventModalOpen(true);
  };

  const handleAddEventSubmit = async () => {
    if (!selectedShipment) return;
    try {
      await shipmentService.addEvent(selectedShipment.id, {
        status: newEventStatus,
        location: newEventLocation,
        description: newEventDescription,
      });
      setAddEventModalOpen(false);
      loadShipments();
    } catch (err) {
      console.error('Failed to add event', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Shipment Tracking & Delay Risk Engine</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-factor rule-based risk calculation & real-time tracking events timeline</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Shipment Booking</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <SearchInput value={search} onChange={setSearch} placeholder="Search tracking # or carrier..." />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="CREATED">CREATED</option>
            <option value="PICKED_UP">PICKED UP</option>
            <option value="IN_TRANSIT">IN TRANSIT</option>
            <option value="DELAYED">DELAYED</option>
            <option value="DELIVERED">DELIVERED</option>
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="">All Delay Risk Levels</option>
            <option value="LOW">LOW RISK</option>
            <option value="MEDIUM">MEDIUM RISK</option>
            <option value="HIGH">HIGH RISK</option>
            <option value="CRITICAL">CRITICAL RISK</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : shipments.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No Shipments Found"
          description="Book a new shipment to start tracking transit milestones."
          actionLabel="Create Shipment"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Shipment #</th>
                  <th className="px-6 py-3.5">Route (Origin → Dest)</th>
                  <th className="px-6 py-3.5">Carrier / Tracking</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Delay Risk Score</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {shipments.map((shp) => (
                  <tr key={shp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-brand-500">{shp.shipmentNumber}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-semibold">
                      {shp.origin} <span className="text-slate-400">→</span> {shp.destination}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {shp.carrier}
                      <span className="text-[10px] font-mono text-slate-400 block">{shp.trackingNumber}</span>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={shp.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenRiskModal(shp)}
                          className="hover:underline flex items-center gap-1.5"
                        >
                          <StatusBadge status={shp.riskLevel} />
                          <span className="font-extrabold text-slate-900 dark:text-white">({shp.delayRiskScore?.toFixed(1)})</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedShipment(shp); setTimelineModalOpen(true); }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold"
                        >
                          Timeline
                        </button>
                        <button
                          onClick={() => handleOpenAddEventModal(shp)}
                          className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-[11px] font-semibold"
                        >
                          + Event
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

      {/* Create Shipment Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="New Shipment Booking"
        subtitle="Schedule freight carrier dispatch"
      >
        <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Origin City/Port</label>
              <input
                {...register('origin')}
                type="text"
                placeholder="Tokyo, Japan"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Destination Hub</label>
              <input
                {...register('destination')}
                type="text"
                placeholder="Chicago, USA"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Carrier Name</label>
              <input
                {...register('carrier')}
                type="text"
                placeholder="DHL Express / Maersk Line"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tracking Number</label>
              <input
                {...register('trackingNumber')}
                type="text"
                placeholder="DHL-987123412"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
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
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>

      {/* Delay Risk Score Factor Breakdown Modal */}
      <Modal
        isOpen={riskModalOpen}
        onClose={() => setRiskModalOpen(false)}
        title={`Shipment Risk Score: ${riskAnalysis?.riskScore} (${riskAnalysis?.riskLevel})`}
        subtitle="Explainable rule-based risk calculation engine"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <p className="font-semibold text-slate-900 dark:text-white">{riskAnalysis?.explanation}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">Risk Factor Breakdown (Points Contribution)</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span>Supplier Historical Delay Risk (30% weight):</span>
                <strong className="text-brand-500">{riskAnalysis?.factorBreakdown?.supplierRiskPoints} pts</strong>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span>Carrier Historical Reliability (20% weight):</span>
                <strong className="text-brand-500">{riskAnalysis?.factorBreakdown?.carrierRiskPoints} pts</strong>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span>Route & Maritime Corridor Risk (20% weight):</span>
                <strong className="text-brand-500">{riskAnalysis?.factorBreakdown?.routeRiskPoints} pts</strong>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span>Timeline Days Remaining Factor (30% weight):</span>
                <strong className="text-brand-500">{riskAnalysis?.factorBreakdown?.timelineRiskPoints} pts</strong>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Vertical Timeline Modal */}
      <Modal
        isOpen={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
        title={`Shipment Timeline: ${selectedShipment?.shipmentNumber}`}
        subtitle={`Carrier: ${selectedShipment?.carrier} (${selectedShipment?.trackingNumber})`}
      >
        <div className="space-y-6 relative pl-6 border-l-2 border-brand-500/30 my-4">
          {selectedShipment?.events?.map((ev, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-brand-500 border-4 border-white dark:border-slate-900"></div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{ev.status}</span>
                  <span className="text-[10px] text-slate-400">{new Date(ev.eventTime).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{ev.description}</p>
                {ev.location && <span className="text-[11px] text-brand-400 block">📍 {ev.location}</span>}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Add Event Modal */}
      <Modal
        isOpen={addEventModalOpen}
        onClose={() => setAddEventModalOpen(false)}
        title="Add Tracking Milestone Event"
        subtitle={`Updating shipment ${selectedShipment?.shipmentNumber}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">New Event Status</label>
            <select
              value={newEventStatus}
              onChange={(e) => setNewEventStatus(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
            >
              <option value="PICKED_UP">PICKED UP</option>
              <option value="IN_TRANSIT">IN TRANSIT</option>
              <option value="DELAYED">DELAYED</option>
              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Current Location</label>
            <input
              type="text"
              value={newEventLocation}
              onChange={(e) => setNewEventLocation(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Status Description / Notes</label>
            <textarea
              rows={3}
              value={newEventDescription}
              onChange={(e) => setNewEventDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setAddEventModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEventSubmit}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold shadow-md shadow-brand-600/20"
            >
              Save Milestone Event
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
