import type { DashboardViewServerProps } from "@payloadcms/next/views";
import { Gutter } from "@payloadcms/ui";
import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";

import { getDashboardGreetingName, getPlaceholderDashboardData } from "./dashboard-data";
import { DashboardShell } from "./dashboard-shell";

type DashboardUser = {
  email?: string;
  name?: string;
};

export async function RitualDashboard({
  i18n,
  locale,
  params,
  payload,
  permissions,
  searchParams,
  initPageResult,
}: DashboardViewServerProps) {
  const { req } = initPageResult;
  const { afterDashboard, beforeDashboard } = payload.config.admin.components;
  const adminRoute = payload.config.routes.admin;
  const greetingName = getDashboardGreetingName(req.user as DashboardUser | null | undefined);
  const dashboardData = getPlaceholderDashboardData(adminRoute);

  return (
    <Gutter className="dashboard">
      {beforeDashboard &&
        RenderServerComponent({
          Component: beforeDashboard,
          importMap: payload.importMap,
          serverProps: {
            i18n,
            locale,
            params,
            payload,
            permissions,
            searchParams,
            user: req.user,
          },
        })}

      <DashboardShell dashboardData={dashboardData} greetingName={greetingName} />

      {afterDashboard &&
        RenderServerComponent({
          Component: afterDashboard,
          importMap: payload.importMap,
          serverProps: {
            i18n,
            locale,
            params,
            payload,
            permissions,
            searchParams,
            user: req.user,
          },
        })}
    </Gutter>
  );
}
