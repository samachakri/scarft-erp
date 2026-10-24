export type RoleName =
  | 'Super Admin'
  | 'Admin'
  | 'Sales Manager'
  | 'Sales Executive'
  | 'Inventory Manager'
  | 'Production Manager'
  | 'Production Staff'
  | 'Accounts Manager'
  | 'Accounts Executive';

export type ModuleKey =
  | 'dashboard'
  | 'leads'
  | 'fabricators'
  | 'dealers'
  | 'products'
  | 'bom'
  | 'inventory'
  | 'raw_materials'
  | 'material_requirements'
  | 'production'
  | 'quotations'
  | 'orders'
  | 'dispatch'
  | 'payments'
  | 'reports'
  | 'employees'
  | 'roles'
  | 'activity_logs'
  | 'settings';

export type WebhookEventType =
  | 'lead.created'
  | 'lead.updated'
  | 'fabricator.created'
  | 'quotation.created'
  | 'quotation.approved'
  | 'order.created'
  | 'production.started'
  | 'production.completed'
  | 'dispatch.created'
  | 'payment.received';

export interface WebhookEventPayload {
  id: string;
  event: WebhookEventType;
  timestamp: string;
  source: 'n8n-whatsapp-webhook' | 'erp-internal';
  payload: Record<string, unknown>;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  department: 'Management' | 'Sales & Commercial' | 'Inventory & Stores' | 'Extrusion & Production' | 'Accounts & Finance';
  role: RoleName;
  managerId?: string;
  managerName: string;
  assignedFabricatorIds: string[];
  lastActive: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  plantUnit: string;
}

export type LeadSource =
  | 'WhatsApp'
  | 'Meta Ads'
  | 'Google Ads'
  | 'Organic'
  | 'Referral / Phone'
  | 'Walk-in / Expo';
export type LeadCustomerType = 'Fabricator' | 'Dealer' | 'Other';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Quotation' | 'Converted' | 'Lost';

export interface LeadFollowUp {
  id: string;
  date: string;
  summary: string;
  nextActionDate?: string;
  createdBy: string;
}

export interface TimelineItem {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  actor: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
}

export interface Lead {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  location: string;
  source: LeadSource;
  customerType: LeadCustomerType;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  lastContact: string;
  status: LeadStatus;
  createdAt: string;
  requirements: string;
  interestedProfiles: string[]; // profile codes
  estimatedMonthlyMt: number;
  notes: string;
  whatsappMessage?: string;
  linkedQuotationId?: string;
  convertedFabricatorId?: string;
  followUps: LeadFollowUp[];
  timeline: TimelineItem[];
}

export type FabricatorStatus = 'Active' | 'Inactive' | 'On Hold';

export interface FabricatorRequirement {
  id: string;
  profileCode: string;
  profileName: string;
  color: string;
  monthlyQuantityMeters: number;
  projectSite: string;
  addedAt: string;
}

export interface Fabricator {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  location: string;
  city: string;
  state: string;
  billingAddress: string;
  shippingAddress: string;
  dealerId?: string;
  dealerName?: string;
  assignedSalespersonId: string;
  assignedSalespersonName: string;
  paymentTerms: 'Advance 100%' | '50% Advance, 50% Before Dispatch' | 'Net 15 Days' | 'Net 30 Days' | 'Net 45 Days';
  creditLimit: number;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  openQuotationsCount: number;
  openOrdersCount: number;
  outstandingAmount: number;
  totalSalesYtd: number;
  lastOrderDate: string;
  status: FabricatorStatus;
  activeSitesCount: number;
  certificationStatus: string;
  requirements: FabricatorRequirement[];
  timeline: TimelineItem[];
}

export interface Dealer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  location: string;
  state: string;
  territory: string;
  assignedSalespersonId: string;
  assignedSalespersonName: string;
  fabricatorIds: string[];
  openOrdersCount: number;
  totalVolumeMt: number;
  creditLimit: number;
  outstandingAmount: number;
  paymentTerms: string;
  establishedYear: number;
  status: 'Active' | 'Inactive' | 'Credit Hold';
  timeline: TimelineItem[];
}

export type ProductCategory =
  | 'Frame Profile'
  | 'Sash Profile'
  | 'Sliding Profile'
  | 'Mullion / Transom'
  | 'Glazing Bead'
  | 'Louver & Misc'
  | 'Accessory';

export interface Product {
  id: string;
  code: string; // e.g., SCF-FR-60
  name: string;
  category: ProductCategory;
  itemType: 'UPVC Profile' | 'Accessory';
  color: 'White' | 'Anthracite Grey' | 'Walnut Wood' | 'Golden Oak' | 'Black' | 'Metallic Silver';
  lengthMeters: number; // e.g. 6 meters for profiles, 0 for accessories
  weightPerMeterKg: number; // e.g. 1.85 kg/m
  unit: 'meters' | 'pieces' | 'kg';
  currentStock: number;
  reservedStock: number;
  minimumStock: number;
  sellingPrice: number; // ₹ per unit
  dealerPrice: number;
  gstPercent: 18 | 12;
  status: 'Active' | 'Low Stock' | 'Discontinued';
  bomId?: string;
  dieNumber?: string;
}

export type StockHealthStatus = 'Healthy' | 'Low' | 'Critical' | 'Out of Stock';

export interface RawMaterial {
  id: string;
  code: string; // e.g. RM-001
  name: string; // e.g. UPVC Resin
  category: 'Base Polymer' | 'Filler' | 'Pigment' | 'Stabilizer & Additive' | 'Laminate & Gasket' | 'Reinforcement';
  availableQuantity: number;
  reservedQuantity: number;
  minimumLevel: number;
  unit: 'kg' | 'meters' | 'pieces';
  averageCostPerUnit: number;
  supplier: string;
  lastPurchaseDate: string;
  status: StockHealthStatus;
}

export interface BOMComponent {
  materialId: string;
  materialCode: string;
  materialName: string;
  quantityPerMeter: number; // kg per meter of profile
  unit: 'kg';
}

export interface BillOfMaterials {
  id: string;
  productId: string;
  profileCode: string;
  profileName: string;
  weightPerMeterKg: number;
  components: BOMComponent[];
  extrusionLineType: string;
  standardOutputMetersPerHour: number;
}

export type StockMovementType = 'Purchase' | 'Production Consumption' | 'Production In' | 'Adjustment' | 'Return' | 'Transfer';

export interface StockMovement {
  id: string;
  date: string;
  itemCode: string;
  itemName: string;
  itemCategory: 'Raw Material' | 'UPVC Profile' | 'Accessory';
  movementType: StockMovementType;
  quantity: number; // positive or negative
  unit: 'kg' | 'meters' | 'pieces';
  referenceId: string;
  performedBy: string;
  notes: string;
}

export interface PurchaseRequirement {
  id: string;
  createdAt: string;
  profileCode: string;
  productionQuantityMeters: number;
  items: {
    materialId: string;
    materialCode: string;
    materialName: string;
    shortageKg: number;
    estimatedCost: number;
    supplier: string;
  }[];
  status: 'Open' | 'PO Issued' | 'Received';
  requestedBy: string;
}

export type QuotationStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Sent'
  | 'Viewed'
  | 'Approved'
  | 'Rejected'
  | 'Expired';

export interface QuotationItem {
  id: string;
  productId: string;
  profileCode: string;
  description: string;
  quantity: number;
  unit: 'meters' | 'pieces' | 'kg';
  rate: number;
  discountPercent: number;
  gstPercent: number;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
}

export interface Quotation {
  id: string; // e.g. QT-2026-00421
  fabricatorId: string;
  fabricatorName: string;
  dealerId?: string;
  createdBy: string;
  approvedBy?: string;
  items: QuotationItem[];
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  gstType: 'CGST_SGST' | 'IGST';
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  transportCharges: number;
  roundOff: number;
  grandTotal: number;
  validUntil: string;
  paymentTerms: string;
  deliveryTimeline: string;
  notes: string;
  status: QuotationStatus;
  createdAt: string;
  convertedOrderId?: string;
  rejectionReason?: string;
  timeline: TimelineItem[];
}

export type OrderWorkflowStage =
  | 'Quotation Approved'
  | 'Order Created'
  | 'Inventory Check'
  | 'Production Required'
  | 'Production'
  | 'Ready'
  | 'Dispatch'
  | 'Completed';

export type OrderStatus =
  | 'New'
  | 'Inventory Check'
  | 'Production Required'
  | 'In Production'
  | 'Ready for Dispatch'
  | 'Dispatched'
  | 'Completed';

export interface SalesOrderItem {
  id: string;
  productId: string;
  profileCode: string;
  profileName: string;
  color: string;
  orderedQuantity: number;
  unit: 'meters' | 'pieces' | 'kg';
  rate: number;
  amount: number;
  availableStock: number;
  allocatedStock: number;
  productionRequiredQuantity: number;
  productionOrderId?: string;
}

export interface SalesOrder {
  id: string; // e.g. SO-2026-1082
  fabricatorId: string;
  fabricatorName: string;
  quotationId: string;
  orderValue: number;
  workflowStage: OrderWorkflowStage;
  productionStatus: 'Not Required' | 'Pending Production' | 'In Production' | 'Completed';
  paymentStatus: 'Unpaid' | 'Advance Paid' | 'Partially Paid' | 'Paid';
  dispatchStatus: 'Pending' | 'Ready to Dispatch' | 'Dispatched' | 'Delivered';
  expectedDate: string;
  createdAt: string;
  status: OrderStatus;
  batchCode?: string;
  extruderLine?: string;
  items: SalesOrderItem[];
  paidAmount: number;
  timeline: TimelineItem[];
}

export type ProductionStatus =
  | 'Planned'
  | 'Material Pending'
  | 'In Production'
  | 'Paused'
  | 'Completed'
  | 'Delayed';

export interface ProductionOrder {
  id: string; // e.g. PO-2026-00125
  orderId?: string;
  fabricatorName?: string;
  productId: string;
  profileCode: string;
  profileName: string;
  color: string;
  requiredQuantity: number; // meters
  producedQuantity: number;
  remainingQuantity: number;
  rejectedQuantity: number;
  wastageKg: number;
  finalQuantity: number;
  materialStatus: 'Available & Reserved' | 'Shortage - Purchase Req' | 'Allocated';
  productionStatus: ProductionStatus;
  extruderLine: string;
  dueDate: string;
  createdAt: string;
  timeline: TimelineItem[];
}

export interface ExtrusionDie {
  id: string;
  dieNumber: string; // e.g. DIE-S112-30T
  dieName: string;
  profileCode: string;
  extruderLine: string;
  standardSpeedMpm: number;
  weightPerMeterKg: number;
  heatingZonesTemp: string;
  vacuumPressureBar: number;
  totalMetersRun: number;
  ratedLifeMeters: number;
  maintenanceStatus: 'Ready' | 'In Tooling' | 'Service Required';
}

export type SessionShift =
  | 'Morning Shift (06:00 - 14:00)'
  | 'Evening Shift (14:00 - 22:00)'
  | 'Night Shift (22:00 - 06:00)';

export type SessionStatus =
  | 'Scheduled'
  | 'Heating Up'
  | 'Running'
  | 'Completed'
  | 'Paused';

export interface ExtrusionSession {
  id: string; // e.g. SES-2026-0042
  sessionCode: string;
  dieNumber: string;
  profileCode: string;
  profileName: string;
  extruderLine: string;
  shift: SessionShift;
  date: string;
  targetMeters: number;
  targetBundles: number; // Sets of 6 pcs (36m per set)
  targetPieces: number;
  status: SessionStatus;
  resinRequiredKg: number;
  calciumCarbonateRequiredKg: number;
  tio2RequiredKg: number;
  additivesRequiredKg: number;
  maxSessionsPossibleWithStock: number;
  remainingSessionsSupported: number;
  producedMeters: number;
  producedBundles: number;
  scrapMeters: number;
  operatorName: string;
  linkedOrderId?: string;
  notes?: string;
}

export type DispatchStatus =
  | 'Ready to Dispatch'
  | 'Dispatched Today'
  | 'In Transit'
  | 'Delivered'
  | 'Pending';

export interface DispatchRecord {
  id: string; // e.g. DSP-2026-0412
  orderId: string;
  fabricatorId: string;
  fabricatorName: string;
  deliveryAddress: string;
  itemsSummary: string;
  totalQuantityMeters: number;
  transportAgency: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  dispatchDate: string;
  expectedDelivery: string;
  status: DispatchStatus;
  paymentStatus: 'Paid' | 'Advance Paid' | 'Credit Approved' | 'Payment Hold';
  documents: {
    challanNo: string;
    invoiceNo: string;
    eWayBillNo: string;
    gatepassNo: string;
  };
}

export type PaymentMethod = 'Bank Transfer' | 'UPI' | 'Cheque' | 'Cash' | 'Other';
export type PaymentRecordStatus = 'Paid' | 'Partially Paid' | 'Due Today' | 'Overdue';

export interface PaymentTransaction {
  id: string;
  fabricatorId: string;
  fabricatorName: string;
  orderId: string;
  invoiceNo: string;
  orderTotalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: string;
  status: PaymentRecordStatus;
  lastPaymentMethod: PaymentMethod;
  referenceNo: string;
  paymentDate: string;
  recordedBy: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  employeeId: string;
  employeeName: string;
  employeeRole: RoleName;
  module:
    | 'Lead'
    | 'Fabricator'
    | 'Dealer'
    | 'Quotation'
    | 'Sales Order'
    | 'Inventory'
    | 'Production'
    | 'Dispatch'
    | 'Payment'
    | 'Administration';
  action: string;
  recordId: string;
  beforeValue?: string;
  afterValue?: string;
  summary: string;
}
