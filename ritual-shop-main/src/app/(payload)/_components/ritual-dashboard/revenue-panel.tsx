import type { PlaceholderDashboardData } from "./dashboard-data";
import { RevenueChart } from "./revenue-chart";

export function RevenuePanel({
  revenue,
}: {
  revenue: PlaceholderDashboardData["revenue"];
}) {
  return (
    <section className="ritual-dashboard__panel ritual-dashboard__panel--chart">
      <div className="ritual-dashboard__revenue-copy">
        <h2>{revenue.title}</h2>
        <p>
          {revenue.description} <span className="ritual-dashboard__revenue-note">{revenue.total} total, {revenue.change} {revenue.changeLabel}</span>
        </p>
      </div>

      <RevenueChart points={revenue.points} />
    </section>
  );
}
