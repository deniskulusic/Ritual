"use client";

import { LogOutIcon, Link, useConfig, useTranslation } from "@payloadcms/ui";
import { formatAdminURL } from "payload/shared";

export function RitualLogoutButton() {
  const { t } = useTranslation();
  const { config } = useConfig();
  const logoutHref = formatAdminURL({
    adminRoute: config.routes.admin,
    path: config.admin.routes.logout,
  });

  return (
    <Link
      aria-label={t("authentication:logOut")}
      className="ritual-nav-shell__utility-link ritual-nav-shell__utility-link--logout"
      href={logoutHref}
      prefetch={false}
      title={t("authentication:logOut")}
    >
      <span className="ritual-nav-shell__utility-link-icon" aria-hidden="true">
        <LogOutIcon />
      </span>
      <span className="ritual-nav-shell__utility-link-label">{t("authentication:logOut")}</span>
    </Link>
  );
}
