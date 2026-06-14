import "server-only";

import { unstable_cache } from "next/cache";

import type { LegalPage as PayloadLegalPage } from "../../../../../payload-types";
import {
  FRONTEND_CACHE_TAG,
  getCollectionTag,
  getDocumentTag,
} from "@/payload/cache/tags";
import { getPayloadClient } from "../../_data/payload-client";

export type LegalTableRow = {
  label: string;
  value: string;
};

export type LegalSection =
  | {
      title: string;
      paragraphs: string[];
      table?: undefined;
    }
  | {
      title: string;
      paragraphs?: undefined;
      table: LegalTableRow[];
    };

export type LegalPageData = {
  title: string;
  metaDescription?: string | null;
  metaTitle?: string | null;
  sections: LegalSection[];
};

function splitTextareaIntoParagraphs(content: string) {
  return content
    .split(/\r?\n/g)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

function mapLegalPage(doc: PayloadLegalPage): LegalPageData {
  return {
    title: doc.title,
    metaDescription: doc.meta?.description ?? null,
    metaTitle: doc.meta?.title ?? null,
    sections: doc.sections.map((section) => ({
      title: section.title,
      paragraphs: splitTextareaIntoParagraphs(section.content),
    })),
  };
}

async function readLegalPageBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "legal-pages",
    depth: 0,
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  const page = result.docs[0];

  return page ? mapLegalPage(page) : null;
}

export async function getLegalPageBySlug(slug: string) {
  return unstable_cache(() => readLegalPageBySlug(slug), ["legal-page", slug], {
    tags: [
      FRONTEND_CACHE_TAG,
      getCollectionTag("legal-pages"),
      getDocumentTag("legal-pages", slug),
    ],
  })();
}

export const getLegalPageSlugs = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "legal-pages",
      depth: 0,
      limit: 100,
      pagination: false,
    });

    return result.docs
      .map((doc) => doc.slug)
      .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
  },
  ["legal-page-slugs"],
  {
    tags: [FRONTEND_CACHE_TAG, getCollectionTag("legal-pages")],
  },
);
