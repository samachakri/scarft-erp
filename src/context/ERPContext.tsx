import React, { createContext, useContext, useState } from 'react';
import {
  Employee,
  Lead,
  Fabricator,
  Dealer,
  Product,
  RawMaterial,
  BillOfMaterials,
  StockMovement,
  PurchaseRequirement,
  Quotation,
  SalesOrder,
  ProductionOrder,
  DispatchRecord,
  PaymentTransaction,
  ActivityLogEntry,
  ModuleKey,
  RoleName,
  WebhookEventPayload,
  WebhookEventType,
  LeadStatus,
  PaymentMethod,
  ExtrusionDie,
  ExtrusionSession,
  SessionShift,
  SessionStatus,
} from '../types/erp';
import {
  INITIAL_EMPLOYEES,
  INITIAL_LEADS,
  INITIAL_FABRICATORS,
  INITIAL_DEALERS,
  INITIAL_PRODUCTS,
  INITIAL_RAW_MATERIALS,
  INITIAL_BOMS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_PURCHASE_REQUIREMENTS,
  INITIAL_QUOTATIONS,
  INITIAL_SALES_ORDERS,
  INITIAL_PRODUCTION_ORDERS,
  INITIAL_DISPATCHES,
  INITIAL_PAYMENTS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_DIES,
  INITIAL_EXTRUSION_SESSIONS,
} from '../data/mockData';
import { ROLE_ALLOWED_MODULES } from '../services/rbac';

export interface MRPCalculationRow {
  materialId: string;
  materialCode: string;
  materialName: string;
  quantityPerMeter: number;
  requiredKg: number;
  availableKg: number;
  reservedKg: number;
  shortageKg: number;
  status: 'Available' | 'Purchase Required';
  supplier: string;
  unitCost: number;
}

export interface MRPCalculationResult {
  profileCode: string;
  profileName: string;
  productionQuantityMeters: number;
  rows: MRPCalculationRow[];
  availabilityPercent: number;
  shortageMaterialsCount: number;
}

interface ERPContextType {
  // Navigation & Auth Simulation
  activeModule: ModuleKey;
  setActiveModule: (mod: ModuleKey) => void;
  selectedRecordId: string | null;
  setSelectedRecordId: (id: string | null) => void;
  navigateTo: (mod: ModuleKey, recordId?: string | null) => void;
  currentEmployee: Employee;
  switchRole: (role: RoleName) => void;
  quickCreateModal: string | null;
  setQuickCreateModal: (modal: string | null) => void;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;

  // Entities
  employees: Employee[];
  leads: Lead[];
  fabricators: Fabricator[];
  dealers: Dealer[];
  products: Product[];
  rawMaterials: RawMaterial[];
  boms: BillOfMaterials[];
  stockMovements: StockMovement[];
  purchaseRequirements: PurchaseRequirement[];
  quotations: Quotation[];
  salesOrders: SalesOrder[];
  productionOrders: ProductionOrder[];
  dies: ExtrusionDie[];
  extrusionSessions: ExtrusionSession[];
  dispatches: DispatchRecord[];
  payments: PaymentTransaction[];
  activityLogs: ActivityLogEntry[];
  webhookEvents: WebhookEventPayload[];

  // Workflows & Actions
  simulateWhatsAppLead: () => Lead;
  createLead: (data: Partial<Lead>) => Lead;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  assignLead: (leadId: string, employeeId: string) => void;
  addLeadFollowUp: (leadId: string, summary: string, date: string) => void;
  convertLeadToFabricator: (leadId: string) => Fabricator | null;

  createFabricator: (data: Partial<Fabricator>) => Fabricator;
  updateFabricator: (id: string, updates: Partial<Fabricator>) => void;
  addFabricatorRequirement: (
    fabricatorId: string,
    profileCode: string,
    monthlyQuantityMeters: number,
    projectSite: string
  ) => void;

  createDealer: (data: Partial<Dealer>) => Dealer;
  toggleDealerFabricator: (dealerId: string, fabricatorId: string) => void;

  calculateMRP: (profileCode: string, quantityMeters: number) => MRPCalculationResult;
  reserveMaterialForMRP: (profileCode: string, quantityMeters: number) => void;
  generatePurchaseRequirementFromMRP: (profileCode: string, quantityMeters: number) => PurchaseRequirement;
  stockInRawMaterial: (materialId: string, quantity: number, notes: string) => void;
  adjustRawMaterialStock: (materialId: string, newQuantity: number, reason: string) => void;
  updateProductPrice: (productId: string, sellingPrice: number, dealerPrice: number) => void;
  addProfileBundleStock: (
    productId: string,
    bundlesCount: number,
    rackLocation?: string,
    notes?: string
  ) => void;

  createQuotation: (quotationData: Omit<Quotation, 'id' | 'createdAt' | 'timeline'>) => Quotation;
  submitQuotationForApproval: (quotationId: string) => void;
  approveQuotation: (quotationId: string) => void;
  rejectQuotation: (quotationId: string, reason: string) => void;
  duplicateQuotation: (quotationId: string) => Quotation | null;
  convertQuotationToOrder: (quotationId: string) => SalesOrder | null;

  createSalesOrder: (data: {
    fabricatorId: string;
    quotationId?: string;
    expectedDate: string;
    items: { productId: string; quantity: number; rate: number }[];
  }) => SalesOrder;
  advanceOrderWorkflow: (orderId: string) => void;

  createProductionOrder: (data: {
    orderId?: string;
    productId: string;
    requiredQuantity: number;
    dueDate: string;
    extruderLine: string;
  }) => ProductionOrder;
  updateProductionOrder: (
    poId: string,
    action: 'start' | 'pause' | 'update_qty' | 'complete',
    producedDelta?: number,
    rejectedDelta?: number
  ) => void;

  createExtrusionSession: (data: {
    dieNumber: string;
    shift: SessionShift;
    date: string;
    targetBundles: number;
    operatorName: string;
    linkedOrderId?: string;
    notes?: string;
  }) => ExtrusionSession;
  updateExtrusionSessionStatus: (
    sessionId: string,
    status: SessionStatus,
    producedDeltaMeters?: number,
    scrapDeltaMeters?: number
  ) => void;

  createDispatch: (data: {
    orderId: string;
    transportAgency: string;
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    expectedDelivery: string;
  }) => DispatchRecord;
  updateDispatchStatus: (dispatchId: string, status: DispatchRecord['status']) => void;

  recordPayment: (data: {
    fabricatorId: string;
    orderId: string;
    amount: number;
    method: PaymentMethod;
    referenceNo: string;
  }) => PaymentTransaction;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const WHATSAPP_SIMULATION_POOL = [
  {
    name: 'Virendra Shekhawat',
    companyName: 'Shekhawat uPVC & Glazing Studio',
    phone: '+91 98294 61029',
    location: 'Jaipur, Rajasthan',
    interestedProfiles: ['SCF-FR-60', 'SCF-SH-60', 'SCF-BD-24'],
    estimatedMonthlyMt: 3.8,
    message:
      'Hello SCraft Bhiwadi Plant, we need urgent quotation for 2,000m SCF-FR-60 Casement Frame and 1,400m SCF-SH-60 Sash for Mansarovar High-Rise project.',
  },
  {
    name: 'Hardik Panchal',
    companyName: 'Karnavati Fenestration Craft',
    phone: '+91 98790 44128',
    location: 'Ahmedabad, Gujarat',
    interestedProfiles: ['SCF-SL-30T', 'SCF-SL-DR85'],
    estimatedMonthlyMt: 4.5,
    message:
      'Kem cho SCraft team, inquiring from SG Highway workshop. Please share dealer/fabricator rate for SCF-SL-30T 3-Track Villa profile (1,800 meters).',
  },
  {
    name: 'Gaurav Chaudhary',
    companyName: 'NCR Enviro Windows Pvt Ltd',
    phone: '+91 98114 89201',
    location: 'Noida Sector 62, UP',
    interestedProfiles: ['SCF-SL-25T', 'SCF-SL-SH66', 'ACC-ROL-08'],
    estimatedMonthlyMt: 5.2,
    message:
      'Hi, saw SCraft profiles at Greater Noida site. Need 3,200 meters Sliding 2.5 Track SCF-SL-25T + 200 Brass Tandem Rollers.',
  },
];

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(INITIAL_EMPLOYEES[0]);
  const [quickCreateModal, setQuickCreateModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [fabricators, setFabricators] = useState<Fabricator[]>(INITIAL_FABRICATORS);
  const [dealers, setDealers] = useState<Dealer[]>(INITIAL_DEALERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(INITIAL_RAW_MATERIALS);
  const [boms] = useState<BillOfMaterials[]>(INITIAL_BOMS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [purchaseRequirements, setPurchaseRequirements] = useState<PurchaseRequirement[]>(
    INITIAL_PURCHASE_REQUIREMENTS
  );
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(INITIAL_SALES_ORDERS);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(
    INITIAL_PRODUCTION_ORDERS
  );
  const [dies, setDies] = useState<ExtrusionDie[]>(INITIAL_DIES);
  const [extrusionSessions, setExtrusionSessions] = useState<ExtrusionSession[]>(
    INITIAL_EXTRUSION_SESSIONS
  );
  const [dispatches, setDispatches] = useState<DispatchRecord[]>(INITIAL_DISPATCHES);
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(INITIAL_ACTIVITY_LOGS);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEventPayload[]>([
    {
      id: 'WH-101',
      event: 'lead.created',
      timestamp: '03 Oct 2026, 10:30 AM',
      source: 'n8n-whatsapp-webhook',
      payload: { leadId: 'LD-4092', phone: '+91 98201 44321', profile: 'SCF-FR-60' },
    },
  ]);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const logActivity = (
    module: ActivityLogEntry['module'],
    action: string,
    recordId: string,
    summary: string,
    beforeValue?: string,
    afterValue?: string
  ) => {
    const entry: ActivityLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just Now (03 Oct 2026)',
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeRole: currentEmployee.role,
      module,
      action,
      recordId,
      beforeValue,
      afterValue,
      summary,
    };
    setActivityLogs((prev) => [entry, ...prev]);
  };

  const emitWebhook = (
    event: WebhookEventType,
    payload: Record<string, unknown>,
    source: 'n8n-whatsapp-webhook' | 'erp-internal' = 'erp-internal'
  ) => {
    const wh: WebhookEventPayload = {
      id: `WH-${Date.now().toString().slice(-4)}`,
      event,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      source,
      payload,
    };
    setWebhookEvents((prev) => [wh, ...prev]);
  };

  const navigateTo = (mod: ModuleKey, recordId: string | null = null) => {
    const allowed = ROLE_ALLOWED_MODULES[currentEmployee.role];
    if (!allowed.includes(mod)) {
      showToast(`Role "${currentEmployee.role}" does not have access to ${mod}.`, 'warning');
      return;
    }
    setActiveModule(mod);
    setSelectedRecordId(recordId);
  };

  const switchRole = (role: RoleName) => {
    const matchedEmp = employees.find((e) => e.role === role) || {
      ...currentEmployee,
      role,
    };
    setCurrentEmployee(matchedEmp);
    const allowed = ROLE_ALLOWED_MODULES[role];
    if (!allowed.includes(activeModule)) {
      setActiveModule(allowed[0]);
      setSelectedRecordId(null);
    }
    showToast(`Switched active role to ${role} (${matchedEmp.name})`, 'info');
  };

  // 1. LEADS & WHATSAPP SIMULATION
  const simulateWhatsAppLead = (): Lead => {
    const template =
      WHATSAPP_SIMULATION_POOL[Math.floor(Math.random() * WHATSAPP_SIMULATION_POOL.length)];
    const newId = `LD-${4093 + leads.length - 19}`;
    const newLead: Lead = {
      id: newId,
      name: template.name,
      companyName: template.companyName,
      phone: template.phone,
      email: `${template.name.toLowerCase().replace(/\s+/g, '.')}@upvcfab.in`,
      location: template.location,
      source: 'WhatsApp',
      customerType: 'Fabricator',
      assignedEmployeeId: 'EMP-004',
      assignedEmployeeName: 'Rahul Khanna',
      lastContact: 'Just Now',
      status: 'New',
      createdAt: '03 Oct 2026 (Live)',
      requirements: template.message,
      interestedProfiles: template.interestedProfiles,
      estimatedMonthlyMt: template.estimatedMonthlyMt,
      notes: 'Auto-ingested via simulated n8n WhatsApp Business Cloud webhook.',
      whatsappMessage: template.message,
      followUps: [],
      timeline: [
        {
          id: `TL-${Date.now()}`,
          timestamp: 'Just Now',
          title: 'WhatsApp Lead Captured via n8n Webhook',
          description: template.message,
          actor: 'n8n WhatsApp Bot',
          type: 'success',
        },
      ],
    };

    setLeads((prev) => [newLead, ...prev]);
    logActivity('Lead', 'Simulated WhatsApp Lead', newId, `Inbound WhatsApp lead from ${template.companyName}`);
    emitWebhook(
      'lead.created',
      { leadId: newId, company: template.companyName, phone: template.phone, source: 'WhatsApp' },
      'n8n-whatsapp-webhook'
    );
    showToast(`WhatsApp Lead ${newId} (${template.companyName}) received!`, 'success');
    return newLead;
  };

  const createLead = (data: Partial<Lead>): Lead => {
    const newId = `LD-${4093 + leads.length - 19}`;
    const assignedEmp = employees.find((e) => e.id === data.assignedEmployeeId) || employees[3];
    const newLead: Lead = {
      id: newId,
      name: data.name || 'New Inquiry',
      companyName: data.companyName || data.name || 'New Window Fabricator',
      phone: data.phone || '+91 98100 00000',
      email: data.email || 'contact@fabricator.in',
      location: data.location || 'Jaipur, Rajasthan',
      source: data.source || 'Organic',
      customerType: data.customerType || 'Fabricator',
      assignedEmployeeId: assignedEmp.id,
      assignedEmployeeName: assignedEmp.name,
      lastContact: 'Just Now',
      status: 'New',
      createdAt: '03 Oct 2026',
      requirements: data.requirements || 'UPVC Profile supply inquiry.',
      interestedProfiles: data.interestedProfiles?.length ? data.interestedProfiles : ['SCF-FR-60'],
      estimatedMonthlyMt: data.estimatedMonthlyMt || 2.5,
      notes: data.notes || '',
      followUps: [],
      timeline: [
        {
          id: `TL-${Date.now()}`,
          timestamp: 'Just Now',
          title: `Lead Created (${data.source || 'Organic'})`,
          actor: currentEmployee.name,
          type: 'info',
        },
      ],
    };
    setLeads((prev) => [newLead, ...prev]);
    logActivity('Lead', 'Lead Created', newId, `Created lead ${newLead.companyName}`);
    emitWebhook('lead.created', { leadId: newId, companyName: newLead.companyName });
    showToast(`Lead ${newId} created successfully`, 'success');
    return newLead;
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status,
              lastContact: 'Just Now',
              timeline: [
                {
                  id: `TL-${Date.now()}`,
                  timestamp: 'Just Now',
                  title: `Status updated to ${status}`,
                  actor: currentEmployee.name,
                  type: 'info',
                },
                ...l.timeline,
              ],
            }
          : l
      )
    );
    logActivity('Lead', 'Status Updated', leadId, `Updated lead ${leadId} status to ${status}`);
    emitWebhook('lead.updated', { leadId, status });
    showToast(`Lead ${leadId} marked as ${status}`, 'info');
  };

  const assignLead = (leadId: string, employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              assignedEmployeeId: emp.id,
              assignedEmployeeName: emp.name,
              timeline: [
                {
                  id: `TL-${Date.now()}`,
                  timestamp: 'Just Now',
                  title: `Lead Assigned to ${emp.name}`,
                  actor: currentEmployee.name,
                  type: 'info',
                },
                ...l.timeline,
              ],
            }
          : l
      )
    );
    showToast(`Lead ${leadId} assigned to ${emp.name}`, 'info');
  };

  const addLeadFollowUp = (leadId: string, summary: string, date: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              lastContact: 'Just Now',
              followUps: [
                { id: `FU-${Date.now()}`, date, summary, createdBy: currentEmployee.name },
                ...l.followUps,
              ],
              timeline: [
                {
                  id: `TL-${Date.now()}`,
                  timestamp: 'Just Now',
                  title: `Follow-up Scheduled: ${date}`,
                  description: summary,
                  actor: currentEmployee.name,
                  type: 'info',
                },
                ...l.timeline,
              ],
            }
          : l
      )
    );
    showToast(`Follow-up added for ${leadId}`, 'success');
  };

  const convertLeadToFabricator = (leadId: string): Fabricator | null => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const newFabId = `FAB-${2106 + fabricators.length - 15}`;
    const cityParts = lead.location.split(',');
    const newFab: Fabricator = {
      id: newFabId,
      name: lead.companyName || lead.name,
      contactPerson: lead.name,
      phone: lead.phone,
      email: lead.email,
      gstin: '08AABCM9912K1Z4',
      location: lead.location,
      city: cityParts[0]?.trim() || 'Jaipur',
      state: cityParts[1]?.trim() || 'Rajasthan',
      billingAddress: `Industrial Shed, ${lead.location}`,
      shippingAddress: `Workshop Gate 1, ${lead.location}`,
      dealerId: 'DLR-1042',
      dealerName: 'Apex Architectural Hardware',
      assignedSalespersonId: lead.assignedEmployeeId,
      assignedSalespersonName: lead.assignedEmployeeName,
      paymentTerms: '50% Advance, 50% Before Dispatch',
      creditLimit: 2000000,
      tier: 'Tier 2',
      openQuotationsCount: lead.linkedQuotationId ? 1 : 0,
      openOrdersCount: 0,
      outstandingAmount: 0,
      totalSalesYtd: 0,
      lastOrderDate: 'New Account',
      status: 'Active',
      activeSitesCount: 1,
      certificationStatus: 'SCraft Onboarding Verified',
      requirements: lead.interestedProfiles.map((code, idx) => ({
        id: `REQ-CONV-${idx}-${Date.now()}`,
        profileCode: code,
        profileName: products.find((p) => p.code === code)?.name || code,
        color: 'White',
        monthlyQuantityMeters: 1500,
        projectSite: 'Primary Workshop Order',
        addedAt: '03 Oct 2026',
      })),
      timeline: [
        {
          id: `FT-${Date.now()}`,
          timestamp: 'Just Now',
          title: `Converted from Lead ${lead.id} (${lead.source})`,
          description: lead.requirements,
          actor: currentEmployee.name,
          type: 'success',
        },
      ],
    };

    setFabricators((prev) => [newFab, ...prev]);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: 'Converted',
              convertedFabricatorId: newFabId,
              timeline: [
                {
                  id: `TL-${Date.now()}`,
                  timestamp: 'Just Now',
                  title: `Converted to Fabricator Customer ${newFabId}`,
                  actor: currentEmployee.name,
                  type: 'success',
                },
                ...l.timeline,
              ],
            }
          : l
      )
    );
    logActivity(
      'Fabricator',
      'Lead Converted to Fabricator',
      newFabId,
      `Converted lead ${lead.id} into Fabricator ${newFab.name} (${newFabId})`
    );
    emitWebhook('fabricator.created', { fabricatorId: newFabId, fromLeadId: lead.id });
    showToast(`Converted ${lead.companyName} to Fabricator ${newFabId}!`, 'success');
    return newFab;
  };

  // 2. FABRICATORS & DEALERS
  const createFabricator = (data: Partial<Fabricator>): Fabricator => {
    const newId = `FAB-${2106 + fabricators.length - 15}`;
    const dealer = dealers.find((d) => d.id === data.dealerId);
    const salesperson =
      employees.find((e) => e.id === data.assignedSalespersonId) || currentEmployee;

    const newFab: Fabricator = {
      id: newId,
      name: data.name || 'New UPVC Fabricator',
      contactPerson: data.contactPerson || 'Workshop Director',
      phone: data.phone || '+91 98290 00000',
      email: data.email || 'info@fabricator.in',
      gstin: data.gstin || '08AAACF1122K1Z5',
      location: `${data.city || 'Jaipur'}, ${data.state || 'RJ'}`,
      city: data.city || 'Jaipur',
      state: data.state || 'Rajasthan',
      billingAddress: data.billingAddress || 'RIICO Industrial Area, Jaipur, Rajasthan',
      shippingAddress: data.shippingAddress || data.billingAddress || 'RIICO Industrial Area, Jaipur',
      dealerId: dealer?.id,
      dealerName: dealer?.name,
      assignedSalespersonId: salesperson.id,
      assignedSalespersonName: salesperson.name,
      paymentTerms: data.paymentTerms || 'Net 30 Days',
      creditLimit: data.creditLimit || 2000000,
      tier: data.tier || 'Tier 2',
      openQuotationsCount: 0,
      openOrdersCount: 0,
      outstandingAmount: 0,
      totalSalesYtd: 0,
      lastOrderDate: 'No Orders Yet',
      status: data.status || 'Active',
      activeSitesCount: 1,
      certificationStatus: 'SCraft QA Audited',
      requirements: [],
      timeline: [
        {
          id: `FT-${Date.now()}`,
          timestamp: 'Just Now',
          title: 'Fabricator Account Created',
          actor: currentEmployee.name,
          type: 'success',
        },
      ],
    };

    setFabricators((prev) => [newFab, ...prev]);
    if (dealer) {
      setDealers((prev) =>
        prev.map((d) =>
          d.id === dealer.id ? { ...d, fabricatorIds: [...d.fabricatorIds, newId] } : d
        )
      );
    }
    logActivity('Fabricator', 'Fabricator Created', newId, `Registered fabricator ${newFab.name}`);
    emitWebhook('fabricator.created', { fabricatorId: newId, name: newFab.name });
    showToast(`Fabricator ${newId} (${newFab.name}) added!`, 'success');
    return newFab;
  };

  const updateFabricator = (id: string, updates: Partial<Fabricator>) => {
    setFabricators((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
    logActivity('Fabricator', 'Fabricator Updated', id, `Updated profile details for ${id}`);
    showToast(`Fabricator ${id} updated`, 'success');
  };

  const addFabricatorRequirement = (
    fabricatorId: string,
    profileCode: string,
    monthlyQuantityMeters: number,
    projectSite: string
  ) => {
    const prod = products.find((p) => p.code === profileCode);
    setFabricators((prev) =>
      prev.map((f) =>
        f.id === fabricatorId
          ? {
              ...f,
              requirements: [
                {
                  id: `REQ-${Date.now()}`,
                  profileCode,
                  profileName: prod?.name || profileCode,
                  color: prod?.color || 'White',
                  monthlyQuantityMeters,
                  projectSite,
                  addedAt: '03 Oct 2026',
                },
                ...f.requirements,
              ],
              timeline: [
                {
                  id: `FT-${Date.now()}`,
                  timestamp: 'Just Now',
                  title: `Added Profile Requirement: ${profileCode} (${monthlyQuantityMeters}m)`,
                  description: `Site: ${projectSite}`,
                  actor: currentEmployee.name,
                  type: 'info',
                },
                ...f.timeline,
              ],
            }
          : f
      )
    );
    showToast(`Added ${profileCode} requirement to ${fabricatorId}`, 'success');
  };

  const createDealer = (data: Partial<Dealer>): Dealer => {
    const newId = `DLR-${1085 + dealers.length}`;
    const newDealer: Dealer = {
      id: newId,
      name: data.name || 'New Regional Dealer',
      contactPerson: data.contactPerson || 'Principal Partner',
      phone: data.phone || '+91 98290 11111',
      email: data.email || 'partner@dealer.in',
      gstin: data.gstin || '08AAACD5511K1Z2',
      location: data.location || 'Jaipur, RJ',
      state: data.state || 'Rajasthan',
      territory: data.territory || 'Rajasthan North',
      assignedSalespersonId: currentEmployee.id,
      assignedSalespersonName: currentEmployee.name,
      fabricatorIds: data.fabricatorIds || [],
      openOrdersCount: 0,
      totalVolumeMt: 0,
      creditLimit: data.creditLimit || 3000000,
      outstandingAmount: 0,
      paymentTerms: data.paymentTerms || 'Net 30 Days',
      establishedYear: 2026,
      status: 'Active',
      timeline: [
        {
          id: `DT-${Date.now()}`,
          timestamp: 'Just Now',
          title: 'Dealer Onboarded',
          actor: currentEmployee.name,
          type: 'success',
        },
      ],
    };
    setDealers((prev) => [newDealer, ...prev]);
    logActivity('Dealer', 'Dealer Created', newId, `Onboarded dealer ${newDealer.name}`);
    showToast(`Dealer ${newId} created!`, 'success');
    return newDealer;
  };

  const toggleDealerFabricator = (dealerId: string, fabricatorId: string) => {
    const dealer = dealers.find((d) => d.id === dealerId);
    if (!dealer) return;
    const isLinked = dealer.fabricatorIds.includes(fabricatorId);

    setDealers((prev) =>
      prev.map((d) => {
        if (d.id === dealerId) {
          return {
            ...d,
            fabricatorIds: isLinked
              ? d.fabricatorIds.filter((id) => id !== fabricatorId)
              : [...d.fabricatorIds, fabricatorId],
          };
        }
        // If linking to this dealer, remove from previous dealer
        if (!isLinked && d.fabricatorIds.includes(fabricatorId)) {
          return {
            ...d,
            fabricatorIds: d.fabricatorIds.filter((id) => id !== fabricatorId),
          };
        }
        return d;
      })
    );

    setFabricators((prev) =>
      prev.map((f) =>
        f.id === fabricatorId
          ? {
              ...f,
              dealerId: isLinked ? undefined : dealer.id,
              dealerName: isLinked ? undefined : dealer.name,
            }
          : f
      )
    );

    logActivity(
      'Dealer',
      isLinked ? 'Fabricator Unlinked' : 'Fabricator Linked',
      dealerId,
      `${isLinked ? 'Removed' : 'Associated'} fabricator ${fabricatorId} ${isLinked ? 'from' : 'with'} ${dealer.name}`
    );
    showToast(
      isLinked
        ? `Unlinked ${fabricatorId} from ${dealer.name}`
        : `Linked ${fabricatorId} to ${dealer.name}`,
      'info'
    );
  };

  // 3. BOM & MRP CALCULATIONS
  const calculateMRP = (profileCode: string, quantityMeters: number): MRPCalculationResult => {
    const bom = boms.find((b) => b.profileCode === profileCode) || boms[0];
    const rows: MRPCalculationRow[] = bom.components.map((comp) => {
      const rm = rawMaterials.find((r) => r.id === comp.materialId || r.code === comp.materialCode);
      const requiredKg = Number((comp.quantityPerMeter * quantityMeters).toFixed(2));
      const availableKg = rm ? rm.availableQuantity : 0;
      const reservedKg = rm ? rm.reservedQuantity : 0;
      const shortageKg = Math.max(0, Number((requiredKg - availableKg).toFixed(2)));
      return {
        materialId: comp.materialId,
        materialCode: comp.materialCode,
        materialName: comp.materialName,
        quantityPerMeter: comp.quantityPerMeter,
        requiredKg,
        availableKg,
        reservedKg,
        shortageKg,
        status: shortageKg > 0 ? 'Purchase Required' : 'Available',
        supplier: rm?.supplier || 'Approved Vendor',
        unitCost: rm?.averageCostPerUnit || 100,
      };
    });

    const totalRequired = rows.reduce((acc, r) => acc + r.requiredKg, 0);
    const totalCovered = rows.reduce((acc, r) => acc + Math.min(r.requiredKg, r.availableKg), 0);
    const availabilityPercent =
      totalRequired > 0 ? Math.min(100, Math.round((totalCovered / totalRequired) * 100)) : 100;
    const shortageMaterialsCount = rows.filter((r) => r.shortageKg > 0).length;

    return {
      profileCode: bom.profileCode,
      profileName: bom.profileName,
      productionQuantityMeters: quantityMeters,
      rows,
      availabilityPercent,
      shortageMaterialsCount,
    };
  };

  const reserveMaterialForMRP = (profileCode: string, quantityMeters: number) => {
    const mrp = calculateMRP(profileCode, quantityMeters);
    setRawMaterials((prev) =>
      prev.map((rm) => {
        const row = mrp.rows.find((r) => r.materialCode === rm.code);
        if (!row) return rm;
        const toReserve = Math.min(rm.availableQuantity, row.requiredKg);
        const newAvail = Math.max(0, rm.availableQuantity - toReserve);
        return {
          ...rm,
          availableQuantity: newAvail,
          reservedQuantity: rm.reservedQuantity + toReserve,
          status:
            newAvail === 0
              ? 'Out of Stock'
              : newAvail < rm.minimumLevel * 0.5
              ? 'Critical'
              : newAvail < rm.minimumLevel
              ? 'Low'
              : 'Healthy',
        };
      })
    );
    logActivity(
      'Inventory',
      'Raw Material Reserved',
      profileCode,
      `Reserved available raw material batch for ${quantityMeters}m of ${profileCode}`
    );
    showToast(`Reserved available stock for ${quantityMeters}m of ${profileCode}`, 'success');
  };

  const generatePurchaseRequirementFromMRP = (
    profileCode: string,
    quantityMeters: number
  ): PurchaseRequirement => {
    const mrp = calculateMRP(profileCode, quantityMeters);
    const shortageRows = mrp.rows.filter((r) => r.shortageKg > 0);
    const pr: PurchaseRequirement = {
      id: `PR-2026-00${90 + purchaseRequirements.length}`,
      createdAt: '03 Oct 2026',
      profileCode,
      productionQuantityMeters: quantityMeters,
      items: (shortageRows.length > 0 ? shortageRows : mrp.rows.slice(0, 1)).map((r) => ({
        materialId: r.materialId,
        materialCode: r.materialCode,
        materialName: r.materialName,
        shortageKg: r.shortageKg > 0 ? r.shortageKg : 500,
        estimatedCost: (r.shortageKg > 0 ? r.shortageKg : 500) * r.unitCost,
        supplier: r.supplier,
      })),
      status: 'Open',
      requestedBy: currentEmployee.name,
    };
    setPurchaseRequirements((prev) => [pr, ...prev]);
    logActivity(
      'Inventory',
      'Purchase Requirement Generated',
      pr.id,
      `Generated purchase indent ${pr.id} for ${profileCode} (${quantityMeters}m)`
    );
    showToast(`Purchase Requirement ${pr.id} generated!`, 'success');
    return pr;
  };

  const stockInRawMaterial = (materialId: string, quantity: number, notes: string) => {
    const target = rawMaterials.find((r) => r.id === materialId || r.code === materialId);
    if (!target) return;
    const before = `${target.availableQuantity} ${target.unit}`;
    const afterQty = target.availableQuantity + quantity;

    setRawMaterials((prev) =>
      prev.map((r) =>
        r.id === target.id
          ? {
              ...r,
              availableQuantity: afterQty,
              lastPurchaseDate: '03 Oct 2026',
              status:
                afterQty >= r.minimumLevel
                  ? 'Healthy'
                  : afterQty >= r.minimumLevel * 0.5
                  ? 'Low'
                  : 'Critical',
            }
          : r
      )
    );

    const sm: StockMovement = {
      id: `SM-${1006 + stockMovements.length}`,
      date: '03 Oct 2026 (Just Now)',
      itemCode: target.code,
      itemName: target.name,
      itemCategory: 'Raw Material',
      movementType: 'Purchase',
      quantity,
      unit: target.unit,
      referenceId: `GRN-2026-${420 + stockMovements.length}`,
      performedBy: currentEmployee.name,
      notes: notes || 'Raw material stock inward entry',
    };
    setStockMovements((prev) => [sm, ...prev]);
    logActivity(
      'Inventory',
      'Raw Material Stock In',
      target.code,
      `Added ${quantity} ${target.unit} of ${target.name}`,
      before,
      `${afterQty} ${target.unit}`
    );
    showToast(`Stocked in +${quantity} ${target.unit} for ${target.code}`, 'success');
  };

  const adjustRawMaterialStock = (materialId: string, newQuantity: number, reason: string) => {
    const target = rawMaterials.find((r) => r.id === materialId || r.code === materialId);
    if (!target) return;
    const diff = newQuantity - target.availableQuantity;
    const before = `${target.availableQuantity} ${target.unit}`;

    setRawMaterials((prev) =>
      prev.map((r) =>
        r.id === target.id
          ? {
              ...r,
              availableQuantity: newQuantity,
              status:
                newQuantity === 0
                  ? 'Out of Stock'
                  : newQuantity >= r.minimumLevel
                  ? 'Healthy'
                  : newQuantity >= r.minimumLevel * 0.5
                  ? 'Low'
                  : 'Critical',
            }
          : r
      )
    );

    const sm: StockMovement = {
      id: `SM-${1006 + stockMovements.length}`,
      date: '03 Oct 2026 (Just Now)',
      itemCode: target.code,
      itemName: target.name,
      itemCategory: 'Raw Material',
      movementType: 'Adjustment',
      quantity: diff,
      unit: target.unit,
      referenceId: `ADJ-2026-${100 + stockMovements.length}`,
      performedBy: currentEmployee.name,
      notes: reason || 'Physical silo audit adjustment',
    };
    setStockMovements((prev) => [sm, ...prev]);
    logActivity(
      'Inventory',
      'Stock Adjusted',
      target.code,
      `Adjusted ${target.code} stock (${reason})`,
      before,
      `${newQuantity} ${target.unit}`
    );
    showToast(`Adjusted ${target.code} stock to ${newQuantity} ${target.unit}`, 'info');
  };

  const updateProductPrice = (productId: string, sellingPrice: number, dealerPrice: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, sellingPrice, dealerPrice } : p))
    );
    logActivity(
      'Inventory',
      'Product Price Updated',
      prod.code,
      `Updated rate for ${prod.code}`,
      `₹${prod.sellingPrice}/m`,
      `₹${sellingPrice}/m`
    );
    showToast(`Updated pricing for ${prod.code}`, 'success');
  };

  // 4. QUOTATIONS & APPROVAL WORKFLOW
  const createQuotation = (
    quotationData: Omit<Quotation, 'id' | 'createdAt' | 'timeline'>
  ): Quotation => {
    const newId = `QT-2026-00${422 + quotations.length - 14}`;
    const newQt: Quotation = {
      ...quotationData,
      id: newId,
      createdAt: '03 Oct 2026',
      timeline: [
        {
          id: `QTT-${Date.now()}`,
          timestamp: 'Just Now',
          title: `Quotation ${quotationData.status === 'Pending Approval' ? 'Submitted for Approval' : 'Created'}`,
          actor: currentEmployee.name,
          type: 'info',
        },
      ],
    };
    setQuotations((prev) => [newQt, ...prev]);
    setFabricators((prev) =>
      prev.map((f) =>
        f.id === quotationData.fabricatorId
          ? { ...f, openQuotationsCount: f.openQuotationsCount + 1 }
          : f
      )
    );
    logActivity(
      'Quotation',
      'Quotation Created',
      newId,
      `Created quotation ${newId} for ${quotationData.fabricatorName} (₹${quotationData.grandTotal.toLocaleString('en-IN')})`
    );
    emitWebhook('quotation.created', {
      quotationId: newId,
      fabricatorId: quotationData.fabricatorId,
      grandTotal: quotationData.grandTotal,
    });
    showToast(`Quotation ${newId} saved (${quotationData.status})!`, 'success');
    return newQt;
  };

  const submitQuotationForApproval = (quotationId: string) => {
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: 'Pending Approval',
              timeline: [
                {
                  id: `QTT-${Date.now()}`,
                  timestamp: 'Just Now',
                  title: 'Submitted for Sales Manager Approval',
                  actor: currentEmployee.name,
                  type: 'info',
                },
                ...q.timeline,
              ],
            }
          : q
      )
    );
    logActivity(
      'Quotation',
      'Submitted for Approval',
      quotationId,
      `Submitted ${quotationId} for Sales Manager review`,
      'Draft',
      'Pending Approval'
    );
    showToast(`Quotation ${quotationId} submitted for approval`, 'info');
  };

  const approveQuotation = (quotationId: string) => {
    if (currentEmployee.role === 'Sales Executive') {
      showToast('Sales Executives cannot approve quotations. Switch to Sales Manager or Admin.', 'warning');
      return;
    }
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: 'Approved',
              approvedBy: currentEmployee.name,
              timeline: [
                {
                  id: `QTT-${Date.now()}`,
                  timestamp: 'Just Now',
                  title: `Approved by ${currentEmployee.name} (${currentEmployee.role})`,
                  actor: currentEmployee.name,
                  type: 'success',
                },
                ...q.timeline,
              ],
            }
          : q
      )
    );
    logActivity(
      'Quotation',
      'Quotation Approved',
      quotationId,
      `Approved quotation ${quotationId}`,
      'Pending Approval',
      'Approved'
    );
    emitWebhook('quotation.approved', { quotationId, approvedBy: currentEmployee.name });
    showToast(`Quotation ${quotationId} Approved! Ready to convert to Sales Order.`, 'success');
  };

  const rejectQuotation = (quotationId: string, reason: string) => {
    if (currentEmployee.role === 'Sales Executive') {
      showToast('Sales Executives cannot reject quotations.', 'warning');
      return;
    }
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: 'Rejected',
              rejectionReason: reason,
              timeline: [
                {
                  id: `QTT-${Date.now()}`,
                  timestamp: 'Just Now',
                  title: `Rejected by ${currentEmployee.name}`,
                  description: reason,
                  actor: currentEmployee.name,
                  type: 'danger',
                },
                ...q.timeline,
              ],
            }
          : q
      )
    );
    logActivity(
      'Quotation',
      'Quotation Rejected',
      quotationId,
      `Rejected ${quotationId}: ${reason}`,
      'Pending Approval',
      'Rejected'
    );
    showToast(`Quotation ${quotationId} marked as Rejected`, 'warning');
  };

  const duplicateQuotation = (quotationId: string): Quotation | null => {
    const orig = quotations.find((q) => q.id === quotationId);
    if (!orig) return null;
    return createQuotation({
      ...orig,
      status: 'Draft',
      approvedBy: undefined,
      convertedOrderId: undefined,
      notes: `Duplicated from ${orig.id}. ${orig.notes}`,
    });
  };

  // 5. SALES ORDERS
  const convertQuotationToOrder = (quotationId: string): SalesOrder | null => {
    const qt = quotations.find((q) => q.id === quotationId);
    if (!qt) return null;

    const newOrderId = `SO-2026-${1083 + salesOrders.length - 9}`;
    const orderItems = qt.items.map((item, idx) => {
      const prod = products.find((p) => p.id === item.productId || p.code === item.profileCode);
      const avail = prod ? Math.max(0, prod.currentStock - prod.reservedStock) : 0;
      const alloc = Math.min(avail, item.quantity);
      const prodReq = Math.max(0, item.quantity - alloc);
      return {
        id: `SOI-NEW-${idx}-${Date.now()}`,
        productId: item.productId,
        profileCode: item.profileCode,
        profileName: prod?.name || item.description,
        color: prod?.color || 'White',
        orderedQuantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        amount: item.totalAmount,
        availableStock: avail,
        allocatedStock: alloc,
        productionRequiredQuantity: prodReq,
      };
    });

    const needsProduction = orderItems.some((i) => i.productionRequiredQuantity > 0);

    const newOrder: SalesOrder = {
      id: newOrderId,
      fabricatorId: qt.fabricatorId,
      fabricatorName: qt.fabricatorName,
      quotationId: qt.id,
      orderValue: qt.grandTotal,
      workflowStage: needsProduction ? 'Production Required' : 'Inventory Check',
      productionStatus: needsProduction ? 'Pending Production' : 'Not Required',
      paymentStatus: 'Unpaid',
      dispatchStatus: 'Pending',
      expectedDate: '14 Oct 2026',
      createdAt: '03 Oct 2026',
      status: needsProduction ? 'Production Required' : 'Inventory Check',
      batchCode: `EXT-B2-09${55 + salesOrders.length}`,
      extruderLine: needsProduction ? 'Extruder Line 02 (Pending Schedule)' : 'Stock Reserved in Rack',
      paidAmount: 0,
      items: orderItems,
      timeline: [
        {
          id: `SOT-${Date.now()}`,
          timestamp: 'Just Now',
          title: `Sales Order Created from Approved Quotation ${qt.id}`,
          description: needsProduction
            ? 'Partial stock reserved; extrusion production required for balance quantity.'
            : '100% stock available in finished profile racks.',
          actor: currentEmployee.name,
          type: 'success',
        },
      ],
    };

    setSalesOrders((prev) => [newOrder, ...prev]);
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotationId ? { ...q, convertedOrderId: newOrderId } : q))
    );
    setFabricators((prev) =>
      prev.map((f) =>
        f.id === qt.fabricatorId
          ? {
              ...f,
              openOrdersCount: f.openOrdersCount + 1,
              outstandingAmount: f.outstandingAmount + qt.grandTotal,
              lastOrderDate: '03 Oct 2026',
            }
          : f
      )
    );

    // Also create a corresponding payment tracking record
    const newPay: PaymentTransaction = {
      id: `PAY-2026-0${892 + payments.length}`,
      fabricatorId: qt.fabricatorId,
      fabricatorName: qt.fabricatorName,
      orderId: newOrderId,
      invoiceNo: `INV-2627-0${887 + payments.length}`,
      orderTotalAmount: qt.grandTotal,
      paidAmount: 0,
      outstandingAmount: qt.grandTotal,
      dueDate: '18 Oct 2026',
      status: 'Due Today',
      lastPaymentMethod: 'Bank Transfer',
      referenceNo: 'Pending Receipt',
      paymentDate: '—',
      recordedBy: currentEmployee.name,
    };
    setPayments((prev) => [newPay, ...prev]);

    logActivity(
      'Sales Order',
      'Quotation Converted to Order',
      newOrderId,
      `Converted ${qt.id} to Sales Order ${newOrderId} for ${qt.fabricatorName}`
    );
    emitWebhook('order.created', {
      orderId: newOrderId,
      quotationId: qt.id,
      fabricatorId: qt.fabricatorId,
      orderValue: qt.grandTotal,
    });
    showToast(`Sales Order ${newOrderId} created from ${qt.id}!`, 'success');
    return newOrder;
  };

  const createSalesOrder = (data: {
    fabricatorId: string;
    quotationId?: string;
    expectedDate: string;
    items: { productId: string; quantity: number; rate: number }[];
  }): SalesOrder => {
    const fab = fabricators.find((f) => f.id === data.fabricatorId) || fabricators[0];
    const newOrderId = `SO-2026-${1083 + salesOrders.length - 9}`;

    const orderItems = data.items.map((item, idx) => {
      const prod = products.find((p) => p.id === item.productId) || products[0];
      const avail = Math.max(0, prod.currentStock - prod.reservedStock);
      const alloc = Math.min(avail, item.quantity);
      const prodReq = Math.max(0, item.quantity - alloc);
      const lineTotal = Math.round(item.quantity * item.rate * 1.18);
      return {
        id: `SOI-MAN-${idx}-${Date.now()}`,
        productId: prod.id,
        profileCode: prod.code,
        profileName: prod.name,
        color: prod.color,
        orderedQuantity: item.quantity,
        unit: prod.unit,
        rate: item.rate,
        amount: lineTotal,
        availableStock: avail,
        allocatedStock: alloc,
        productionRequiredQuantity: prodReq,
      };
    });

    const totalValue = orderItems.reduce((sum, i) => sum + i.amount, 0);
    const needsProduction = orderItems.some((i) => i.productionRequiredQuantity > 0);

    const newOrder: SalesOrder = {
      id: newOrderId,
      fabricatorId: fab.id,
      fabricatorName: fab.name,
      quotationId: data.quotationId || 'DIRECT-SO',
      orderValue: totalValue,
      workflowStage: needsProduction ? 'Production Required' : 'Inventory Check',
      productionStatus: needsProduction ? 'Pending Production' : 'Not Required',
      paymentStatus: 'Unpaid',
      dispatchStatus: 'Pending',
      expectedDate: data.expectedDate || '15 Oct 2026',
      createdAt: '03 Oct 2026',
      status: needsProduction ? 'Production Required' : 'Inventory Check',
      batchCode: `EXT-B1-09${60 + salesOrders.length}`,
      extruderLine: needsProduction ? 'Extruder Line 02' : 'Rack Allocated',
      paidAmount: 0,
      items: orderItems,
      timeline: [
        {
          id: `SOT-${Date.now()}`,
          timestamp: 'Just Now',
          title: 'Sales Order Created',
          actor: currentEmployee.name,
          type: 'info',
        },
      ],
    };

    setSalesOrders((prev) => [newOrder, ...prev]);
    logActivity('Sales Order', 'Order Created', newOrderId, `Created order ${newOrderId} for ${fab.name}`);
    emitWebhook('order.created', { orderId: newOrderId, fabricatorId: fab.id, orderValue: totalValue });
    showToast(`Sales Order ${newOrderId} created!`, 'success');
    return newOrder;
  };

  const advanceOrderWorkflow = (orderId: string) => {
    const order = salesOrders.find((o) => o.id === orderId);
    if (!order) return;

    const stageOrder: SalesOrder['workflowStage'][] = [
      'Quotation Approved',
      'Order Created',
      'Inventory Check',
      'Production Required',
      'Production',
      'Ready',
      'Dispatch',
      'Completed',
    ];
    const currentIndex = stageOrder.indexOf(order.workflowStage);
    const nextStage = stageOrder[Math.min(stageOrder.length - 1, currentIndex + 1)];

    // If advancing into Production, automatically create a Production Order if none exists
    if (nextStage === 'Production' || order.workflowStage === 'Production Required') {
      const itemNeedingProd = order.items.find((i) => i.productionRequiredQuantity > 0) || order.items[0];
      if (itemNeedingProd && !productionOrders.some((p) => p.orderId === order.id)) {
        createProductionOrder({
          orderId: order.id,
          productId: itemNeedingProd.productId,
          requiredQuantity:
            itemNeedingProd.productionRequiredQuantity > 0
              ? itemNeedingProd.productionRequiredQuantity
              : itemNeedingProd.orderedQuantity,
          dueDate: order.expectedDate,
          extruderLine: 'Extruder Line 02 (KraussMaffei KM-65)',
        });
      }
    }

    setSalesOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              workflowStage: nextStage,
              productionStatus:
                nextStage === 'Production'
                  ? 'In Production'
                  : nextStage === 'Ready' || nextStage === 'Dispatch' || nextStage === 'Completed'
                  ? 'Completed'
                  : o.productionStatus,
              dispatchStatus:
                nextStage === 'Ready'
                  ? 'Ready to Dispatch'
                  : nextStage === 'Dispatch'
                  ? 'Dispatched'
                  : nextStage === 'Completed'
                  ? 'Delivered'
                  : o.dispatchStatus,
              status:
                nextStage === 'Production'
                  ? 'In Production'
                  : nextStage === 'Ready'
                  ? 'Ready for Dispatch'
                  : nextStage === 'Dispatch'
                  ? 'Dispatched'
                  : nextStage === 'Completed'
                  ? 'Completed'
                  : o.status,
              timeline: [
                {
                  id: `SOT-${Date.now()}`,
                  timestamp: 'Just Now',
                  title: `Workflow Advanced to "${nextStage}"`,
                  actor: currentEmployee.name,
                  type: 'success',
                },
                ...o.timeline,
              ],
            }
          : o
      )
    );
    logActivity('Sales Order', 'Workflow Stage Updated', orderId, `Advanced ${orderId} to ${nextStage}`);
    showToast(`Order ${orderId} moved to stage: ${nextStage}`, 'success');
  };

  // 6. PRODUCTION ORDERS
  const createProductionOrder = (data: {
    orderId?: string;
    productId: string;
    requiredQuantity: number;
    dueDate: string;
    extruderLine: string;
  }): ProductionOrder => {
    const prod = products.find((p) => p.id === data.productId) || products[0];
    const linkedOrder = salesOrders.find((o) => o.id === data.orderId);
    const mrp = calculateMRP(prod.code, data.requiredQuantity);
    const newPoId = `PO-2026-00${128 + productionOrders.length - 5}`;

    const newPo: ProductionOrder = {
      id: newPoId,
      orderId: data.orderId,
      fabricatorName: linkedOrder?.fabricatorName || 'Stock Replenishment',
      productId: prod.id,
      profileCode: prod.code,
      profileName: prod.name,
      color: prod.color,
      requiredQuantity: data.requiredQuantity,
      producedQuantity: 0,
      remainingQuantity: data.requiredQuantity,
      rejectedQuantity: 0,
      wastageKg: 0,
      finalQuantity: 0,
      materialStatus:
        mrp.shortageMaterialsCount > 0 ? 'Shortage - Purchase Req' : 'Available & Reserved',
      productionStatus: mrp.shortageMaterialsCount > 0 ? 'Material Pending' : 'Planned',
      extruderLine: data.extruderLine || 'Extruder Line 02',
      dueDate: data.dueDate || '12 Oct 2026',
      createdAt: '03 Oct 2026',
      timeline: [
        {
          id: `POT-${Date.now()}`,
          timestamp: 'Just Now',
          title: `Production Order Created (${data.requiredQuantity}m ${prod.code})`,
          actor: currentEmployee.name,
          type: 'info',
        },
      ],
    };

    setProductionOrders((prev) => [newPo, ...prev]);

    if (data.orderId) {
      setSalesOrders((prev) =>
        prev.map((o) =>
          o.id === data.orderId
            ? {
                ...o,
                workflowStage: 'Production',
                productionStatus: 'In Production',
                status: 'In Production',
              }
            : o
        )
      );
    }

    logActivity(
      'Production',
      'Production Order Created',
      newPoId,
      `Created ${newPoId} for ${data.requiredQuantity}m of ${prod.code}`
    );
    showToast(`Production Order ${newPoId} scheduled!`, 'success');
    return newPo;
  };

  const updateProductionOrder = (
    poId: string,
    action: 'start' | 'pause' | 'update_qty' | 'complete',
    producedDelta = 300,
    rejectedDelta = 4
  ) => {
    const po = productionOrders.find((p) => p.id === poId);
    if (!po) return;

    let newProduced = po.producedQuantity;
    let newRejected = po.rejectedQuantity;
    let newStatus = po.productionStatus;
    let actionLabel = '';

    if (action === 'start') {
      newStatus = 'In Production';
      actionLabel = 'Started Extrusion Run';
      emitWebhook('production.started', { productionOrderId: poId, profileCode: po.profileCode });
    } else if (action === 'pause') {
      newStatus = 'Paused';
      actionLabel = 'Paused Extruder Line for Calibration';
    } else if (action === 'update_qty') {
      newProduced = Math.min(po.requiredQuantity, po.producedQuantity + producedDelta);
      newRejected = po.rejectedQuantity + rejectedDelta;
      newStatus = newProduced >= po.requiredQuantity ? 'Completed' : 'In Production';
      actionLabel = `Updated Output: +${producedDelta}m (${newProduced}/${po.requiredQuantity}m)`;
    } else if (action === 'complete') {
      newProduced = po.requiredQuantity;
      newStatus = 'Completed';
      actionLabel = `Completed Production Run (${po.requiredQuantity}m)`;
      emitWebhook('production.completed', {
        productionOrderId: poId,
        profileCode: po.profileCode,
        finalMeters: po.requiredQuantity - po.rejectedQuantity,
      });
    }

    const remaining = Math.max(0, po.requiredQuantity - newProduced);
    const finalQty = Math.max(0, newProduced - newRejected);

    setProductionOrders((prev) =>
      prev.map((p) =>
        p.id === poId
          ? {
              ...p,
              producedQuantity: newProduced,
              remainingQuantity: remaining,
              rejectedQuantity: newRejected,
              finalQuantity: finalQty,
              wastageKg: Number((newRejected * 1.85).toFixed(1)),
              productionStatus: newStatus,
              materialStatus: 'Allocated',
              timeline: [
                {
                  id: `POT-${Date.now()}`,
                  timestamp: 'Just Now',
                  title: actionLabel,
                  actor: currentEmployee.name,
                  type: newStatus === 'Completed' ? 'success' : 'info',
                },
                ...p.timeline,
              ],
            }
          : p
      )
    );

    if (newStatus === 'Completed') {
      // Add finished profile stock to inventory
      setProducts((prev) =>
        prev.map((prod) =>
          prod.id === po.productId || prod.code === po.profileCode
            ? { ...prod, currentStock: prod.currentStock + finalQty, status: 'Active' }
            : prod
        )
      );

      // Update linked Sales Order to Ready for Dispatch
      if (po.orderId) {
        setSalesOrders((prev) =>
          prev.map((o) =>
            o.id === po.orderId
              ? {
                  ...o,
                  workflowStage: 'Ready',
                  productionStatus: 'Completed',
                  dispatchStatus: 'Ready to Dispatch',
                  status: 'Ready for Dispatch',
                  timeline: [
                    {
                      id: `SOT-${Date.now()}`,
                      timestamp: 'Just Now',
                      title: `Production Order ${poId} Completed — Order Ready for Dispatch`,
                      actor: currentEmployee.name,
                      type: 'success',
                    },
                    ...o.timeline,
                  ],
                }
              : o
          )
        );
      }
    }

    logActivity(
      'Production',
      actionLabel,
      poId,
      `${actionLabel} on ${po.extruderLine}`,
      `${po.producedQuantity}m`,
      `${newProduced}m`
    );
    showToast(`${poId}: ${actionLabel}`, 'success');
  };

  const createExtrusionSession = (data: {
    dieNumber: string;
    shift: SessionShift;
    date: string;
    targetBundles: number;
    operatorName: string;
    linkedOrderId?: string;
    notes?: string;
  }): ExtrusionSession => {
    const die = dies.find((d) => d.dieNumber === data.dieNumber) || dies[0];
    const prod = products.find((p) => p.code === die.profileCode) || products[0];
    const targetMeters = data.targetBundles * 36;
    const targetPieces = data.targetBundles * 6;

    // Standard UPVC compound calculation based on weight per meter
    const totalCompoundKg = targetMeters * (die.weightPerMeterKg || 2.5);
    const resinReq = Math.round(totalCompoundKg * 0.78);
    const caco3Req = Math.round(totalCompoundKg * 0.15);
    const tio2Req = Math.round(totalCompoundKg * 0.022);
    const addReq = Math.round(totalCompoundKg * 0.018);

    // Silo stock check
    const resinStock = rawMaterials.find((r) => r.code === 'RM-001')?.availableQuantity || 1200;
    const caco3Stock = rawMaterials.find((r) => r.code === 'RM-002')?.availableQuantity || 4800;
    const tio2Stock = rawMaterials.find((r) => r.code === 'RM-003')?.availableQuantity || 32;
    const addStock = rawMaterials.find((r) => r.code === 'RM-004')?.availableQuantity || 420;

    const resinSessions = resinReq > 0 ? Math.floor(resinStock / resinReq) : 0;
    const caco3Sessions = caco3Req > 0 ? Math.floor(caco3Stock / caco3Req) : 0;
    const tio2Sessions = tio2Req > 0 ? Math.floor(tio2Stock / tio2Req) : 0;
    const addSessions = addReq > 0 ? Math.floor(addStock / addReq) : 0;

    const maxSessionsPossible = Math.min(resinSessions, caco3Sessions, tio2Sessions, addSessions);
    const remainingSessions = Math.max(0, maxSessionsPossible - 1);

    const newId = `SES-2026-00${43 + extrusionSessions.length}`;
    const newSession: ExtrusionSession = {
      id: newId,
      sessionCode: `SES-${die.dieNumber.replace('DIE-', '')}-${String(extrusionSessions.length + 1).padStart(2, '0')}`,
      dieNumber: die.dieNumber,
      profileCode: die.profileCode,
      profileName: prod.name,
      extruderLine: die.extruderLine,
      shift: data.shift,
      date: data.date,
      targetMeters,
      targetBundles: data.targetBundles,
      targetPieces,
      status: 'Scheduled',
      resinRequiredKg: resinReq,
      calciumCarbonateRequiredKg: caco3Req,
      tio2RequiredKg: tio2Req,
      additivesRequiredKg: addReq,
      maxSessionsPossibleWithStock: maxSessionsPossible,
      remainingSessionsSupported: remainingSessions,
      producedMeters: 0,
      producedBundles: 0,
      scrapMeters: 0,
      operatorName: data.operatorName || currentEmployee.name,
      linkedOrderId: data.linkedOrderId,
      notes: data.notes,
    };

    setExtrusionSessions((prev) => [newSession, ...prev]);
    logActivity(
      'Production',
      'Extrusion Session Scheduled',
      newId,
      `Scheduled session for ${data.targetBundles} Sets (${targetMeters}m) of ${die.profileCode} using die ${die.dieNumber} on ${die.extruderLine}`
    );
    showToast(`Extrusion Session ${newSession.sessionCode} scheduled successfully!`, 'success');
    return newSession;
  };

  const updateExtrusionSessionStatus = (
    sessionId: string,
    status: SessionStatus,
    producedDeltaMeters = 0,
    scrapDeltaMeters = 0
  ) => {
    const ses = extrusionSessions.find((s) => s.id === sessionId);
    if (!ses) return;

    const newProducedMeters = Math.min(ses.targetMeters, ses.producedMeters + producedDeltaMeters);
    const newProducedBundles = Math.floor(newProducedMeters / 36);
    const newScrapMeters = ses.scrapMeters + scrapDeltaMeters;

    setExtrusionSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status,
              producedMeters: newProducedMeters,
              producedBundles: newProducedBundles,
              scrapMeters: newScrapMeters,
            }
          : s
      )
    );

    if (status === 'Completed') {
      const addedMeters = ses.targetMeters - ses.scrapMeters;
      const addedBundles = Math.floor(addedMeters / 36);
      setProducts((prev) =>
        prev.map((p) =>
          p.code === ses.profileCode
            ? { ...p, currentStock: p.currentStock + addedMeters }
            : p
        )
      );
      const movement: StockMovement = {
        id: `SM-${Date.now().toString().slice(-4)}`,
        date: 'Today, Just Now',
        itemCode: ses.profileCode,
        itemName: ses.profileName,
        itemCategory: 'UPVC Profile',
        movementType: 'Production In',
        quantity: addedMeters,
        unit: 'meters',
        referenceId: ses.sessionCode,
        performedBy: currentEmployee.name,
        notes: `Extruded from Line (${ses.targetBundles} Sets)`,
      };
      setStockMovements((prev) => [movement, ...prev]);
      showToast(`Session ${ses.sessionCode} completed! +${addedBundles} Sets added to inventory.`, 'success');
    } else {
      showToast(`Session ${ses.sessionCode} updated to ${status}.`, 'info');
    }
  };

  const addProfileBundleStock = (
    productId: string,
    bundlesCount: number,
    rackLocation = 'Warehouse Rack A-01',
    notes = 'Manual Bundle Stacking (Sets of 6)'
  ) => {
    const prod = products.find((p) => p.id === productId || p.code === productId);
    if (!prod) return;
    const addedMeters = bundlesCount * 36;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === prod.id ? { ...p, currentStock: p.currentStock + addedMeters } : p
      )
    );
    const movement: StockMovement = {
      id: `SM-${Date.now().toString().slice(-4)}`,
      date: 'Today, Just Now',
      itemCode: prod.code,
      itemName: prod.name,
      itemCategory: 'UPVC Profile',
      movementType: 'Production In',
      quantity: addedMeters,
      unit: 'meters',
      referenceId: `SET6-${bundlesCount}BUNDLES`,
      performedBy: currentEmployee.name,
      notes: `${notes} (${bundlesCount} Sets)`,
    };
    setStockMovements((prev) => [movement, ...prev]);
    logActivity(
      'Inventory',
      'Profile Stock Added (Sets of 6)',
      prod.code,
      `Manually received ${bundlesCount} Sets (${addedMeters}m) of ${prod.code}. ${notes}`
    );
    showToast(`Added ${bundlesCount} Sets of 6 (${addedMeters} meters) to ${prod.code}!`, 'success');
  };

  // 7. DISPATCH
  const createDispatch = (data: {
    orderId: string;
    transportAgency: string;
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    expectedDelivery: string;
  }): DispatchRecord => {
    const order = salesOrders.find((o) => o.id === data.orderId) || salesOrders[0];
    const fab = fabricators.find((f) => f.id === order.fabricatorId);
    const newId = `DSP-2026-0${414 + dispatches.length - 6}`;
    const totalMeters = order.items.reduce((sum, i) => sum + i.orderedQuantity, 0);

    const newDsp: DispatchRecord = {
      id: newId,
      orderId: order.id,
      fabricatorId: order.fabricatorId,
      fabricatorName: order.fabricatorName,
      deliveryAddress: fab?.shippingAddress || 'Site Store, Industrial Area',
      itemsSummary: order.items.map((i) => `${i.profileCode} (${i.orderedQuantity} ${i.unit})`).join(', '),
      totalQuantityMeters: totalMeters,
      transportAgency: data.transportAgency || 'Jaipur Golden Transport',
      vehicleNumber: data.vehicleNumber || 'RJ-14-GH-9021',
      driverName: data.driverName || 'Mahesh Gurjar',
      driverPhone: data.driverPhone || '+91 94140 77110',
      dispatchDate: '03 Oct 2026',
      expectedDelivery: data.expectedDelivery || '05 Oct 2026',
      status: 'Ready to Dispatch',
      paymentStatus: order.paymentStatus === 'Paid' ? 'Paid' : 'Credit Approved',
      documents: {
        challanNo: `DC-BHW-26-${1191 + dispatches.length}`,
        invoiceNo: `INV-2627-0${888 + dispatches.length}`,
        eWayBillNo: `EWB-18109928${4000 + dispatches.length}`,
        gatepassNo: `GP-BHW-${4030 + dispatches.length}`,
      },
    };

    setDispatches((prev) => [newDsp, ...prev]);
    setSalesOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              workflowStage: 'Dispatch',
              dispatchStatus: 'Ready to Dispatch',
            }
          : o
      )
    );
    logActivity('Dispatch', 'Dispatch Created', newId, `Scheduled dispatch ${newId} for ${order.id}`);
    emitWebhook('dispatch.created', { dispatchId: newId, orderId: order.id, vehicle: newDsp.vehicleNumber });
    showToast(`Dispatch ${newId} created for Order ${order.id}!`, 'success');
    return newDsp;
  };

  const updateDispatchStatus = (dispatchId: string, status: DispatchRecord['status']) => {
    const dsp = dispatches.find((d) => d.id === dispatchId);
    if (!dsp) return;

    setDispatches((prev) =>
      prev.map((d) => (d.id === dispatchId ? { ...d, status } : d))
    );

    if (status === 'Dispatched Today' || status === 'In Transit') {
      setSalesOrders((prev) =>
        prev.map((o) =>
          o.id === dsp.orderId
            ? { ...o, workflowStage: 'Dispatch', dispatchStatus: 'Dispatched', status: 'Dispatched' }
            : o
        )
      );
    } else if (status === 'Delivered') {
      setSalesOrders((prev) =>
        prev.map((o) =>
          o.id === dsp.orderId
            ? { ...o, workflowStage: 'Completed', dispatchStatus: 'Delivered', status: 'Completed' }
            : o
        )
      );
    }

    logActivity(
      'Dispatch',
      `Marked ${status}`,
      dispatchId,
      `Updated dispatch ${dispatchId} (${dsp.orderId}) to ${status}`,
      dsp.status,
      status
    );
    showToast(`Dispatch ${dispatchId} updated to ${status}`, 'success');
  };

  // 8. PAYMENTS
  const recordPayment = (data: {
    fabricatorId: string;
    orderId: string;
    amount: number;
    method: PaymentMethod;
    referenceNo: string;
  }): PaymentTransaction => {
    const existing = payments.find((p) => p.orderId === data.orderId);
    const fab = fabricators.find((f) => f.id === data.fabricatorId) || fabricators[0];

    let resultPayment: PaymentTransaction;

    if (existing) {
      const newPaid = existing.paidAmount + data.amount;
      const newOut = Math.max(0, existing.orderTotalAmount - newPaid);
      const newStatus: PaymentTransaction['status'] =
        newOut === 0 ? 'Paid' : 'Partially Paid';

      resultPayment = {
        ...existing,
        paidAmount: newPaid,
        outstandingAmount: newOut,
        status: newStatus,
        lastPaymentMethod: data.method,
        referenceNo: data.referenceNo,
        paymentDate: '03 Oct 2026',
        recordedBy: currentEmployee.name,
      };

      setPayments((prev) => prev.map((p) => (p.id === existing.id ? resultPayment : p)));
    } else {
      const order = salesOrders.find((o) => o.id === data.orderId);
      const total = order ? order.orderValue : data.amount;
      const out = Math.max(0, total - data.amount);
      resultPayment = {
        id: `PAY-2026-0${892 + payments.length}`,
        fabricatorId: fab.id,
        fabricatorName: fab.name,
        orderId: data.orderId,
        invoiceNo: `INV-2627-0${890 + payments.length}`,
        orderTotalAmount: total,
        paidAmount: data.amount,
        outstandingAmount: out,
        dueDate: '15 Oct 2026',
        status: out === 0 ? 'Paid' : 'Partially Paid',
        lastPaymentMethod: data.method,
        referenceNo: data.referenceNo,
        paymentDate: '03 Oct 2026',
        recordedBy: currentEmployee.name,
      };
      setPayments((prev) => [resultPayment, ...prev]);
    }

    // Update Sales Order payment status
    setSalesOrders((prev) =>
      prev.map((o) => {
        if (o.id !== data.orderId) return o;
        const updatedPaid = o.paidAmount + data.amount;
        return {
          ...o,
          paidAmount: updatedPaid,
          paymentStatus: updatedPaid >= o.orderValue ? 'Paid' : 'Partially Paid',
        };
      })
    );

    // Update Fabricator outstanding balance
    setFabricators((prev) =>
      prev.map((f) =>
        f.id === data.fabricatorId
          ? { ...f, outstandingAmount: Math.max(0, f.outstandingAmount - data.amount) }
          : f
      )
    );

    logActivity(
      'Payment',
      'Payment Recorded',
      resultPayment.id,
      `Received ₹${data.amount.toLocaleString('en-IN')} via ${data.method} (${data.referenceNo}) from ${fab.name}`
    );
    emitWebhook('payment.received', {
      paymentId: resultPayment.id,
      orderId: data.orderId,
      amount: data.amount,
      method: data.method,
    });
    showToast(`Payment of ₹${data.amount.toLocaleString('en-IN')} recorded!`, 'success');
    return resultPayment;
  };

  return (
    <ERPContext.Provider
      value={{
        activeModule,
        setActiveModule,
        selectedRecordId,
        setSelectedRecordId,
        navigateTo,
        currentEmployee,
        switchRole,
        quickCreateModal,
        setQuickCreateModal,
        toastMessage,
        showToast,
        employees,
        leads,
        fabricators,
        dealers,
        products,
        rawMaterials,
        boms,
        stockMovements,
        purchaseRequirements,
        quotations,
        salesOrders,
        productionOrders,
        dies,
        extrusionSessions,
        dispatches,
        payments,
        activityLogs,
        webhookEvents,
        simulateWhatsAppLead,
        createLead,
        updateLeadStatus,
        assignLead,
        addLeadFollowUp,
        convertLeadToFabricator,
        createFabricator,
        updateFabricator,
        addFabricatorRequirement,
        createDealer,
        toggleDealerFabricator,
        calculateMRP,
        reserveMaterialForMRP,
        generatePurchaseRequirementFromMRP,
        stockInRawMaterial,
        adjustRawMaterialStock,
        updateProductPrice,
        addProfileBundleStock,
        createQuotation,
        submitQuotationForApproval,
        approveQuotation,
        rejectQuotation,
        duplicateQuotation,
        convertQuotationToOrder,
        createSalesOrder,
        advanceOrderWorkflow,
        createProductionOrder,
        updateProductionOrder,
        createExtrusionSession,
        updateExtrusionSessionStatus,
        createDispatch,
        updateDispatchStatus,
        recordPayment,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const ctx = useContext(ERPContext);
  if (!ctx) throw new Error('useERP must be used within ERPProvider');
  return ctx;
};
