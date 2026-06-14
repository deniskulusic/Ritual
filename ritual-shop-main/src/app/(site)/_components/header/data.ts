import "server-only";

import { unstable_cache } from "next/cache";

import type { Media } from "../../../../../payload-types";
import { FRONTEND_CACHE_TAG, getGlobalTag } from "@/payload/cache/tags";
import { getPayloadClient } from "../../_data/payload-client";
import {
  resolvePayloadLink,
  type PayloadLinkInput,
} from "../../_helpers/resolve-payload-link";
import type { HeaderData, HeaderNavItem } from "./types";

function resolveMediaImage(media: number | Media | null | undefined, fallbackAlt?: string | null) {
  if (!media || typeof media === "number" || !media.url) {
    return null;
  }

  return {
    alt: media.alt || fallbackAlt || "",
    src: media.url,
  };
}

function resolveHeaderLink(link: PayloadLinkInput) {
  return resolvePayloadLink(link);
}

export const getHeaderData = unstable_cache(
  async (): Promise<HeaderData> => {
    const payload = await getPayloadClient();
    const header = await payload.findGlobal({
      slug: "header",
      depth: 2,
    });

    return {
      announcementText:
        header.announcementBar?.mode === "message" && header.announcementBar.text
          ? header.announcementBar.text
          : null,
      mobileNavigation: (header.mobileNavigation ?? []).flatMap((item) => {
        const resolved = resolveHeaderLink({
          label: item.label,
          linkAnchor: item.linkAnchor,
          linkOpenInNewTab: item.linkOpenInNewTab,
          linkReference: item.linkReference,
          linkType: item.linkType,
          linkUrl: item.linkUrl,
        });

        return resolved ? [resolved] : [];
      }),
      primaryNavigation: (header.primaryNavigation ?? []).map((item, index) => {
        const topLevelLink = resolveHeaderLink({
          label: item.label,
          linkAnchor: item.itemAnchor,
          linkOpenInNewTab: item.itemOpenInNewTab,
          linkReference: item.itemReference,
          linkType: item.itemType,
          linkUrl: item.itemUrl,
        });
        const megaMenuLayout =
          item.mode === "mega-menu" && item.megaMenu?.layout === "brands-panel"
            ? "brands-panel"
            : "classic";
        const featureCard = item.mode === "mega-menu" ? item.megaMenu?.featureCard ?? null : null;
        const brandPanel = item.mode === "mega-menu" ? item.megaMenu?.brandPanel ?? null : null;

        const featureImage =
          item.mode === "mega-menu" && megaMenuLayout === "classic"
            ? resolveMediaImage(featureCard?.image)
            : null;
        const featureLink =
          item.mode === "mega-menu" && megaMenuLayout === "classic" && featureCard
            ? resolveHeaderLink({
                label: featureCard.title,
                linkAnchor: featureCard.featureAnchor,
                linkOpenInNewTab: featureCard.featureOpenInNewTab,
                linkReference: featureCard.featureReference,
                linkType: featureCard.featureType,
                linkUrl: featureCard.featureUrl,
              })
            : null;

        return {
          key: item.id ?? `${item.label}-${index}`,
          label: item.label,
          link: topLevelLink,
          megaMenu:
            item.mode === "mega-menu" && item.megaMenu
              ? {
                  layout: megaMenuLayout,
                  columns: (item.megaMenu.columns ?? []).map((column) => ({
                    links: (column.links ?? []).flatMap((link) => {
                      const resolved = resolveHeaderLink({
                        label: link.label,
                        linkAnchor: link.linkAnchor,
                        linkOpenInNewTab: link.linkOpenInNewTab,
                        linkReference: link.linkReference,
                        linkType: link.linkType,
                        linkUrl: link.linkUrl,
                      });

                      return resolved ? [resolved] : [];
                    }),
                    title: column.title,
                  })),
                  brandPanel:
                    megaMenuLayout === "brands-panel" && brandPanel
                      ? {
                          logos: (brandPanel.brandLogos ?? []).flatMap((brandLogo) => {
                            const image = resolveMediaImage(brandLogo.logo, brandLogo.name);
                            if (!image) {
                              return [];
                            }

                            const link = resolveHeaderLink({
                              label: brandLogo.name,
                              linkAnchor: brandLogo.logoAnchor,
                              linkOpenInNewTab: brandLogo.logoOpenInNewTab,
                              linkReference: brandLogo.logoReference,
                              linkType: brandLogo.logoType,
                              linkUrl: brandLogo.logoUrl,
                            });

                            return [
                              {
                                imageAlt: image.alt,
                                imageSrc: image.src,
                                link,
                                name: brandLogo.name,
                              },
                            ];
                          }),
                          title: brandPanel.title,
                        }
                      : null,
                  feature:
                    megaMenuLayout === "classic" && featureCard && featureImage
                      ? {
                          eyebrow: featureCard.eyebrow ?? null,
                          imageAlt: featureImage.alt,
                          imageSrc: featureImage.src,
                          link: featureLink,
                          title: featureCard.title,
                        }
                      : null,
                }
              : undefined,
        } satisfies HeaderNavItem;
      }),
    };
  },
  ["site-header"],
  {
    tags: [FRONTEND_CACHE_TAG, getGlobalTag("header")],
  },
);
