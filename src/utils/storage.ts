import { 
  BankProvider, 
  GlobalIndexEntry, 
  StaffMember, 
  TenantConfig, 
  TransactionStatus, 
  VerifiedTransaction 
} from '../types';

const STORAGE_KEYS = {
  TENANT: 'birrverify_tenant',
  STAFF: 'birrverify_staff',
  ACTIVE_STAFF_ID: 'birrverify_active_staff_id',
  TRANSACTIONS: 'birrverify_transactions',
  GLOBAL_INDEX: 'birrverify_global_index',
  OFFLINE_QUEUE: 'birrverify_offline_queue',
};

// Default initial tenant
export const DEFAULT_TENANT: TenantConfig = {
  id: 'tenant-bole-lounge-01',
  businessName: 'Bole Medhanialem Cafe & Grill',
  businessType: 'restaurant',
  operatingMode: 'team',
  defaultCbeSuffix: '10004912',
  telebirrMerchantId: '608291',
  location: 'Cameroon St, Bole, Addis Ababa',
  taxNumber: '0089271649',
};

// Default staff roster with 4-digit PINs
export const DEFAULT_STAFF: StaffMember[] = [
  { id: 'staff-1', name: 'Selamawit Tadesse', pin: '1234', role: 'cashier', active: true, avatarSeed: 'ST' },
  { id: 'staff-2', name: 'Abebe Kebede', pin: '5678', role: 'server', active: true, avatarSeed: 'AK' },
  { id: 'staff-3', name: 'Dawit Mengistu', pin: '9999', role: 'manager', active: true, avatarSeed: 'DM' },
  { id: 'staff-4', name: 'Hana Girma', pin: '4321', role: 'server', active: true, avatarSeed: 'HG' },
];

// Seeded global index entries representing cross-merchant verification history
const INITIAL_GLOBAL_INDEX: Record<string, GlobalIndexEntry> = {
  'FT2401192831': {
    referenceNumber: 'FT2401192831',
    bank: 'cbe',
    amount: 5400.00,
    payerName: 'Kalkidan Zewdu',
    originalTenantId: 'tenant-piazza-boutique',
    originalTenantName: 'Piazza Elegant Fashion',
    originalStaffName: 'Ermias Teshome',
    firstVerifiedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    attemptCount: 1,
  },
  '1010839201': {
    referenceNumber: '1010839201',
    bank: 'telebirr',
    amount: 980.00,
    payerName: 'Surafel Hailu',
    originalTenantId: 'tenant-kazanchis-bar',
    originalTenantName: 'Kazanchis Jazz & Grill',
    originalStaffName: 'Bethlehem Alemu',
    firstVerifiedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    attemptCount: 1,
  },
};

// Seeded verified transactions for realistic instant demonstration
const INITIAL_TRANSACTIONS: VerifiedTransaction[] = [
  {
    id: 'tx-seed-1',
    tenantId: 'tenant-bole-lounge-01',
    tenantName: 'Bole Medhanialem Cafe & Grill',
    bank: 'telebirr',
    referenceNumber: '1010948218',
    amount: 850.00,
    payerName: 'Yohannes Tesfaye',
    payerPhoneOrAccount: '0911***482',
    contextTag: 'Table 3',
    verifiedByStaffId: 'staff-1',
    verifiedByStaffName: 'Selamawit Tadesse',
    verifiedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: 'VERIFIED',
    officialPortalUrl: 'https://telebirr.et/receipt-verification/',
  },
  {
    id: 'tx-seed-2',
    tenantId: 'tenant-bole-lounge-01',
    tenantName: 'Bole Medhanialem Cafe & Grill',
    bank: 'cbe',
    referenceNumber: 'FT2428198734',
    amount: 3200.00,
    payerName: 'Selamawit Bekele',
    payerPhoneOrAccount: '1000***4912',
    accountSuffix: '10004912',
    contextTag: 'VIP Booth A',
    verifiedByStaffId: 'staff-2',
    verifiedByStaffName: 'Abebe Kebede',
    verifiedAt: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
    status: 'VERIFIED',
    officialPortalUrl: 'https://apps.cbe.com.et:8443/receipt/',
  },
  {
    id: 'tx-seed-3',
    tenantId: 'tenant-bole-lounge-01',
    tenantName: 'Bole Medhanialem Cafe & Grill',
    bank: 'awash',
    referenceNumber: 'AWB98271034',
    amount: 1450.00,
    payerName: 'Desta Alemayehu',
    payerPhoneOrAccount: '0132***9021',
    contextTag: 'Table 9',
    verifiedByStaffId: 'staff-4',
    verifiedByStaffName: 'Hana Girma',
    verifiedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    status: 'VERIFIED',
    officialPortalUrl: 'https://awashbank.com/verify-transaction/',
  },
  {
    id: 'tx-seed-4',
    tenantId: 'tenant-bole-lounge-01',
    tenantName: 'Bole Medhanialem Cafe & Grill',
    bank: 'abyssinia',
    referenceNumber: 'BOA78491029',
    amount: 2100.00,
    payerName: 'Mulugeta Assefa',
    payerPhoneOrAccount: '8921***3011',
    contextTag: 'Table 7',
    verifiedByStaffId: 'staff-2',
    verifiedByStaffName: 'Abebe Kebede',
    verifiedAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    status: 'VERIFIED',
    officialPortalUrl: 'https://bankofabyssinia.com/verify/',
  },
  {
    id: 'tx-seed-5',
    tenantId: 'tenant-bole-lounge-01',
    tenantName: 'Bole Medhanialem Cafe & Grill',
    bank: 'dashen',
    referenceNumber: 'DSH82910471',
    amount: 720.00,
    payerName: 'Tsion Haile',
    payerPhoneOrAccount: '0922***6109',
    contextTag: 'Takeout #4',
    verifiedByStaffId: 'staff-1',
    verifiedByStaffName: 'Selamawit Tadesse',
    verifiedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    status: 'VERIFIED',
    officialPortalUrl: 'https://dashenbanksc.com/verify/',
  },
];

// Helper to safely read from localStorage
function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

export const storage = {
  // Tenant
  getTenant(): TenantConfig {
    return getJSON<TenantConfig>(STORAGE_KEYS.TENANT, DEFAULT_TENANT);
  },
  saveTenant(tenant: TenantConfig): void {
    setJSON(STORAGE_KEYS.TENANT, tenant);
  },

  // Staff
  getStaff(): StaffMember[] {
    return getJSON<StaffMember[]>(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
  },
  saveStaff(staff: StaffMember[]): void {
    setJSON(STORAGE_KEYS.STAFF, staff);
  },
  getActiveStaffId(): string {
    return getJSON<string>(STORAGE_KEYS.ACTIVE_STAFF_ID, 'staff-1');
  },
  setActiveStaffId(id: string): void {
    setJSON(STORAGE_KEYS.ACTIVE_STAFF_ID, id);
  },
  getActiveStaff(): StaffMember {
    const staff = this.getStaff();
    const activeId = this.getActiveStaffId();
    return staff.find(s => s.id === activeId) || staff[0] || DEFAULT_STAFF[0];
  },

  // Transactions
  getTransactions(): VerifiedTransaction[] {
    return getJSON<VerifiedTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  },
  saveTransactions(transactions: VerifiedTransaction[]): void {
    setJSON(STORAGE_KEYS.TRANSACTIONS, transactions);
  },

  // Global Anti-Fraud Index
  getGlobalIndex(): Record<string, GlobalIndexEntry> {
    return getJSON<Record<string, GlobalIndexEntry>>(STORAGE_KEYS.GLOBAL_INDEX, INITIAL_GLOBAL_INDEX);
  },
  saveGlobalIndex(index: Record<string, GlobalIndexEntry>): void {
    setJSON(STORAGE_KEYS.GLOBAL_INDEX, index);
  },

  // Core Anti-Fraud Duplicate Verification Check
  verifyReferenceNumber(params: {
    bank: BankProvider;
    referenceNumber: string;
    amount: number;
    payerName: string;
    payerPhoneOrAccount: string;
    contextTag?: string;
    accountSuffix?: string;
    officialPortalUrl?: string;
  }): { transaction: VerifiedTransaction; isDuplicate: boolean } {
    const cleanRef = params.referenceNumber.trim().toUpperCase();
    const tenant = this.getTenant();
    const activeStaff = tenant.operatingMode === 'team' ? this.getActiveStaff() : { id: 'solo_cashier', name: 'Cashier Terminal' };
    const globalIndex = this.getGlobalIndex();
    const existingEntry = globalIndex[cleanRef];

    const now = new Date().toISOString();

    if (existingEntry) {
      // FRAUD DETECTED: This reference code has already been verified on the network!
      existingEntry.attemptCount = (existingEntry.attemptCount || 1) + 1;
      this.saveGlobalIndex(globalIndex);

      const fraudTx: VerifiedTransaction = {
        id: `fraud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        tenantId: tenant.id,
        tenantName: tenant.businessName,
        bank: params.bank,
        referenceNumber: cleanRef,
        amount: params.amount,
        payerName: params.payerName || existingEntry.payerName,
        payerPhoneOrAccount: params.payerPhoneOrAccount,
        accountSuffix: params.accountSuffix,
        contextTag: params.contextTag,
        verifiedByStaffId: activeStaff.id,
        verifiedByStaffName: activeStaff.name,
        verifiedAt: now,
        status: 'FRAUD_DUPLICATE',
        officialPortalUrl: params.officialPortalUrl,
        fraudDetails: {
          originalTenantName: existingEntry.originalTenantName,
          originalStaffName: existingEntry.originalStaffName,
          originalVerifiedAt: existingEntry.firstVerifiedAt,
          originalAmount: existingEntry.amount,
          duplicateAttemptCount: existingEntry.attemptCount,
        },
      };

      // Also log the fraud incident in local audit transactions
      const txs = this.getTransactions();
      this.saveTransactions([fraudTx, ...txs]);

      return { transaction: fraudTx, isDuplicate: true };
    }

    // UNIQUE & VALID: Register into global index
    globalIndex[cleanRef] = {
      referenceNumber: cleanRef,
      bank: params.bank,
      amount: params.amount,
      payerName: params.payerName,
      originalTenantId: tenant.id,
      originalTenantName: tenant.businessName,
      originalStaffName: activeStaff.name,
      firstVerifiedAt: now,
      attemptCount: 1,
    };
    this.saveGlobalIndex(globalIndex);

    // Create verified transaction
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const status: TransactionStatus = isOnline ? 'VERIFIED' : 'PENDING_SYNC';

    const newTx: VerifiedTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId: tenant.id,
      tenantName: tenant.businessName,
      bank: params.bank,
      referenceNumber: cleanRef,
      amount: params.amount,
      payerName: params.payerName,
      payerPhoneOrAccount: params.payerPhoneOrAccount,
      accountSuffix: params.accountSuffix,
      contextTag: params.contextTag,
      verifiedByStaffId: activeStaff.id,
      verifiedByStaffName: activeStaff.name,
      verifiedAt: now,
      status,
      officialPortalUrl: params.officialPortalUrl,
    };

    const txs = this.getTransactions();
    this.saveTransactions([newTx, ...txs]);

    if (!isOnline) {
      const queue = getJSON<VerifiedTransaction[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
      queue.push(newTx);
      setJSON(STORAGE_KEYS.OFFLINE_QUEUE, queue);
    }

    return { transaction: newTx, isDuplicate: false };
  },

  // Offline Sync
  syncOfflineQueue(): number {
    const queue = getJSON<VerifiedTransaction[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    if (!queue.length) return 0;

    const txs = this.getTransactions();
    const updatedTxs = txs.map(t => {
      if (queue.some(q => q.id === t.id)) {
        return { ...t, status: 'VERIFIED' as TransactionStatus };
      }
      return t;
    });

    this.saveTransactions(updatedTxs);
    setJSON(STORAGE_KEYS.OFFLINE_QUEUE, []);
    return queue.length;
  },

  getOfflineQueueCount(): number {
    const queue = getJSON<VerifiedTransaction[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    return queue.length;
  },

  // Reset to initial demo data
  resetDemoData(): void {
    setJSON(STORAGE_KEYS.TENANT, DEFAULT_TENANT);
    setJSON(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
    setJSON(STORAGE_KEYS.ACTIVE_STAFF_ID, 'staff-1');
    setJSON(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setJSON(STORAGE_KEYS.GLOBAL_INDEX, INITIAL_GLOBAL_INDEX);
    setJSON(STORAGE_KEYS.OFFLINE_QUEUE, []);
  },
};
