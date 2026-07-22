"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { cn, filterHistoryByRange, formatDate, formatPrice } from "@/lib/utils";
import type { MarketQuote, PricePoint, TimeRange } from "@/lib/types";

export interface ChartReferenceLine {
  value: number;
  label: string;
  color: string;
}

interface PriceChartProps {
  data: PricePoint[];
  currency?: "EUR" | "USD";
  title?: string;
  color?: string;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  compact?: boolean;
  referenceLines?: ChartReferenceLine[];
}

const ranges: { id: TimeRange; label: string }[] = [
  { id: "7d", label: "7G" },
  { id: "30d", label: "30G" },
  { id: "90d", label: "90G" },
  { id: "1y", label: "1A" },
];

function CustomTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: { value: number; payload: PricePoint }[];
  currency: "EUR" | "USD";
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
      <p className="text-xs text-zinc-400">{formatDate(point.date)}</p>
      <p className="text-sm font-semibold text-zinc-100">
        {formatPrice(point.price, currency)}
      </p>
    </div>
  );
}

export function PriceChart({
  data,
  currency = "EUR",
  title,
  color = "#14b8a6",
  timeRange,
  onTimeRangeChange,
  compact = false,
  referenceLines = [],
}: PriceChartProps) {
  const filtered = useMemo(
    () => filterHistoryByRange(data, timeRange),
    [data, timeRange]
  );

  const refValues = referenceLines.map((r) => r.value);
  const priceValues = filtered.map((p) => p.price);
  const allValues = [...priceValues, ...refValues];
  const minPrice = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxPrice = allValues.length > 0 ? Math.max(...allValues) : 100;
  const padding = (maxPrice - minPrice) * 0.1 || maxPrice * 0.05 || 5;

  return (
    <div
      className={cn(
        compact ? "chart-card-compact" : "chart-card"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        {title && (
          <h3 className="truncate text-sm font-medium text-zinc-300">{title}</h3>
        )}
        <div className="ml-auto flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => onTimeRangeChange(r.id)}
              className={cn(
                timeRange === r.id ? "btn-range-active" : "btn-range-inactive"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={compact ? 160 : 250}>
        <LineChart data={filtered} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "short",
              })
            }
            interval="preserveStartEnd"
            minTickGap={40}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minPrice - padding, maxPrice + padding]}
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickFormatter={(v) =>
              new Intl.NumberFormat("it-IT", {
                notation: "compact",
                compactDisplay: "short",
              }).format(v)
            }
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          {referenceLines.map((line) => (
            <ReferenceLine
              key={line.label}
              y={line.value}
              stroke={line.color}
              strokeDasharray="6 4"
              label={{
                value: line.label,
                fill: line.color,
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: "#18181b", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MiniSparklineProps {
  data: PricePoint[];
  color?: string;
  positive?: boolean;
}

export function MiniSparkline({
  data,
  color,
  positive,
}: MiniSparklineProps) {
  const stroke =
    color ?? (positive === undefined ? "#71717a" : positive ? "#34d399" : "#f87171");
  const recent = data.slice(-30);

  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={recent}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={stroke}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface DualMarketChartProps {
  itQuote?: MarketQuote;
  intlQuote?: MarketQuote;
  title: string;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  referenceLines?: ChartReferenceLine[];
}

function mergeHistories(
  it?: MarketQuote,
  intl?: MarketQuote,
  range: TimeRange = "30d"
) {
  const itHist = it ? filterHistoryByRange(it.history, range) : [];
  const intlHist = intl ? filterHistoryByRange(intl.history, range) : [];
  const dates = new Set([
    ...itHist.map((p) => p.date),
    ...intlHist.map((p) => p.date),
  ]);
  return [...dates]
    .sort()
    .map((date) => ({
      date,
      it: itHist.find((p) => p.date === date)?.price,
      intl: intlHist.find((p) => p.date === date)?.price,
    }));
}

function DualTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
      <p className="text-xs text-zinc-400">{label ? formatDate(label) : ""}</p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          className="text-sm font-semibold"
          style={{ color: entry.color }}
        >
          {entry.dataKey === "it" ? "Cardmarket" : "eBay EU"}:{" "}
          {formatPrice(entry.value, "EUR")}
        </p>
      ))}
    </div>
  );
}

export function DualMarketChart({
  itQuote,
  intlQuote,
  title,
  timeRange,
  onTimeRangeChange,
  referenceLines = [],
}: DualMarketChartProps) {
  const data = useMemo(
    () => mergeHistories(itQuote, intlQuote, timeRange),
    [itQuote, intlQuote, timeRange]
  );

  const allValues = data.flatMap((d) =>
    [d.it, d.intl].filter((v): v is number => v !== undefined)
  );
  const refValues = referenceLines.map((r) => r.value);
  const allChartValues = [...allValues, ...refValues];
  const minPrice = allChartValues.length > 0 ? Math.min(...allChartValues) : 0;
  const maxPrice = allChartValues.length > 0 ? Math.max(...allChartValues) : 100;
  const padding = (maxPrice - minPrice) * 0.1 || maxPrice * 0.05 || 5;

  return (
    <div className="h-[320px] rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-zinc-300">{title}</h3>
          <div className="mt-1 flex flex-wrap gap-3 text-xs">
            {itQuote && (
              <span className="text-green-400">
                Cardmarket {formatPrice(itQuote.price, "EUR")} · {itQuote.sourceLabel}
              </span>
            )}
            {intlQuote && (
              <span className="text-orange-400">
                eBay EU {formatPrice(intlQuote.price, "EUR")} · {intlQuote.sourceLabel}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => onTimeRangeChange(r.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                timeRange === r.id
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "short",
              })
            }
            interval="preserveStartEnd"
            minTickGap={40}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minPrice - padding, maxPrice + padding]}
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickFormatter={(v) =>
              new Intl.NumberFormat("it-IT", {
                notation: "compact",
                compactDisplay: "short",
              }).format(v)
            }
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip content={<DualTooltip />} labelFormatter={(l) => l} />
          {referenceLines.map((line) => (
            <ReferenceLine
              key={line.label}
              y={line.value}
              stroke={line.color}
              strokeDasharray="6 4"
              label={{
                value: line.label,
                fill: line.color,
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
          ))}
          {itQuote && (
            <Line
              type="monotone"
              dataKey="it"
              stroke="#4ade80"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          )}
          {intlQuote && (
            <Line
              type="monotone"
              dataKey="intl"
              stroke="#fb923c"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface CompareSeries {
  label: string;
  history: PricePoint[];
  color: string;
}

interface CompareProductsChartProps {
  series: CompareSeries[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function CompareProductsChart({
  series,
  timeRange,
  onTimeRangeChange,
}: CompareProductsChartProps) {
  const data = useMemo(() => {
    const filtered = series.map((s) => ({
      label: s.label,
      points: filterHistoryByRange(s.history, timeRange),
    }));
    const dates = new Set<string>();
    filtered.forEach((s) => s.points.forEach((p) => dates.add(p.date)));
    return [...dates].sort().map((date) => {
      const row: Record<string, string | number> = { date };
      filtered.forEach((s, i) => {
        const pt = s.points.find((p) => p.date === date);
        if (pt) row[`s${i}`] = pt.price;
      });
      return row;
    });
  }, [series, timeRange]);

  const values = data.flatMap((d) =>
    series.map((_, i) => d[`s${i}`]).filter((v): v is number => typeof v === "number")
  );
  const minPrice = values.length ? Math.min(...values) : 0;
  const maxPrice = values.length ? Math.max(...values) : 100;
  const padding = (maxPrice - minPrice) * 0.1 || 5;

  return (
    <div className="chart-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-zinc-300">Confronto prodotti</h3>
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => onTimeRangeChange(r.id)}
              className={cn(
                timeRange === r.id ? "btn-range-active" : "btn-range-inactive"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-2 flex flex-wrap gap-3 text-xs">
        {series.map((s) => (
          <span key={s.label} style={{ color: s.color }}>
            ● {s.label}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("it-IT", { day: "numeric", month: "short" })
            }
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minPrice - padding, maxPrice + padding]}
            tick={{ fill: "#71717a", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip
            formatter={(v: number) => formatPrice(v, "EUR")}
            labelFormatter={(l) => formatDate(String(l))}
          />
          {series.map((s, i) => (
            <Line
              key={s.label}
              type="monotone"
              dataKey={`s${i}`}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
