import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  Download, 
  Search, 
  Filter, 
  Users, 
  ArrowLeft, 
  Calendar, 
  Building2, 
  ExternalLink,
  Tag,
  RefreshCw,
  Eye,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { BankProvider, StaffMember, TenantConfig, TransactionStatus, VerifiedTransaction } from '../types';
import { ETHIOPIAN_BANKS, BANK_LIST } from '../config/banks';
import { BankReceiptSlip } from './BankReceiptSlip';
import { DailySalesTrendChart } from './DailySalesTrendChart';

interface ManagerDashboardProps {
  tenant: TenantConfig;
  transactions: VerifiedTransaction[];
  staffList: StaffMember[];
  onBackToCashier: () => void;
  onRefreshData: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  tenant,
  transactions,
  staffList,
  onBackToCashier,
  onRefreshData,
}) => {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [previewTx, setPreviewTx] = useState<VerifiedTransaction | null>(null);

  // Computed Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let verifiedCount = 0;
    let fraudCount = 0;
    let fraudValueBlocked = 0;
    const bankTotals: Record<BankProvider, { count: number; total: number }> = {
      telebirr: { count: 0, total: 0 },
      cbe: { count: 0, total: 0 },
      awash: { count: 0, total: 0 },
      abyssinia: { count: 0, total: 0 },
      dashen: { count: 0, total: 0 },
      berhan: { count: 0, total: 0 },
      coop: { count: 0, total: 0 },
    };

    const staffTotals: Record<string, { name: string; count: number; total: number }> = {};

    transactions.forEach(tx => {
      if (tx.status === 'VERIFIED') {
        totalRevenue += tx.amount;
        verifiedCount++;

        if (bankTotals[tx.bank]) {
          bankTotals[tx.bank].count++;
          bankTotals[tx.bank].total += tx.amount;
        }

        const staffKey = tx.verifiedByStaffId || 'unknown';
        if (!staffTotals[staffKey]) {
          staffTotals[staffKey] = {
            name: tx.verifiedByStaffName || 'Staff',
            count: 0,
            total: 0,
          };
        }
        staffTotals[staffKey].count++;
        staffTotals[staffKey].total += tx.amount;
      } else if (tx.status === 'FRAUD_DUPLICATE') {
        fraudCount++;
        fraudValueBlocked += tx.amount;
      }
    });

    return {
      totalRevenue,
      verifiedCount,
      fraudCount,
      fraudValueBlocked,
      bankTotals,
      staffTotals,
    };
  }, [transactions]);

  // Filtered List
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesRef = tx.referenceNumber.toLowerCase().includes(query);
        const matchesPayer = tx.payerName.toLowerCase().includes(query);
        const matchesTag = tx.contextTag?.toLowerCase().includes(query);
        if (!matchesRef && !matchesPayer && !matchesTag) return false;
      }

      // Bank Filter
      if (selectedBankFilter !== 'all' && tx.bank !== selectedBankFilter) {
        return false;
      }

      // Status Filter
      if (selectedStatusFilter !== 'all' && tx.status !== selectedStatusFilter) {
        return false;
      }

      // Staff Filter
      if (selectedStaffFilter !== 'all' && tx.verifiedByStaffId !== selectedStaffFilter) {
        return false;
      }

      return true;
    });
  }, [transactions, searchTerm, selectedBankFilter, selectedStatusFilter, selectedStaffFilter]);

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Client-side Download CSV for Accounting
  const handleDownloadCSV = (useCurrentList: boolean = true) => {
    const listToExport = useCurrentList ? filteredTransactions : transactions;

    if (listToExport.length === 0) {
      alert('No transactions available to download in the current list.');
      return;
    }

    const headers = [
      'Transaction ID',
      'Date (EAT)',
      'Time (EAT)',
      'Status',
      'Payment Provider',
      'Bank Ref Code',
      'Amount (ETB)',
      'Customer / Payer',
      'Phone or Account',
      'Merchant Suffix',
      'Order Context Tag',
      'Cashier Staff Attribution',
      'Fraud Investigation Note'
    ];

    let totalAmount = 0;
    const rows = listToExport.map(tx => {
      const d = new Date(tx.verifiedAt);
      const dateStr = d.toLocaleDateString('en-CA');
      const timeStr = d.toLocaleTimeString('en-US', { hour12: false });
      const fraudNote = tx.fraudDetails 
        ? `Duplicate reused from ${tx.fraudDetails.originalTenantName} (Cashier: ${tx.fraudDetails.originalStaffName})`
        : '';

      if (tx.status === 'VERIFIED') {
        totalAmount += tx.amount;
      }

      return [
        `"${tx.id}"`,
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${tx.status}"`,
        `"${ETHIOPIAN_BANKS[tx.bank]?.name || tx.bank}"`,
        `"${tx.referenceNumber}"`,
        tx.amount.toFixed(2),
        `"${tx.payerName}"`,
        `"${tx.payerPhoneOrAccount}"`,
        `"${tx.accountSuffix || ''}"`,
        `"${tx.contextTag || ''}"`,
        `"${tx.verifiedByStaffName}"`,
        `"${fraudNote}"`
      ].join(',');
    });

    // Accounting summary footer row
    const summaryRow = [
      `"TOTAL VERIFIED"`,
      `"${new Date().toLocaleDateString('en-CA')}"`,
      `"${listToExport.length} Records"`,
      `"RECONCILED"`,
      `"All Gateways"`,
      `"-"`,
      totalAmount.toFixed(2),
      `"-"`,
      `"-"`,
      `"-"`,
      `"-"`,
      `"-"`,
      `"-"`
    ].join(',');

    const csvContent = [headers.join(','), ...rows, summaryRow].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `birrverify_transactions_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`Downloaded ${listToExport.length} transactions`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCashier}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            title="Return to Cashier POS"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Manager Accounting & Fraud Audit</span>
            </h1>
            <p className="text-xs text-slate-500">
              {tenant.businessName} · Multi-Bank Real-Time Reconciliation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshData}
            className="h-10 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>

          {downloadSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl animate-in fade-in hidden md:inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{downloadSuccess}</span>
            </span>
          )}

          <button
            onClick={() => handleDownloadCSV(true)}
            className="h-10 px-4 bg-purple-700 hover:bg-purple-800 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            title="Download client-side CSV of the current transaction list"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
            ETB {metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{metrics.verifiedCount} cleared transactions today</span>
          </div>
        </div>

        {/* Fraud Interception Blocked */}
        <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Fraud Interceptions</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-700 font-mono tracking-tight tabular-nums">
            {metrics.fraudCount} Blocked
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-1">
            Protected ETB {metrics.fraudValueBlocked.toLocaleString('en-US', { minimumFractionDigits: 2 })} in recycled receipts
          </div>
        </div>

        {/* Average Transaction Value */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Ticket</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
            ETB {metrics.verifiedCount > 0 ? (metrics.totalRevenue / metrics.verifiedCount).toFixed(2) : '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Across 7 Ethiopian payment gateways
          </div>
        </div>

        {/* Active Cashier Roster */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Staff Shift</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
            {Object.keys(metrics.staffTotals).length} Active
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 truncate">
            {tenant.operatingMode === 'team' ? 'Team Mode PIN Attribution' : 'Single Counter Solo Mode'}
          </div>
        </div>
      </div>

      {/* Daily Sales Trend Chart (Recharts) */}
      <DailySalesTrendChart transactions={transactions} />

      {/* Provider Distribution Breakdown & Shift Reconciliation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider Share Breakdown (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Payment Gateway Distribution (Today)
            </h2>
            <span className="text-xs text-slate-500">ETB Volume</span>
          </div>

          <div className="space-y-3">
            {BANK_LIST.map(bank => {
              const data = metrics.bankTotals[bank.id];
              const pct = metrics.totalRevenue > 0 ? (data.total / metrics.totalRevenue) * 100 : 0;

              return (
                <div key={bank.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: bank.primaryColor }}
                      />
                      <span className="font-semibold text-slate-800">{bank.name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({data.count} txs)</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 tabular-nums">
                      ETB {data.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      <span className="text-slate-400 font-normal ml-2 text-[11px]">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.max(pct, data.count > 0 ? 2 : 0)}%`,
                        backgroundColor: bank.primaryColor 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shift Reconciliation per Staff Member */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Shift Balancing
            </h2>
            <span className="text-xs text-purple-700 font-semibold">By Cashier</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(metrics.staffTotals).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No shift entries recorded yet.</p>
            ) : (
              Object.entries(metrics.staffTotals).map(([id, info]) => (
                <div key={id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{info.name}</div>
                    <div className="text-[11px] text-slate-500">{info.count} verified orders</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                      ETB {info.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium">Reconciled</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Filterable Audit Stream & Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference, customer, or tag..."
              className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-purple-600 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bank Filter */}
            <select
              value={selectedBankFilter}
              onChange={(e) => setSelectedBankFilter(e.target.value)}
              className="h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden font-medium"
            >
              <option value="all">All Gateways</option>
              {BANK_LIST.map(b => (
                <option key={b.id} value={b.id}>{b.shortName}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="FRAUD_DUPLICATE">Fraud Duplicate</option>
              <option value="PENDING_SYNC">Pending Sync</option>
            </select>

            {/* Staff Filter */}
            {tenant.operatingMode === 'team' && (
              <select
                value={selectedStaffFilter}
                onChange={(e) => setSelectedStaffFilter(e.target.value)}
                className="h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden font-medium"
              >
                <option value="all">All Cashiers</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}

            <button
              onClick={() => handleDownloadCSV(true)}
              className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 ml-auto sm:ml-0"
              title="Download currently filtered transactions as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Reference No.</th>
                <th className="py-3 px-4">Customer & Tag</th>
                <th className="py-3 px-4 text-right">Amount (ETB)</th>
                <th className="py-3 px-4">Attribution</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No transactions matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const bank = ETHIOPIAN_BANKS[tx.bank] || ETHIOPIAN_BANKS.cbe;
                  const isFraud = tx.status === 'FRAUD_DUPLICATE';
                  const timeStr = new Date(tx.verifiedAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr 
                      key={tx.id} 
                      className={`hover:bg-slate-50 transition-colors ${isFraud ? 'bg-red-50/40' : ''}`}
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {timeStr}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: bank.primaryColor }}
                          />
                          <span className="font-medium text-slate-900">{bank.shortName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {tx.referenceNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{tx.payerName}</div>
                        {tx.contextTag && (
                          <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium inline-block mt-0.5">
                            {tx.contextTag}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        ETB {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {tx.verifiedByStaffName}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isFraud ? (
                          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>DUPLICATE BLOCKED</span>
                          </span>
                        ) : tx.status === 'PENDING_SYNC' ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                            QUEUED OFFLINE
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>VERIFIED</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setPreviewTx(tx)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Inspect authentic bank receipt slip"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Modal Preview */}
      {previewTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setPreviewTx(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 bg-slate-100 rounded-lg"
              >
                Close Preview
              </button>
            </div>
            <BankReceiptSlip
              transaction={previewTx}
              onVerifyNext={() => setPreviewTx(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
