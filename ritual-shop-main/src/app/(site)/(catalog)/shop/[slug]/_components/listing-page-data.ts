import "server-only";

import { unstable_cache } from "next/cache";

import type { Brand, Category } from "../../../../../../../payload-types";
import {
  FRONTEND_CACHE_TAG,
  getCollectionTag,
  getDocumentTag,
} from "@/payload/cache/tags";
import type { CatalogVisibleFilterKey } from "@/payload/shared/catalog-filters";
import type { ProductTypeValue } from "@/payload/shared/product-types";
import { getPayloadClient } from "../../../../_data/payload-client";

export type ListingPageData = {
  description: null | string;
  metaDescription: null | string;
  metaTitle: null | string;
  preappliedFilters: {
    brandSlugs: string[];
    categorySlugs: string[];
    productTypes: ProductTypeValue[];
  };
  slug: string;
  title: string;
  visibleFilterKeys: CatalogVisibleFilterKey[];
};

function normalizeText(value: null | string | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function resolveBrandSlug(brand: Brand | number | null | undefined) {
  return brand && typeof brand === "object" && typeof brand.slug === "string"
    ? brand.slug
    : null;
}

function resolveCategorySlug(category: Category | number | null | undefined) {
  return category && typeof category === "object" && typeof category.slug === "string"
    ? category.slug
    : null;
}

async function readListingPageBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "listing-pages",
    depth: 1,
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  });
  const page = result.docs[0];

  if (!page || !page.slug) {
    return null;
  }

  return {
    description: normalizeText(page.description),
    metaDescription: normalizeText(page.metaDescription),
    metaTitle: normalizeText(page.metaTitle),
    preappliedFilters: {
      brandSlugs: (page.preappliedBrands ?? [])
        .map((brand) => resolveBrandSlug(brand))
        .filter((value): value is string => value !== null),
      categorySlugs: (page.preappliedCategories ?? [])
        .map((category) => resolveCategorySlug(category))
        .filter((value): value is string => value !== null),
      productTypes: (page.preappliedProductTypes ?? []).filter(
        (value): value is ProductTypeValue => typeof value === "string",
      ),
    },
    slug: page.slug,
    title: page.title,
    visibleFilterKeys: (page.visibleFilterKeys ?? []).filter(
      (value): value is CatalogVisibleFilterKey => typeof value === "string",
    ),
  } satisfies ListingPageData;
}

export async function getListingPageBySlug(slug: string) {
  return unstable_cache(
    () => readListingPageBySlug(slug),
    ["listing-page", slug],
    {
      tags: [
        FRONTEND_CACHE_TAG,
        getCollectionTag("listing-pages"),
        getDocumentTag("listing-pages", slug),
      ],
    },
  )();
}

export const getListingPageSlugs = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "listing-pages",
      depth: 0,
      limit: 100,
      pagination: false,
    });

    return result.docs
      .map((page) => page.slug)
      .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
  },
  ["listing-page-slugs"],
  {
    tags: [FRONTEND_CACHE_TAG, getCollectionTag("listing-pages")],
  },
);
