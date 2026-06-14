import type { PlaceholderDashboardData } from "./dashboard-data";
import { DashboardIcon } from "./dashboard-icon";

export function RecentActivityPanel({
  activity,
}: {
  activity: PlaceholderDashboardData["activity"];
}) {
  return (
    <section className="ritual-dashboard__panel ritual-dashboard__panel--activity">
      <div className="ritual-dashboard__panel-head">
        <div>
          <h2>Activity snapshot</h2>
          <p>Recent activity across content, customers, and order handling.</p>
        </div>
      </div>

      <div className="ritual-dashboard__activity-list">
        {activity.map((item) => (
          <div key={`${item.label}-${item.meta}`} className="ritual-dashboard__activity-item">
            <span className={`ritual-dashboard__activity-icon ritual-dashboard__activity-icon--${item.tone}`}>
              <DashboardIcon icon={item.icon} size={17} />
            </span>
            <div className="ritual-dashboard__activity-copy">
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </div>
            <span className="ritual-dashboard__activity-meta">{item.meta}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
