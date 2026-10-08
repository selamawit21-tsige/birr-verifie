export type BankProvider = 
  | 'telebirr'
  | 'cbe'
  | 'awash'
  | 'abyssinia'
  | 'dashen'
  | 'berhan'
  | 'coop';

export interface BankConfig {
  id: BankProvider;
  name: string;
  shortName: string;
  localName: string; // Amharic or Afaan Oromoo
  primaryColor: string;
  accentColor: string;
  textColor: string;
  logoBg: string;
  badgeBg: string;
  refCodePrefix: string;
  refCodePlaceholder: string;
  refPattern: RegExp;
  refHint: string;
  requiresAccountSuffix?: boolean;
  accountSuffixLabel?: string;
  accountSuffixPlaceholder?: string;
  portalUrl: string;
  portalName: string;
  description: string;
}

export type OperatingMode = 'solo' | 'team';

export interface StaffMember {
  id: string;
  name: string;
  pin: string; // 4-digit PIN
  role: 'cashier' | 'server' | 'manager';
  active: boolean;
  avatarSeed?: string;
}

export interface TenantConfig {
  id: string;
  businessName: string;
  businessType: 'restaurant' | 'boutique' | 'supermarket' | 'kiosk' | 'pharmacy';
  operatingMode: OperatingMode;
  defaultCbeSuffix: string;
  telebirrMerchantId: string;
  location: string;
  taxNumber?: string;
}

export type TransactionStatus = 'VERIFIED' | 'FRAUD_DUPLICATE' | 'PENDING_SYNC';

export interface FraudDetails {
  originalTenantName: string;
  originalStaffName: string;
  originalVerifiedAt: string;
  originalAmount: number;
  duplicateAttemptCount: number;
}

export interface VerifiedTransaction {
  id: string;
  tenantId: string;
  tenantName: string;
  bank: BankProvider;
  referenceNumber: string;
  amount: number;
  payerName: string;
  payerPhoneOrAccount: string;
  accountSuffix?: string;
  contextTag?: string; // e.g. "Table 4", "Black Jacket #12", "Register 2"
  verifiedByStaffId: string;
  verifiedByStaffName: string;
  verifiedAt: string; // ISO date string
  status: TransactionStatus;
  officialPortalUrl?: string;
  fraudDetails?: FraudDetails;
  notes?: string;
}

export interface GlobalIndexEntry {
  referenceNumber: string;
  bank: BankProvider;
  amount: number;
  payerName: string;
  originalTenantId: string;
  originalTenantName: string;
  originalStaffName: string;
  firstVerifiedAt: string;
  attemptCount: number;
}
