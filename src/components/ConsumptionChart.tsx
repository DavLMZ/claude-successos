"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ConsumptionPoint } from "@/data/accounts";

export function ConsumptionChart({
  data,
  height = 200,
}: {
  data: ConsumptionPoint[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d97757" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#d97757" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#2a2a30" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#6b6862"
          tick={{ fontSize: 10 }}
          tickFormatter={(d) => d.slice(5)}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis
          stroke="#6b6862"
          tick={{ fontSize: 10 }}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            background: "#17171a",
            border: "1px solid #3a3a44",
            borderRadius: 6,
            fontSize: 12,
          }}
          formatter={(v) => [`$${Number(v).toLocaleString()}`, "API spend"]}
          labelFormatter={(l) => `Date: ${l}`}
        />
        <Area
          type="monotone"
          dataKey="apiSpend"
          stroke="#d97757"
          strokeWidth={2}
          fill="url(#apiGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SeatsChart({ data, height = 200 }: { data: ConsumptionPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="cfeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7aa6d9" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#7aa6d9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="codeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5fbf8f" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#5fbf8f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#2a2a30" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#6b6862"
          tick={{ fontSize: 10 }}
          tickFormatter={(d) => d.slice(5)}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis stroke="#6b6862" tick={{ fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            background: "#17171a",
            border: "1px solid #3a3a44",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="cfeSeatsActive"
          name="CfE active"
          stroke="#7aa6d9"
          strokeWidth={2}
          fill="url(#cfeGrad)"
        />
        <Area
          type="monotone"
          dataKey="codeSeatsActive"
          name="Claude Code active"
          stroke="#5fbf8f"
          strokeWidth={2}
          fill="url(#codeGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
