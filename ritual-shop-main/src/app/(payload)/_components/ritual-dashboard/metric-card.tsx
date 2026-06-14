import Link from "next/link";

import type { DashboardMetric } from "./dashboard-data";
import { DashboardIcon } from "./dashboard-icon";

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <Link href={metric.href} className={`ritual-dashboard__metric-card ritual-dashboard__metric-card--${metric.tone}`}>
      <div className="ritual-dashboard__metric-head">
        <span className="ritual-dashboard__metric-label">{metric.label}</span>
        <span className="ritual-dashboard__metric-icon">
          <DashboardIcon icon={metric.icon} size={17} />
        </span>
      </div>
      <strong className="ritual-dashboard__metric-value">{metric.value}</strong>
      <span className="ritual-dashboard__metric-detail">{metric.detail}</span>
    </Link>
  );
}
