import "server-only";

import { unstable_cache } from "next/cache";

import type { Footer } from "../../../../../payload-types";
import { FRONTEND_CACHE_TAG, getGlobalTag } from "@/payload/cache/tags";
import { getPayloadClient } from "../../_data/payload-client";
import {
  resolvePayloadLink,
  type PayloadLinkInput,
  type ResolvedLinkData,
} from "../../_helpers/resolve-payload-link";

export type FooterData = {
  copyright: string;
  linkColumns: ResolvedLinkData[][];
  topNavLinks: ResolvedLinkData[];
};

type FooterLinkGroup =
  | Footer["topNavLinks"]
  | NonNullable<NonNullable<Footer["linkColumns"]>[number]["links"]>;

function resolveFooterLinks(links: FooterLinkGroup | null | undefined) {
  return ((links ?? []) as PayloadLinkInput[]).flatMap((link) => {
    const resolved = resolvePayloadLink(link);

    return resolved ? [resolved] : [];
  });
}

export const getFooterData = unstable_cache(
  async (): Promise<FooterData> => {
    const payload = await getPayloadClient();
    const footer = await payload.findGlobal({
      slug: "footer",
      depth: 2,
    });

    return {
      copyright: footer.copyright,
      linkColumns: (footer.linkColumns ?? [])
        .map((column) => resolveFooterLinks(column.links))
        .filter((column) => column.length > 0),
      topNavLinks: resolveFooterLinks(footer.topNavLinks),
    };
  },
  ["site-footer"],
  {
    tags: [FRONTEND_CACHE_TAG, getGlobalTag("footer")],
  },
);
