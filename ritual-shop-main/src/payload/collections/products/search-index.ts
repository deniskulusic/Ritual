import type { BeforeSync, DocToSync } from "@payloadcms/plugin-search/types";
import type { Payload, PayloadRequest } from "payload";

import type { Brand, Category, Media, Product } from "../../../../payload-types";
import { formatEuro } from "../carts/shipping-contract";
import { resolveProductDetailLabel } from "../../shared/product-detail-options";
import type {
  ProductSearchHit,
  ProductSearchResponse,
} from "./search-contract";
import { normalizeProductSearchQuery } from "./search-contract";

const DEFAULT_PRODUCT_IMAGE = "/ritual/uploads/demo-product.png";

export type ProductSearchDocument = DocToSync & {
  brand: string;
  catalogReviewStatus: Product["catalogReviewStatus"];
  categoryName: string;
  image: string;
  priceLabel: string;
  searchText: string;
  slug: string;
  status: Product["status"];
};

type ProductSearchFields = {
  title: string;
  brand: string;
  catalogReviewStatus: Product["catalogReviewStatus"];
  categoryName: string;
  image: string;
  priceLabel: string;
  searchText: string;
  slug: string;
  status: Product["status"];
};

type ProductSearchSyncCache = {
  brands: Map<string, Promise<Brand | null>>;
  categories: Map<string, Promise<Category | null>>;
  mediaSources: Map<string, Promise<string>>;
};

function normalizeText(value: null | string | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getProductDetails(product: Product) {
  switch (product.productType) {
    case "single_serve_beverage":
      return asRecord(product.singleServeDetails);
    case "packaged_coffee":
      return asRecord(product.packagedCoffeeDetails);
    case "equipment":
      return asRecord(product.equipmentDetails);
    case "accessory":
      return asRecord(product.accessoryDetails);
    case "drink_mix_ingredient":
      return asRecord(product.drinkMixDetails);
    case "technical_consumable":
      return asRecord(product.technicalConsumableDetails);
    case "tea_matcha":
      return asRecord(product.teaMatchaDetails);
    case "cold_beverage_concentrate":
      return asRecord(product.coldBeverageDetails);
    case "confectionery_snack":
      return asRecord(product.confectioneryDetails);
    default:
      return {};
  }
}

function getDetailSearchTokens(product: Product) {
  const details = getProductDetails(product);
  const flags = Array.isArray(details.flags) ? details.flags : [];
  const tokens = Object.values(details).flatMap((value) => {
    if (typeof value === "string") {
      return [value, resolveProductDetailLabel(value)];
    }

    if (typeof value === "number") {
      return [String(value)];
    }

    if (Array.isArray(value)) {
      return value.flatMap((item) =>
        typeof item === "string" ? [item, resolveProductDetailLabel(item)] : [],
      );
    }

    if (value && typeof value === "object") {
      return Object.values(value).flatMap((nestedValue) => {
        if (typeof nestedValue === "string") {
          return [nestedValue, resolveProductDetailLabel(nestedValue)];
        }

        if (typeof nestedValue === "number") {
          return [String(nestedValue)];
        }

        return [];
      });
    }

    return [];
  });

  if (flags.includes("decaf")) {
    tokens.push("decaf", "bez kofeina");
  }

  if (flags.includes("organic")) {
    tokens.push("organic", "bio");
  }

  return tokens;
}

function resolveMedia(
  media: number | Media | null | undefined,
  fallbackAlt: string,
  fallbackSrc = DEFAULT_PRODUCT_IMAGE,
) {
  if (!media || typeof media === "number") {
    return {
      alt: fallbackAlt,
      src: fallbackSrc,
    };
  }

  const src = media.sizes?.card?.url ?? media.url ?? fallbackSrc;

  return {
    alt: media.alt?.trim() || fallbackAlt,
    src,
  };
}

function resolveBrand(brand: number | Brand | null | undefined) {
  return brand && typeof brand === "object" ? brand : null;
}

function resolveCategory(category: number | Category | null | undefined) {
  return category && typeof category === "object" ? category : null;
}

function getRelationshipCacheKey(value: number | string) {
  return String(value);
}

function getProductSearchSyncCache(req: PayloadRequest): ProductSearchSyncCache {
  const context = req.context as
    | (PayloadRequest["context"] & {
        productSearchSyncCache?: ProductSearchSyncCache;
      })
    | undefined;

  if (context?.productSearchSyncCache) {
    return context.productSearchSyncCache;
  }

  const cache: ProductSearchSyncCache = {
    brands: new Map(),
    categories: new Map(),
    mediaSources: new Map(),
  };

  req.context = {
    ...(req.context ?? {}),
    productSearchSyncCache: cache,
  };

  return cache;
}

async function loadBrand(
  payload: Payload,
  brand: number | Brand | null | undefined,
  req: PayloadRequest,
) {
  const populatedBrand = resolveBrand(brand);

  if (populatedBrand) {
    return populatedBrand;
  }

  if (!brand) {
    return null;
  }

  if (typeof brand !== "number" && typeof brand !== "string") {
    return null;
  }

  const cache = getProductSearchSyncCache(req).brands;
  const cacheKey = getRelationshipCacheKey(brand);
  let brandPromise = cache.get(cacheKey);

  if (!brandPromise) {
    brandPromise = payload.findByID({
      collection: "brands",
      depth: 0,
      id: brand,
      req,
    }).catch(() => null);
    cache.set(cacheKey, brandPromise);
  }

  return brandPromise;
}

async function loadCategory(
  payload: Payload,
  category: Category | number | null | undefined,
  req: PayloadRequest,
) {
  const populatedCategory = resolveCategory(category);

  if (populatedCategory) {
    return populatedCategory;
  }

  if (!category) {
    return null;
  }

  if (typeof category !== "number" && typeof category !== "string") {
    return null;
  }

  const cache = getProductSearchSyncCache(req).categories;
  const cacheKey = getRelationshipCacheKey(category);
  let categoryPromise = cache.get(cacheKey);

  if (!categoryPromise) {
    categoryPromise = payload.findByID({
      collection: "categories",
      depth: 0,
      id: category,
      req,
    }).catch(() => null);
    cache.set(cacheKey, categoryPromise);
  }

  return categoryPromise;
}

async function resolvePrimaryCategory(
  payload: Payload,
  product: Product,
  req: PayloadRequest,
) {
  const [primaryCategory] = Array.isArray(product.categories)
    ? product.categories
    : [];

  return loadCategory(payload, primaryCategory, req);
}

async function resolveMediaSource(
  payload: Payload,
  media: number | Media | null | undefined,
  fallbackAlt: string,
  req: PayloadRequest,
  fallbackSrc = DEFAULT_PRODUCT_IMAGE,
) {
  if (media && typeof media === "object") {
    return resolveMedia(media, fallbackAlt, fallbackSrc).src;
  }

  if (!media) {
    return fallbackSrc;
  }

  const cache = getProductSearchSyncCache(req).mediaSources;
  const cacheKey = getRelationshipCacheKey(media);
  let mediaPromise = cache.get(cacheKey);

  if (!mediaPromise) {
    mediaPromise = payload.findByID({
      collection: "media",
      depth: 0,
      id: media,
      req,
    })
      .then((mediaDoc) => resolveMedia(mediaDoc, fallbackAlt, fallbackSrc).src)
      .catch(() => fallbackSrc);
    cache.set(cacheKey, mediaPromise);
  }

  return mediaPromise;
}

function resolveBrandName(brand: Brand | null) {
  return normalizeText(brand?.name) ?? "Ritual Shop";
}

function resolveCategoryName(category: Category | null) {
  return normalizeText(category?.title) ?? "Ponuda";
}

function resolvePriceLabel(product: Product) {
  return typeof product.moralis?.price === "number"
    ? formatEuro(product.moralis.price)
    : "Cijena na upit";
}

function resolveProductTypeTokens(productType: Product["productType"]) {
  switch (productType) {
    case "accessory":
      return ["accessory", "dodatak"];
    case "cold_beverage_concentrate":
      return ["cold beverage concentrate", "koncentrat", "hladni napitak"];
    case "confectionery_snack":
      return ["confectionery", "snack", "slatkiš"];
    case "drink_mix_ingredient":
      return ["drink mix", "sastojak za napitke"];
    case "equipment":
      return ["equipment", "oprema", "aparat"];
    case "packaged_coffee":
      return ["packaged coffee", "kava"];
    case "single_serve_beverage":
      return ["single serve beverage", "kapsule", "jednodozni napitak"];
    case "tea_matcha":
      return ["tea", "matcha", "čaj"];
    case "technical_consumable":
      return ["technical consumable", "potrošni materijal"];
    default:
      return [];
  }
}

function buildSearchText(
  product: Product,
  {
    brandName,
    categoryName,
  }: {
    brandName: string;
    categoryName: string;
  },
) {
  return normalizeProductSearchQuery(
    [
      product.title,
      brandName,
      categoryName,
      ...resolveProductTypeTokens(product.productType),
      ...getDetailSearchTokens(product),
      product.description,
      ...((product.notes ?? [])
        .map((item) => normalizeText(item.label))
        .filter((item): item is string => item !== null)),
    ]
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .join(" "),
  );
}

function mapSearchHit(doc: Partial<ProductSearchFields>): ProductSearchHit | null {
  if (
    typeof doc.slug !== "string" ||
    typeof doc.title !== "string" ||
    typeof doc.brand !== "string" ||
    typeof doc.image !== "string" ||
    typeof doc.priceLabel !== "string"
  ) {
    return null;
  }

  return {
    brand: doc.brand,
    image: doc.image,
    priceLabel: doc.priceLabel,
    slug: doc.slug,
    title: doc.title,
  };
}

export const syncProductSearchDocument: BeforeSync = async ({
  collectionSlug,
  originalDoc,
  payload,
  req,
  searchDoc,
}) => {
  if (collectionSlug !== "products") {
    return searchDoc;
  }

  const product = originalDoc as Product;
  const [brand, category] = await Promise.all([
    loadBrand(payload, product.brand, req),
    resolvePrimaryCategory(payload, product, req),
  ]);
  const brandName = resolveBrandName(brand);
  const categoryName = resolveCategoryName(category);
  const image = await resolveMediaSource(payload, product.heroImage, product.title, req);

  return {
    ...searchDoc,
    brand: brandName,
    catalogReviewStatus: product.catalogReviewStatus,
    categoryName,
    image,
    priceLabel: resolvePriceLabel(product),
    searchText: buildSearchText(product, {
      brandName,
      categoryName,
    }),
    slug: product.slug,
    status: product.status,
  } satisfies ProductSearchDocument;
};

export async function searchProducts(req: PayloadRequest) {
  const searchQuery = req.query?.q;
  const normalizedQuery =
    typeof searchQuery === "string"
      ? normalizeProductSearchQuery(searchQuery)
      : "";

  if (normalizedQuery.length < 2) {
    return Response.json({ results: [] satisfies ProductSearchHit[] });
  }

  const result = await req.payload.find({
    collection: "search",
    depth: 0,
    limit: 4,
    pagination: false,
    sort: "priority",
    where: {
      and: [
        {
          "doc.relationTo": {
            equals: "products",
          },
        },
        {
          or: [
            {
              status: {
                equals: "active",
              },
            },
            {
              and: [
                {
                  status: {
                    equals: "draft",
                  },
                },
                {
                  catalogReviewStatus: {
                    equals: "review_required",
                  },
                },
              ],
            },
          ],
        },
        {
          or: [
            {
              title: {
                like: searchQuery,
              },
            },
            {
              brand: {
                like: searchQuery,
              },
            },
            {
              categoryName: {
                like: searchQuery,
              },
            },
            {
              searchText: {
                like: normalizedQuery,
              },
            },
          ],
        },
      ],
    },
  });

  const results = result.docs.flatMap((doc) => {
    const mapped = mapSearchHit(doc as Partial<ProductSearchFields>);

    return mapped ? [mapped] : [];
  });

  return Response.json({
    results,
  } satisfies ProductSearchResponse);
}
