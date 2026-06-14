"use client";

import { Bar, BarChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { TooltipContentProps } from "recharts";

import type { RevenuePoint } from "./dashboard-data";

type RevenueSegmentKey =
  | "accessoryRevenue"
  | "capsulesRevenue"
  | "coffeeRevenue"
  | "giftSetRevenue"
  | "matchaRevenue";

const revenueSegments: Array<{
  color: string;
  dataKey: RevenueSegmentKey;
  label: string;
}> = [
  {
    color: "#d7b59a",
    dataKey: "accessoryRevenue",
    label: "Accessory",
  },
  {
    color: "#7d8b6e",
    dataKey: "capsulesRevenue",
    label: "Capsules",
  },
  {
    color: "#b89a78",
    dataKey: "coffeeRevenue",
    label: "Coffee",
  },
  {
    color: "#8d6b54",
    dataKey: "giftSetRevenue",
    label: "Gift set",
  },
  {
    color: "#95a785",
    dataKey: "matchaRevenue",
    label: "Matcha",
  },
] as const;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "EUR",
  maximumFractionDigits: 0,
  style: "currency",
});

const percentageFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  style: "percent",
});

const getSegmentRadius = (point: RevenuePoint, dataKey: RevenueSegmentKey): [number, number, number, number] => {
  const activeSegments = revenueSegments.filter((segment) => point[segment.dataKey] > 0);
  const firstSegment = activeSegments[0]?.dataKey;
  const lastSegment = activeSegments[activeSegments.length - 1]?.dataKey;
  const isFirst = firstSegment === dataKey;
  const isLast = lastSegment === dataKey;

  return [
    isLast ? 16 : 0,
    isLast ? 16 : 0,
    isFirst ? 4 : 0,
    isFirst ? 4 : 0,
  ];
};

export function RevenueChart({ points }: { points: RevenuePoint[] }) {
  const renderTooltip = ({ active, label, payload }: TooltipContentProps) => {
    if (!active || !payload?.length) {
      return null;
    }

    const point = payload[0]?.payload as RevenuePoint | undefined;
    const totalRevenue = point?.revenue ?? Number.NaN;

    return (
      <div className="ritual-dashboard__chart-tooltip">
        <span>{label}</span>
        <strong>{Number.isFinite(totalRevenue) ? currencyFormatter.format(totalRevenue) : "-"}</strong>

        <div className="ritual-dashboard__chart-tooltip-list">
          {point &&
            revenueSegments
              .filter((segment) => point[segment.dataKey] > 0)
              .sort((left, right) => point[right.dataKey] - point[left.dataKey])
              .map((segment) => {
                const value = point[segment.dataKey];
                const ratio = totalRevenue > 0 ? value / totalRevenue : 0;

                return (
                  <div className="ritual-dashboard__chart-tooltip-row" key={segment.dataKey}>
                    <span className="ritual-dashboard__chart-tooltip-name">
                      <i aria-hidden="true" style={{ backgroundColor: segment.color }} />
                      {segment.label}
                    </span>

                    <strong>
                      {percentageFormatter.format(ratio)} · {currencyFormatter.format(value)}
                    </strong>
                  </div>
                );
              })}
        </div>
      </div>
    );
  };

  return (
    <div className="ritual-dashboard__chart">
      <div className="ritual-dashboard__chart-legend" role="list" aria-label="Revenue split by product type">
        {revenueSegments.map((segment) => (
          <span className="ritual-dashboard__chart-legend-item" key={segment.dataKey} role="listitem">
            <i aria-hidden="true" style={{ backgroundColor: segment.color }} />
            {segment.label}
          </span>
        ))}
      </div>

      <div className="ritual-dashboard__chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} margin={{ top: 18, right: 10, left: 4, bottom: 4 }} barCategoryGap="24%">
            <CartesianGrid stroke="rgba(62, 54, 46, 0.08)" strokeDasharray="0" vertical={false} />

            <XAxis
              axisLine={false}
              dataKey="label"
              tick={{ fill: "rgba(62, 54, 46, 0.52)", fontSize: 11 }}
              tickLine={false}
            />

            <Tooltip
              content={renderTooltip}
              cursor={false}
            />

            {revenueSegments.map((segment) => (
              <Bar
                dataKey={segment.dataKey}
                fill={segment.color}
                key={segment.dataKey}
                maxBarSize={54}
                shape={(props) => (
                  <Rectangle
                    {...props}
                    radius={getSegmentRadius(props.payload as RevenuePoint, segment.dataKey)}
                  />
                )}
                stackId="revenue"
              >
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
