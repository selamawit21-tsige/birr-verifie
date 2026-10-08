# Multi-Bank Digital Payment Verification System (Ethiopia)

A high-speed, anti-fraud Progressive Web App (PWA) tailored for Ethiopian retail, restaurants, and kiosks that verifies digital receipts in real time across Telebirr, CBE Birr/Mobile, Awash Bank, Bank of Abyssinia, Dashen/Amole, Berhan Bank, and Cooperative Bank of Oromia (CoOP), blocking fabricated Telegram bot receipts and recycled screenshots before goods or services are released.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Operational Architecture Decisions**:
> - **Verification Engine**: Hybrid execution model featuring live bank portal linkouts and an authentic official receipt simulation/parser engine matching exact Ethiopian bank typography, logos, and verification stamps (CBE FT slip format, Telebirr green slip, Awash receipt, BOA, Dashen/Amole, Berhan, CoOP).
> - **Anti-Fraud Scope**: Cross-merchant centralized ledger index. If a reference code (e.g. CBE FT code `FT24098...` or Telebirr TransNo `1010...`) was previously registered by *any* merchant or counter on the network, it immediately triggers an uncompromising full-screen crimson alert: **"FRAUD DETECTED: This reference code has already been verified"** with timestamp, merchant location, and staff tag.
> - **Cashier Input Suite**: Multi-modal input supporting real-time camera viewfinder with automated QR/barcode extraction, hardware USB/Bluetooth barcode scanner input wedge listening, and quick ergonomic touch numpad/keyboard with pre-filled bank prefixes and account suffixes.

---

## 1. Overview & Core Concept

### What It Does
The platform equips cashiers and frontline service staff with a rapid 3-tap verification terminal on their phones, tablets, or POS registers. Instead of relying on screenshots presented by customers or calling an absent business owner to verify an SMS alert, staff select the bank provider, scan or enter the reference code, attach an optional order/table tag, and immediately receive verified payment clearance with amount in Ethiopian Birr (ETB), payer name, and authentic bank slip display.

### Target Audience & Personas
1. **Frontline Cashiers & Waiters**: Need sub-3-second verification with single-hand thumb navigation, large touch targets, camera scanning, and zero administrative clutter.
2. **Shop Owners & Managers (Solo & Team)**: Need real-time visibility into collected revenue (ETB), cash/digital breakdown, active cashier attribution, duplicate fraud audit logs, and one-click CSV/Excel export for Ethiopian tax and accounting balance sheets.

### Operating Modes
- **Solo Mode**: Designed for boutiques, kiosks, pharmacies, and single-register stores. Streamlined, single-tap verification without staff login or PIN prompts.
- **Team Mode**: Designed for busy restaurants, lounges, and multi-counter supermarkets. Requires a swift 4-digit staff PIN with shift switching, server attribution (e.g., Table 4, Reg 2), and staff reconciliation stats.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ FLOW 1: CASHIER VERIFICATION ]
Select Provider ──► Scan QR or Enter Ref # ──► Anti-Fraud Check ──► Verified Slip (ETB)
   (CBE, Telebirr,      (Camera scanner /         (Global Ledger)    (Shows amount, payer,
    Awash, BOA, etc.)    touch keyboard)                              authentic bank slip)
                                                        │
                                                        ▼ (If Duplicate Detected)
                                              [ Crimson Fraud Alert Screen ]

[ FLOW 2: SHIFT RECONCILIATION & MANAGER AUDIT ]
Manager Portal ──► Real-Time Daily ETB ──► Audit Stream Filter ──► 1-Click CSV Export
                    (Bank breakdown &       (Search by staff,       (Ethiopian FY format
                     hourly velocity)        bank, or table)         ready for tax/audit)
```

### Visual Identity & Theme
- **Color Palette & Brand Authenticity**:
  - **Neutral Canvas**: Clean Slate Light (`#F8FAFC` background, `#FFFFFF` cards with crisp hairline border `border-slate-200`) and Dark Slate POS mode (`#0F172A`).
  - **Bank Identity Accents**: 
    - **Telebirr**: Signature Ethio Telecom Blue (`#0072CE`) & Vivid Green (`#22C55E`).
    - **Commercial Bank of Ethiopia (CBE)**: CBE Imperial Purple (`#5C068C`) & Gold (`#F5A623`).
    - **Awash Bank**: Awash Royal Blue (`#0B3B60`) & Orange (`#FF7900`).
    - **Bank of Abyssinia (BOA)**: Deep Maroon (`#8B1538`) & Gold (`#D4AF37`).
    - **Dashen Bank / Amole**: Dashen Navy (`#1E3A8A`) & Cyan (`#06B6D4`).
    - **Berhan Bank**: Berhan Crimson/Gold (`#B91C1C`).
    - **Cooperative Bank of Oromia (CoOP)**: CoOP Orange/Green (`#EA580C`).
  - **Fraud Semantic Alert**: High-contrast Crimson (`#DC2626`) with haptic/sound cue and bold white typography.
  - **Success Semantic**: Forest Green (`#16A34A`) with clean verified stamp typography.
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` font for crisp modern legibility.
  - Financial Figures & Reference Codes: Monospace tabular numerals (`font-mono tabular-nums`) for currency amounts, FT transaction codes, and timestamps.
- **Mobile Ergonomics**:
  - Bottom 40% thumb zone holds primary action buttons and numpad.
  - Generous touch targets $\ge 48\text{px}$ for rapid counter tapping under bright daylight or dim restaurant lighting.
  - Zero-pill metadata design: clean inline text separators (`·`), no generic candy badges.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Why Chosen | Alternative Considered |
| :--- | :--- | :--- | :--- |
| **Receipt Verification Engine** | Dual Live Bank Portal Link + Authentic Embedded Receipt Generator | Provides immediate zero-friction verification during counter rush while also offering 1-click external portal check and deep reference decoding. | Live iframe scraping only (fails due to bank `X-Frame-Options` and CAPTCHA walls). |
| **Anti-Fraud Duplicate Detection** | Global Ledger Uniqueness Constraint + Local IndexedDB Cache | Recycled screenshots are the #1 fraud vector in Addis Ababa; a receipt presented at a cafe must never be accepted at an electronics store down the street. | Merchant-only isolation (leaves merchants open to coordinated cross-store receipt fraud). |
| **Barcode & QR Capture** | HTML5 Camera Stream with BarcodeDetector API + Manual Fallback + Hardware Scanner Wedge | Hardware POS barcode guns work via keyboard wedge; mobile phones work via camera video feed. Auto-detects CBE and Telebirr QR schemas. | Pure camera only (unusable on desktop/POS registers with USB hand scanners). |
| **Offline Resilience** | Local Queue with "Pending Sync" + PWA Service Worker manifest | Intermittent internet connectivity across Ethiopia shouldn't stall cashier operations; transactions queue and reconcile when connectivity restores. | Online-only blocking (causes customer lines to freeze during cellular drops). |

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Multi-Tenant Progressive Web App                     │
├──────────────────────────────────┬─────────────────────────────────────┤
│      CASHIER TERMINAL VIEW       │       MANAGER AUDIT DASHBOARD       │
│  - Bank Provider Selection Grid  │  - Daily Verified Revenue (ETB)     │
│  - Camera QR / Barcode Scanner   │  - Provider Breakdown (Pie/Bars)    │
│  - Adaptive FT/TransNo Input     │  - Filterable Transaction Stream    │
│  - Context Tagging (Table/Item)  │  - Shift Balancing & Reconciliation │
│  - Live Verification Card/Slip   │  - 1-Click CSV / Excel Export       │
│  - Full-Screen Fraud Alert Modal │  - Team PIN & Staff Management      │
└─────────────────┬────────────────┴──────────────────┬──────────────────┘
                  │                                   │
                  ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Verification Engine & Anti-Fraud Core                  │
│  - Reference Code Syntax & Checksum Validation (CBE FT, Telebirr, etc) │
│  - Global Centralized Deduplication Index                              │
│  - Bank Verification Route Mapper & Official Portal Dispatcher        │
│  - Authentic Receipt Parser & Slip Visualizer                          │
└─────────────────┬───────────────────────────────────┬──────────────────┘
                  │                                   │
                  ▼                                   ▼
┌──────────────────────────────────┐ ┌───────────────────────────────────┐
│     Persistent Local Storage     │ │     External Bank Gateways        │
│  - IndexedDB / LocalStorage      │ │  - CBE Receipt Verification       │
│  - Isolated Tenant Configs       │ │  - Telebirr Merchant Portal       │
│  - Staff Roster & Offline Queue  │ │  - Awash, BOA, Dashen, CoOP       │
└──────────────────┴───────────────────┴─────────────────────────────────┘
```

### Data Model

1. **MerchantTenant**:
   - `id`: Unique identifier
   - `businessName`: e.g. "Bole Skylight Cafe", "Arat Kilo Boutique"
   - `operatingMode`: `'solo'` | `'team'`
   - `defaultCbeSuffix`: Default 8-digit merchant account suffix (e.g. `10001234`)
   - `telebirrMerchantId`: Short code or merchant phone
   - `currency`: `'ETB'` (Ethiopian Birr)
   - `staffMembers`: `Array<{ id, name, pin, role: 'cashier' | 'manager' }>`

2. **VerifiedTransaction**:
   - `id`: System unique record ID
   - `tenantId`: Business owner attribution
   - `bank`: `'cbe'` | `'telebirr'` | `'awash'` | `'abyssinia'` | `'dashen'` | `'berhan'` | `'coop'`
   - `referenceNumber`: Cleaned, uppercase reference (e.g., `FT2428198734`, `1092837465`)
   - `amount`: Verified amount in ETB
   - `payerName`: Customer or account name
   - `payerAccountOrPhone`: Masked account/phone (e.g., `09****1234`, `1000****5678`)
   - `accountSuffix`: Relevant for CBE or bank branch
   - `contextTag`: Optional reference (e.g., "Table 7", "Black Jacket #12", "POS 2")
   - `verifiedByStaffId`: Staff ID or 'solo_cashier'
   - `verifiedByStaffName`: Staff name (e.g., "Abebe K.", "Selam T.")
   - `verifiedAt`: ISO timestamp
   - `status`: `'VERIFIED'` | `'FRAUD_DUPLICATE'` | `'PENDING_SYNC'`
   - `fraudMetadata`: First seen timestamp, previous store/staff if duplicate attempt

3. **GlobalAntiFraudIndex**:
   - `referenceNumber` $\rightarrow$ `{ firstVerifiedAt, originalTenantName, originalStaffName, amount, bank }`

---

### Step-by-Step Implementation Sequence

1. **Foundation & Bank Registry**:
   - Configure Ethiopian banks (Telebirr, CBE, Awash, Bank of Abyssinia, Dashen, Berhan, CoOP) with exact official styling, reference code validators, and official portal URLs.
   - Pre-populate realistic seed transactions and sample receipt test codes.

2. **Cashier Point-of-Sale Terminal**:
   - Mobile-first, thumb-friendly provider selector with quick bank buttons.
   - Integrated camera barcode/QR scanner with automatic detection and parser.
   - Rapid manual input with uppercase formatting, bank hints, and optional context tags (table number, item name, register).
   - High-priority duplicate fraud alert overlay with alarm sound/visual indicator.
   - Pixel-accurate authentic bank receipt slip renderer with print/share and "Verify Next" flow.

3. **Manager Accounting & Shift Reconciliation**:
   - Daily verified revenue KPI cards in Ethiopian Birr (`ETB`) with tabular figures.
   - Provider breakdown charts and volume comparison.
   - Interactive transaction ledger with search, filtering (bank, staff, date, fraud status), and receipt slip modal preview.
   - Shift balance summary per cashier (for team tip/shift reconciliation).
   - 1-click accounting CSV / Excel export generator formatted for bookkeeping.

4. **Multi-Tenant & Operating Mode Switching**:
   - Seamless switch between Solo Mode (direct one-touch verification) and Team Mode (PIN authentication, active staff banner, shift stats).
   - Staff management with custom 4-digit PINs.
   - Store settings with customizable default CBE account suffix and Telebirr merchant ID.

5. **PWA & Offline Resilience**:
   - Web App Manifest configuration with "Add to Home Screen" support and app shortcuts.
   - Offline status detector with auto-sync queue for pending transactions during cellular dropouts.
