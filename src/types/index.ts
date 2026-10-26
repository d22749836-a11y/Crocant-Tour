/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'ASESOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  documentNumber: string;
  branch: string; // "Sede Principal Buga - Carrera 14"
}

export type OrderStatus = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'EN_RUTA' | 'ENTREGADO' | 'ANULADO';
export type OrderChannel = 'MESA' | 'LLEVAR' | 'DOMICILIO';
export type PaymentMethod = 'EFECTIVO' | 'NEQUI' | 'DAVIPLATA' | 'BANCOLOMBIA_QR' | 'DATAFONO';

export interface RecipeItem {
  ingredientId: string;
  quantity: number; // in unit (kg, g, ml, unidad)
  unit: string;
}

export interface MenuItem {
  id: string;
  code: string;
  name: string;
  category: 'ALITAS' | 'BOWLS' | 'TOSTADAS' | 'TENDERS' | 'ACOMPANANTES' | 'BEBIDAS';
  price: number; // in COP
  cost: number;  // unit food cost
  description: string;
  image: string;
  recipe: RecipeItem[];
  prepTimeMinutes: number;
  available: boolean;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  selectedSauce?: string;
  notes?: string;
}

export interface DeliveryZone {
  id: string;
  name: string; // e.g., "Centro & Basílica", "El Albergue", "Paloblanco", "Aures", "Zona Norte"
  code: string;
  baseDeliveryFee: number; // COP
  estimatedTransitMin: number; // Ballou travel time
  distanceKm: number;
  activeDeliveryPersons: number;
}

export interface Order {
  id: string;
  consecutiveNumber: string; // e.g. "CT-1042"
  channel: OrderChannel;
  status: OrderStatus;
  tableNumber?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryZoneId?: string;
  assignedDriver?: string; // Motorizado asignado
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  createdAt: string;
  preparedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  createdByUserId: string;
  createdByName: string;
  createdByRole: UserRole;
  voidReason?: string;
  voidedByUserId?: string;
  voidedAt?: string;
}

// Chopra & Meindl (2016) Supply Chain Inventory Structure
export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'PROTEINAS' | 'SALSAS_CONDIMENTOS' | 'VERDURAS_FRESCOS' | 'EMPAQUES' | 'BEBIDAS_INSUMOS';
  currentStock: number;
  unit: 'kg' | 'g' | 'litros' | 'ml' | 'unidades';
  safetyStock: number; // SS = Z * sigma_L * sqrt(L)
  reorderPoint: number; // ROP = (d * L) + SS
  leadTimeDays: number; // L: Lead time from local supplier in Buga/Valle
  avgDailyDemand: number; // d: Demanda diaria promedio
  unitCost: number; // COP
  supplier: string;
  expirationDate: string; // FEFO tracking
  batchLot: string;
  zone5S: string; // Hirano 5S location (e.g., "CF-01: Cuarto Frío Proteínas")
  lastRestockedAt: string;
}

export interface GoodsReceipt {
  id: string;
  receptionNumber: string; // e.g. "REC-2026-042"
  supplierInvoice: string;
  supplierName: string;
  receivedAt: string;
  receivedByUserId: string;
  receivedByName: string;
  receivedByRole: UserRole;
  items: {
    inventoryItemId: string;
    inventoryItemName: string;
    quantityReceived: number;
    unit: string;
    unitCost: number;
    batchLot: string;
    expirationDate: string;
    temperatureChecked?: number; // °C for cold chain compliance
    target5SZone: string;
  }[];
  notes?: string;
}

// Hirano (1995) 5S Framework Structures
export interface RedTagItem {
  id: string;
  tagNumber: string; // e.g. "TR-5S-089"
  dateCreated: string;
  inventoryItemId?: string;
  itemName: string;
  locationArea: string;
  reason: 'CADUCADO' | 'DETERIORADO' | 'SOBRANTE_EXCESIVO' | 'ROTURA_CADENA_FRIO' | 'OTRO';
  quantity: number;
  unit: string;
  estimatedLossCOP: number;
  responsibleName: string;
  status: 'PENDIENTE_DISPOSICION' | 'DESCARTADO' | 'DEVUELTO_PROVEEDOR' | 'AUTORIZADO_ADMIN';
  dispositionAction?: string;
  authorizedBy?: string;
}

export interface StorageBin5S {
  zoneCode: string; // "CF-01", "CF-02", "BS-01", "LC-01", "EP-01"
  name: string;
  area: 'CUARTO_FRIO' | 'BODEGA_SECOS' | 'LINEA_COCINA' | 'AREA_DESPACHO';
  assignedItems: string[];
  temperatureReq?: string; // e.g. "0°C a 4°C"
  maxCapacity: string;
  visualLabelColor: string;
  compliancePercentage: number;
}

export interface SeisoChecklog {
  id: string;
  date: string;
  shift: 'MANANA' | 'TARDE' | 'CIERRE';
  inspectorName: string;
  cuartoFrioTempOk: boolean;
  cuartoFrioTempObs: number; // °C
  freidoraTempOk: boolean;
  freidoraTempObs: number; // °C
  freidoraOilQualityOk: boolean;
  sanitizationCompleted: boolean;
  observations: string;
}

export interface FiveSAudit {
  id: string;
  date: string;
  auditorName: string;
  scoreSeiri: number;
  scoreSeiton: number;
  scoreSeiso: number;
  scoreSeiketsu: number;
  scoreShitsuke: number;
  overallScore: number;
  notes: string;
}

// Ballou (2004) Logistics & Dispatch Fleet
export interface DeliveryDriver {
  id: string;
  name: string;
  vehicle: string;
  phone: string;
  status: 'DISPONIBLE' | 'EN_RUTA' | 'DESCANSO';
  currentActiveOrderId?: string;
  deliveriesToday: number;
  avgTimeMinutes: number;
}

// Cash Register (Cuadre de Caja)
export interface CashShift {
  id: string;
  openedAt: string;
  closedAt?: string;
  cashierUserId: string;
  cashierName: string;
  initialCashBase: number;
  systemCashSales: number;
  systemElectronicSales: number;
  declaredCash: number;
  declaredElectronic: number;
  difference: number;
  status: 'ABIERTO' | 'CERRADO';
  notes?: string;
  closedByRole?: UserRole;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: 'VENTA_CREADA' | 'INGRESO_STOCK' | 'CUADRE_REGISTRADO' | 'PEDIDO_ANULADO' | 'INTENTO_RBAC_BLOQUEADO' | 'MODIFICACION_PARAMETRO' | 'INSPECCION_5S';
  description: string;
  entityId?: string;
  isViolationAttempt?: boolean;
}
