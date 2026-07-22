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
} from "recharts";
import { cn, filterHistoryByRange, formatDate, formatPrice } from "@/lib/utils";
import type { PricePoint, TimeRange } from "@/lib/types";

interface PriceChartProps {
  data: PricePoint[];
  currency?: "EUR" | "USD";
  title?: string;
  color?: string;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  compact?: boolean;
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
  color = "#ffcb05",
  timeRange,
  onTimeRangeChange,
  compact = false,
}: PriceChartProps) {
  const filtered = useMemo(
    () => filterHistoryByRange(data, timeRange),
    [data, timeRange]
  );

  const minPrice = Math.min(...filtered.map((p) => p.price));
  const maxPrice = Math.max(...filtered.map((p) => p.price));
  const padding = (maxPrice - minPrice) * 0.1 || maxPrice * 0.05;

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-sm",
        compact ? "h-[220px]" : "h-[320px]"
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
