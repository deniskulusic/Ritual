import type { PlaceholderDashboardData } from "./dashboard-data";
import { Hero } from "./hero";
import { MetricCard } from "./metric-card";
import { RecentActivityPanel } from "./recent-activity-panel";
import { RecentOrdersPanel } from "./recent-orders-panel";
import { RevenuePanel } from "./revenue-panel";
import { SupplyStatusPanel } from "./supply-status-panel";

export function DashboardShell({
  dashboardData,
  greetingName,
}: {
  dashboardData: PlaceholderDashboardData;
  greetingName: string;
}) {
  return (
    <div className="ritual-dashboard">
      <Hero greetingName={greetingName} />

      <section className="ritual-dashboard__metric-grid">
        {dashboardData.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="ritual-dashboard__insights-grid">
        <RevenuePanel revenue={dashboardData.revenue} />
        <RecentOrdersPanel recentOrders={dashboardData.recentOrders} />
      </section>

      <section className="ritual-dashboard__secondary-grid">
        <SupplyStatusPanel supply={dashboardData.supply} />
        <RecentActivityPanel activity={dashboardData.activity} />
      </section>
    </div>
  );
}
