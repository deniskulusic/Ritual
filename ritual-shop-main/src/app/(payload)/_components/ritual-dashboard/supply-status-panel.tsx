import type { PlaceholderDashboardData } from "./dashboard-data";
import Link from "next/link";

export function SupplyStatusPanel({
  supply,
}: {
  supply: PlaceholderDashboardData["supply"];
}) {
  return (
    <section className="ritual-dashboard__panel ritual-dashboard__panel--supply">
      <div className="ritual-dashboard__panel-head">
        <div>
          <h2>{supply.title}</h2>
        </div>
        <span className="ritual-dashboard__panel-status">{supply.items.length} flagged</span>
      </div>

      <p>{supply.description}</p>

      <div className="ritual-dashboard__supply-table">
        <div className="ritual-dashboard__supply-head">
          <span>Item</span>
          <span>Status</span>
          <span>Qty</span>
        </div>

        <div className="ritual-dashboard__supply-body">
          {supply.items.map((item) => (
            <Link key={item.name} href={item.href} className="ritual-dashboard__supply-item">
              <div className="ritual-dashboard__supply-name">
                <strong>{item.name}</strong>
                <span>{item.detail}</span>
              </div>
              <div className="ritual-dashboard__supply-status">
                <span className={`ritual-dashboard__severity ritual-dashboard__severity--${item.severity}`}>
                  {item.severity}
                </span>
              </div>
              <strong className="ritual-dashboard__supply-qty">{item.quantity}</strong>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
