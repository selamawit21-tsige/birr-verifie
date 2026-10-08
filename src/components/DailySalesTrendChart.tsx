import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { Clock, Building2, TrendingUp, DollarSign, Layers } from 'lucide-react';
import { VerifiedTransaction, BankProvider } from '../types';
import { ETHIOPIAN_BANKS, BANK_LIST } from '../config/banks';

interface DailySalesTrendChartProps {
  transactions: VerifiedTransaction[];
}

type ChartGrouping = 'hourly' | 'provider';
type MetricType = 'revenue' | 'count';

interface TooltipPayloadItem {
  value: number;
  name: string;
  dataKey: string;
  payload: {
    label: string;
    revenue: number;
    count: number;
    bankId?: BankProvider;
    color?: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  metric: MetricType;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, metric }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1 z-50">
        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
          <span>{data.label}</span>
          {data.count > 0 && (
            <span className="text-[10px] text-purple-300 font-normal">
              {data.count} {data.count === 1 ? 'transaction' : 'transactions'}
            </span>
          )}
        </div>
        <div className="pt-1 flex items-center justify-between gap-4 font-mono">
          <span className="text-slate-400">Verified Revenue:</span>
          <span className="font-bold text-emerald-400 tabular-nums">
            ETB {data.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        {data.count > 0 && (
          <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 font-mono">
            <span>Avg Ticket:</span>
            <span className="tabular-nums">
              ETB {(data.revenue / data.count).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const DailySalesTrendChart: React.FC<DailySalesTrendChartProps> = ({ transactions }) => {
  const [grouping, setGrouping] = useState<ChartGrouping>('hourly');
  const [metric, setMetric] = useState<MetricType>('revenue');

  // Compute Hourly Trend Data
  const hourlyData = useMemo(() => {
    // Standard retail & hospitality hours (08:00 to 22:00)
    const hoursMap: Record<number, { revenue: number; count: number }> = {};
    for (let h = 8; h <= 22; h++) {
      hoursMap[h] = { revenue: 0, count: 0 };
    }

    transactions.forEach(tx => {
      if (tx.status === 'VERIFIED') {
        const d = new Date(tx.verifiedAt);
        const hour = d.getHours();
        if (hoursMap[hour] !== undefined) {
          hoursMap[hour].revenue += tx.amount;
          hoursMap[hour].count += 1;
        } else {
          // If transaction occurred outside 8-22, still bucket it in the nearest hour
          const clampedHour = Math.min(Math.max(hour, 8), 22);
          hoursMap[clampedHour].revenue += tx.amount;
          hoursMap[clampedHour].count += 1;
        }
      }
    });

    return Object.entries(hoursMap).map(([hourStr, val]) => {
      const h = parseInt(hourStr, 10);
      const label = `${h.toString().padStart(2, '0')}:00`;
      return {
        label,
        hour: h,
        revenue: val.revenue,
        count: val.count,
      };
    });
  }, [transactions]);

  // Compute Provider Trend Data
  const providerData = useMemo(() => {
    const map: Record<BankProvider, { revenue: number; count: number }> = {
      telebirr: { revenue: 0, count: 0 },
      cbe: { revenue: 0, count: 0 },
      awash: { revenue: 0, count: 0 },
      abyssinia: { revenue: 0, count: 0 },
      dashen: { revenue: 0, count: 0 },
      berhan: { revenue: 0, count: 0 },
      coop: { revenue: 0, count: 0 },
    };

    transactions.forEach(tx => {
      if (tx.status === 'VERIFIED' && map[tx.bank]) {
        map[tx.bank].revenue += tx.amount;
        map[tx.bank].count += 1;
      }
    });

    return BANK_LIST.map(bank => ({
      bankId: bank.id,
      label: bank.shortName,
      fullName: bank.name,
      revenue: map[bank.id].revenue,
      count: map[bank.id].count,
      color: bank.primaryColor,
    }));
  }, [transactions]);

  // Peak statistics calculation
  const peakStats = useMemo(() => {
    if (grouping === 'hourly') {
      let maxH = hourlyData[0];
      hourlyData.forEach(h => {
        if (metric === 'revenue' ? h.revenue > maxH.revenue : h.count > maxH.count) {
          maxH = h;
        }
      });
      return {
        title: 'Peak Shift Velocity',
        label: maxH.label,
        value: metric === 'revenue' 
          ? `ETB ${maxH.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
          : `${maxH.count} transactions`,
      };
    } else {
      let maxP = providerData[0];
      providerData.forEach(p => {
        if (metric === 'revenue' ? p.revenue > maxP.revenue : p.count > maxP.count) {
          maxP = p;
        }
      });
      return {
        title: 'Top Payment Gateway',
        label: maxP.label,
        value: metric === 'revenue' 
          ? `ETB ${maxP.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
          : `${maxP.count} transactions`,
      };
    }
  }, [grouping, metric, hourlyData, providerData]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Daily Sales Trend
            </h2>
            <p className="text-xs text-slate-500">
              Real-time verified volume velocity across Ethiopian banking networks
            </p>
          </div>
        </div>

        {/* View & Metric Mode Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dimension Grouping Switch */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => setGrouping('hourly')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                grouping === 'hourly'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3 h-3 text-purple-600" />
              <span>By Hour</span>
            </button>
            <button
              onClick={() => setGrouping('provider')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                grouping === 'provider'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3 h-3 text-purple-600" />
              <span>By Bank</span>
            </button>
          </div>

          {/* Metric Toggle: Revenue vs Count */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => setMetric('revenue')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                metric === 'revenue'
                  ? 'bg-purple-700 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ETB Value
            </button>
            <button
              onClick={() => setMetric('count')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                metric === 'count'
                  ? 'bg-purple-700 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tx Count
            </button>
          </div>
        </div>
      </div>

      {/* High-level Trend Metric Callout */}
      <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-purple-50/50 rounded-xl border border-purple-100">
        <span className="text-purple-900 font-medium flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-600" />
          <span>{peakStats.title}: <strong>{peakStats.label}</strong></span>
        </span>
        <span className="font-mono font-bold text-purple-950 tabular-nums">
          {peakStats.value}
        </span>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {grouping === 'hourly' ? (
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7E22CE" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7E22CE" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11, fill: '#64748B' }} 
                tickLine={false} 
                axisLine={{ stroke: '#CBD5E1' }} 
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748B' }} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => metric === 'revenue' ? `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}` : val}
              />
              <Tooltip content={<CustomTooltip metric={metric} />} />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="#7E22CE"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#purpleGradient)"
                activeDot={{ r: 6, fill: '#7E22CE', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={providerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11, fill: '#64748B' }} 
                tickLine={false} 
                axisLine={{ stroke: '#CBD5E1' }} 
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748B' }} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => metric === 'revenue' ? `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}` : val}
              />
              <Tooltip content={<CustomTooltip metric={metric} />} />
              <Bar 
                dataKey={metric} 
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              >
                {providerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
