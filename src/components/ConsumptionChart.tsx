"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ConsumptionPoint } from "@/data/accounts";

export function AgentVolumeChart({
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
          <linearGradient id="agentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#262630" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#646068"
          tick={{ fontSize: 10 }}
          tickFormatter={(d) => d.slice(5)}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis
          stroke="#646068"
          tick={{ fontSize: 10 }}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            background: "#141416",
            border: "1px solid #383848",
            borderRadius: 6,
            fontSize: 12,
          }}
          formatter={(v) => [`${Number(v).toLocaleString()}`, "Agent calls"]}
          labelFormatter={(l) => `Date: ${l}`}
        />
        <Area
          type="monotone"
          dataKey="agentCallVolume"
          stroke="#14b8a6"
          strokeWidth={2}
          fill="url(#agentGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ApiAndCreativeChart({
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
            <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="creativeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#262630" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="#646068"
          tick={{ fontSize: 10 }}
          tickFormatter={(d) => d.slice(5)}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis stroke="#646068" tick={{ fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            background: "#141416",
            border: "1px solid #383848",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="apiCharacters"
          name="API chars"
          stroke="#94a3b8"
          strokeWidth={2}
          fill="url(#apiGrad)"
        />
        <Area
          type="monotone"
          dataKey="creativeOutputs"
          name="Creative outputs"
          stroke="#f97316"
          strokeWidth={2}
          fill="url(#creativeGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
