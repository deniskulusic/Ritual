import { NavWrapper } from "@payloadcms/next/client";
import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";
import { Logout } from "@payloadcms/ui";
import {
  EntityType,
  groupNavItems,
  type EntityToGroup,
} from "@payloadcms/ui/shared";
import type { ServerProps } from "payload";

import { RitualCacheRevalidateButton } from "../ritual-cache-revalidate-button";
import { RitualNavClient } from "./client";

const baseClass = "ritual-nav-shell";

export async function RitualNav(props: ServerProps) {
  const {
    documentSubViewType,
    i18n,
    locale,
    params,
    payload,
    permissions,
    searchParams,
    user,
    viewType,
    visibleEntities = {
      collections: [],
      globals: [],
    },
  } = props;

  if (!payload?.config) {
    return null;
  }

  if (!permissions) {
    return null;
  }

  const {
    admin: {
      components: {
        afterNav,
        afterNavLinks,
        beforeNav,
        beforeNavLinks,
        logout,
      },
    },
    collections,
    globals,
  } = payload.config;

  const entities: EntityToGroup[] = [
    ...collections
      .filter(({ slug }) => visibleEntities.collections.includes(slug))
      .map(
        (collection): EntityToGroup => ({
          entity: collection,
          type: EntityType.collection,
        }),
      ),
    ...globals
      .filter(({ slug }) => visibleEntities.globals.includes(slug))
      .map(
        (global): EntityToGroup => ({
          entity: global,
          type: EntityType.global,
        }),
      ),
  ];

  const groups = groupNavItems(entities, permissions, i18n);

  const logoutComponent = RenderServerComponent({
    clientProps: {
      documentSubViewType,
      viewType,
    },
    Component: logout?.Button,
    Fallback: Logout,
    importMap: payload.importMap,
    serverProps: {
      i18n,
      locale,
      params,
      payload,
      permissions,
      searchParams,
      user,
    },
  });

  const renderedBeforeNav = RenderServerComponent({
    clientProps: {
      documentSubViewType,
      viewType,
    },
    Component: beforeNav,
    importMap: payload.importMap,
    serverProps: {
      i18n,
      locale,
      params,
      payload,
      permissions,
      searchParams,
      user,
    },
  });

  const renderedBeforeNavLinks = RenderServerComponent({
    clientProps: {
      documentSubViewType,
      viewType,
    },
    Component: beforeNavLinks,
    importMap: payload.importMap,
    serverProps: {
      i18n,
      locale,
      params,
      payload,
      permissions,
      searchParams,
      user,
    },
  });

  const renderedAfterNavLinks = RenderServerComponent({
    clientProps: {
      documentSubViewType,
      viewType,
    },
    Component: afterNavLinks,
    importMap: payload.importMap,
    serverProps: {
      i18n,
      locale,
      params,
      payload,
      permissions,
      searchParams,
      user,
    },
  });

  const renderedAfterNav = RenderServerComponent({
    clientProps: {
      documentSubViewType,
      viewType,
    },
    Component: afterNav,
    importMap: payload.importMap,
    serverProps: {
      i18n,
      locale,
      params,
      payload,
      permissions,
      searchParams,
      user,
    },
  });

  return (
    <NavWrapper baseClass={baseClass}>
      {renderedBeforeNav}

      <nav className={`${baseClass}__wrap`}>
        {renderedBeforeNavLinks}
        <RitualNavClient groups={groups} />
        {renderedAfterNavLinks}

        <div className={`${baseClass}__controls`}>
          <RitualCacheRevalidateButton />
          <button type="button" className={`${baseClass}__utility-link`}>
            <span className={`${baseClass}__utility-link-icon`} aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" />
                <path d="M8.2 7.7a1.9 1.9 0 1 1 3.2 1.5c-.8.7-1.4 1.1-1.4 2.1" />
                <circle cx="10" cy="13.9" r="0.8" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span className={`${baseClass}__utility-link-label`}>
              {i18n.language === "hr" ? "Podrška" : "Support"}
            </span>
          </button>
          {logoutComponent}
        </div>
      </nav>

      {renderedAfterNav}
    </NavWrapper>
  );
}
