// Common API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: String;
  data: T;
  errors?: string[];
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// User & Auth Types
export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ORGANIZATION_ADMIN' 
  | 'SUPPLY_CHAIN_MANAGER' 
  | 'WAREHOUSE_MANAGER' 
  | 'ANALYST';

export interface User {
  id: number;
  organizationId: number;
  organizationName: string;
  organizationCode: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  active: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

// Supplier Types
export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW';

export interface Supplier {
  id: number;
  organizationId: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  rating: number;
  performanceScore: number;
  status: SupplierStatus;
  createdAt?: string;
  updatedAt?: string;
}

// ProductCategory & Product Types
export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
}

export type ProductStatus = 'ACTIVE' | 'DISCONTINUED' | 'DRAFT';

export interface Product {
  id: number;
  organizationId: number;
  supplierId: number;
  supplierName?: string;
  categoryId?: number;
  categoryName?: string;
  name: string;
  sku: string;
  description?: string;
  unit: string;
  purchasePrice: number;
  leadTimeDays: number;
  reorderLevel: number;
  safetyStock: number;
  status: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Warehouse Types
export interface Warehouse {
  id: number;
  organizationId: number;
  name: string;
  code: string;
  location?: string;
  city?: string;
  country?: string;
  capacity: number;
  managerName?: string;
  status: string;
  usedCapacity?: number;
  utilizationPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Inventory & Stock Movement Types
export interface Inventory {
  id: number;
  organizationId: number;
  productId: number;
  productName?: string;
  productSku?: string;
  warehouseId: number;
  warehouseName?: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  incomingStock: number;
  damagedStock: number;
  reorderLevel: number;
  safetyStock: number;
  stockoutRiskStatus?: 'NORMAL' | 'LOW_STOCK' | 'HIGH_STOCKOUT_RISK' | 'OVERSTOCK';
  createdAt?: string;
  updatedAt?: string;
}

export type MovementType = 'INCREASE' | 'DECREASE' | 'DAMAGE' | 'CORRECTION' | 'PURCHASE_RECEIPT';

export interface StockMovement {
  id: number;
  inventoryId: number;
  productId: number;
  productName?: string;
  warehouseId: number;
  warehouseName?: string;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceType?: string;
  referenceId?: number;
  notes?: string;
  createdAt: string;
  createdBy?: number;
}

// Purchase Order Types
export type POStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'APPROVED' 
  | 'CONFIRMED' 
  | 'PARTIALLY_RECEIVED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface PurchaseOrderItem {
  id?: number;
  productId: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  receivedQuantity?: number;
  unitPrice: number;
  tax?: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: number;
  organizationId: number;
  supplierId: number;
  supplierName?: string;
  poNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: POStatus;
  subtotal: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

// Shipment Types
export type ShipmentStatus = 
  | 'CREATED' 
  | 'PICKED_UP' 
  | 'IN_TRANSIT' 
  | 'DELAYED' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED';

export type DelayRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ShipmentEvent {
  id?: number;
  shipmentId?: number;
  status: ShipmentStatus;
  location?: string;
  description?: string;
  eventTime: string;
}

export interface Shipment {
  id: number;
  organizationId: number;
  purchaseOrderId?: number;
  poNumber?: string;
  shipmentNumber: string;
  origin: string;
  destination: string;
  carrier: string;
  trackingNumber?: string;
  status: ShipmentStatus;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  delayRiskScore: number;
  riskLevel: DelayRiskLevel;
  events?: ShipmentEvent[];
  createdAt?: string;
  updatedAt?: string;
}

// Analytics & Intelligence Types
export interface ShipmentRiskFactorBreakdown {
  supplierRiskPoints: number;
  carrierRiskPoints: number;
  routeRiskPoints: number;
  timelineRiskPoints: number;
}

export interface ShipmentRiskResult {
  shipmentId: number;
  shipmentNumber: string;
  riskScore: number;
  riskLevel: DelayRiskLevel;
  factorBreakdown: ShipmentRiskFactorBreakdown;
  explanation: string;
}

export interface DemandForecastResult {
  productId: number;
  productName: string;
  predictedDemand: number;
  confidence: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  recommendedStockLevel: number;
  historicalDemand: { month: string; quantity: number }[];
  forecastData: { month: string; predictedQuantity: number }[];
}

export interface SupplyChainHealthResult {
  supplierPerformanceScore: number;
  shipmentPerformanceScore: number;
  inventoryHealthScore: number;
  demandStabilityScore: number;
  overallHealthScore: number;
  healthLevel: 'CRITICAL' | 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
}

export interface AIInsight {
  id: number;
  type: 'SHIPMENT_RISK' | 'INVENTORY_RISK' | 'SUPPLIER_PERFORMANCE' | 'DEMAND_TREND' | 'RECOMMENDATION';
  title: string;
  description: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedAction?: string;
  confidence: number;
  entityType?: string;
  entityId?: number;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: 'LOW_STOCK' | 'HIGH_RISK_SHIPMENT' | 'SHIPMENT_DELAY' | 'PURCHASE_ORDER_UPDATE' | 'AI_INSIGHT';
  title: string;
  message: string;
  read: boolean;
  referenceType?: string;
  referenceId?: number;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: number;
  details?: string;
  timestamp: string;
}
