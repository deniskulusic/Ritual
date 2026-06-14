"use client";

import { getTranslation } from "@payloadcms/translations";
import { Link, NavGroup, useConfig, useTranslation } from "@payloadcms/ui";
import { EntityType, type NavGroupType } from "@payloadcms/ui/shared";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { formatAdminURL } from "payload/shared";

type RitualNavClientProps = {
  groups: NavGroupType[];
};

type IconName =
  | "dashboard"
  | "users"
  | "media"
  | "brands"
  | "categories"
  | "products"
  | "customers"
  | "carts"
  | "orders"
  | "global";

const isActiveLink = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);

const resolveIconName = (slug: string, type: EntityType | "dashboard"): IconName => {
  if (type === "dashboard") {
    return "dashboard";
  }

  switch (slug) {
    case "users":
      return "users";
    case "media":
      return "media";
    case "brands":
      return "brands";
    case "categories":
      return "categories";
    case "products":
      return "products";
    case "customers":
      return "customers";
    case "carts":
      return "carts";
    case "orders":
      return "orders";
    default:
      return type === EntityType.global ? "global" : "products";
  }
};

function RitualNavIcon({ name }: { name: IconName }) {
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="6" height="6" rx="1.4" />
          <rect x="11" y="3" width="6" height="10" rx="1.4" />
          <rect x="3" y="11" width="6" height="6" rx="1.4" />
          <rect x="11" y="15" width="6" height="2" rx="1" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 3.2 15.4 5v4.6c0 3.3-1.9 5.8-5.4 7.2-3.5-1.4-5.4-3.9-5.4-7.2V5L10 3.2Z" />
          <path d="M10 7.1a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8Zm-3 7c.5-1.7 1.7-2.6 3-2.6s2.5.9 3 2.6" />
        </svg>
      );
    case "media":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="14" height="12" rx="2" />
          <circle cx="7.2" cy="8" r="1.2" />
          <path d="m6 14 3.1-3 2.4 2.2L13.7 11 16 14" />
        </svg>
      );
    case "brands":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 2.8 12 7l4.6.7-3.3 3.2.8 4.6-4.1-2.2-4.1 2.2.8-4.6L3.4 7.7 8 7l2-4.2Z" />
        </svg>
      );
    case "categories":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 6.2h12" />
          <path d="M4 10h12" />
          <path d="M4 13.8h8" />
        </svg>
      );
    case "products":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5.2 6.4h9.6l-1 9H6.2l-1-9Z" />
          <path d="M7.6 7V5.9a2.4 2.4 0 0 1 4.8 0V7" />
        </svg>
      );
    case "customers":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="7" r="2.6" />
          <path d="M4.8 15c1-2.3 2.9-3.5 5.2-3.5S14.1 12.7 15.2 15" />
        </svg>
      );
    case "carts":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3.4 5h1.8l1.2 6h7l1.3-4.4H6.1" />
          <circle cx="8.2" cy="14.4" r="1.1" />
          <circle cx="13.4" cy="14.4" r="1.1" />
        </svg>
      );
    case "orders":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M6 3.6h8l2 2v10.8H4V5.6l2-2Z" />
          <path d="M7.2 8h5.6" />
          <path d="M7.2 11h5.6" />
        </svg>
      );
    case "global":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="2.4" />
          <path d="M10 3.4v1.8" />
          <path d="M10 14.8v1.8" />
          <path d="m5.3 5.3 1.3 1.3" />
          <path d="m13.4 13.4 1.3 1.3" />
          <path d="M3.4 10h1.8" />
          <path d="M14.8 10h1.8" />
          <path d="m5.3 14.7 1.3-1.3" />
          <path d="m13.4 6.6 1.3-1.3" />
        </svg>
      );
  }
}

export function RitualNavClient({ groups }: RitualNavClientProps) {
  const pathname = usePathname();
  const { config } = useConfig();
  const { i18n, t } = useTranslation();
  const adminRoute = config.routes.admin;
  const dashboardHref = formatAdminURL({
    adminRoute,
    path: "",
  });
  const isDashboardActive =
    pathname === dashboardHref || pathname === `${dashboardHref}/`;

  return (
    <>
      <div className="ritual-nav-shell__brand">
        <Link className="ritual-nav-shell__brand-link" href={dashboardHref} prefetch={false}>
          <Image
            alt="Ritual Admin"
            className="ritual-nav-shell__brand-logo"
            height="42"
            src="/ritual/uploads/ritual-logo.png"
            width="171"
          />
        </Link>
      </div>

      <div className="ritual-nav-shell__section ritual-nav-shell__section--primary">
        <Link
          aria-current={isDashboardActive ? "page" : undefined}
          className={[
            "ritual-nav-shell__item",
            isDashboardActive && "ritual-nav-shell__item--active",
          ]
            .filter(Boolean)
            .join(" ")}
          href={dashboardHref}
          prefetch={false}
        >
          <span className="ritual-nav-shell__item-icon" aria-hidden="true">
            <RitualNavIcon name="dashboard" />
          </span>
          <span className="ritual-nav-shell__item-label">{t("general:dashboard")}</span>
        </Link>
      </div>

      <div className="ritual-nav-shell__groups">
        {groups.map((group) => (
          <NavGroup key={group.label} label={group.label}>
            <div className="ritual-nav-shell__group-links">
              {group.entities.map((entity) => {
                const href = formatAdminURL({
                  adminRoute,
                  path:
                    entity.type === EntityType.collection
                      ? `/collections/${entity.slug}`
                      : `/globals/${entity.slug}`,
                });
                const isActive = isActiveLink(pathname, href);

                return (
                  <Link
                    key={`${entity.type}-${entity.slug}`}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "ritual-nav-shell__item",
                      isActive && "ritual-nav-shell__item--active",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    href={href}
                    prefetch={false}
                  >
                    <span className="ritual-nav-shell__item-icon" aria-hidden="true">
                      <RitualNavIcon name={resolveIconName(entity.slug, entity.type)} />
                    </span>
                    <span className="ritual-nav-shell__item-label">
                      {getTranslation(entity.label, i18n)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </NavGroup>
        ))}
      </div>
    </>
  );
}
