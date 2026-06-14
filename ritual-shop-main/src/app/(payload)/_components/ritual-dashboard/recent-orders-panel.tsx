import { ChevronRight } from "lucide-react";
import Link from "next/link";

import type { PlaceholderDashboardData } from "./dashboard-data";

export function RecentOrdersPanel({
  recentOrders,
}: {
  recentOrders: PlaceholderDashboardData["recentOrders"];
}) {
  return (
    <section className="ritual-dashboard__panel ritual-dashboard__panel--recent-orders">
      <div className="ritual-dashboard__panel-head">
        <div>
          <h2>{recentOrders.title}</h2>
        </div>
        <Link href={recentOrders.ctaHref} className="ritual-dashboard__panel-link">
          {recentOrders.ctaLabel}
          <ChevronRight aria-hidden="true" size={14} strokeWidth={2.2} />
        </Link>
      </div>

      <div className="ritual-dashboard__recent-orders-table">
        <div className="ritual-dashboard__recent-orders-head">
          <span>Date</span>
          <span>Status</span>
          <span>Email</span>
          <span>Amount</span>
        </div>

        <div className="ritual-dashboard__recent-orders-body">
          {recentOrders.rows.map((order) => (
            <Link key={order.id} href={order.href} className="ritual-dashboard__recent-orders-row">
              <span>{order.date}</span>
              <span className={`ritual-dashboard__order-status ritual-dashboard__order-status--${order.tone}`}>
                {order.status}
              </span>
              <strong>{order.email}</strong>
              <strong>{order.amount}</strong>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
