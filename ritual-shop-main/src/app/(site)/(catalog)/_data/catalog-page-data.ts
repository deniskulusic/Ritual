import "server-only";

import { unstable_cache } from "next/cache";

import type {
  Brand,
  Category,
  Media,
  Product,
} from "../../../../../payload-types";
import type {
  StoreActiveFilters,
  StoreAdditionalInfo,
  StoreCategory,
  StoreCheckboxFilterOption,
  StoreFilterGroup,
  StoreInstruction,
  StorePagination,
  StoreProduct,
  StoreRangeFilterValue,
} from "./catalog-data";
import {
  STORE_FILTER_QUERY_PARAMS,
  STORE_PAGE_QUERY_PARAM,
} from "./catalog-data";
import {
  FRONTEND_CACHE_TAG,
  getCollectionTag,
} from "@/payload/cache/tags";
import { formatEuro } from "@/payload/collections/carts/shipping-contract";
import { resolveProductDetailLabel } from "@/payload/shared/product-detail-options";
import type { ProductTypeValue } from "@/payload/shared/product-types";
import {
  defaultCategoryVisibleFilterKeys,
  defaultShopVisibleFilterKeys,
  getCatalogVisibleFilterDefinition,
  type CatalogVisibleFilterKey,
} from "@/payload/shared/catalog-filters";
import { getPayloadClient } from "../../_data/payload-client";

const DEFAULT_PRODUCT_IMAGE = "/ritual/uploads/demo-product.png";
const DEFAULT_CATEGORY_BACKGROUND = "/ritual/images/ritual-pattern-bg-2.jpg";

const categoryVisuals: Record<
  string,
  {
    backgroundImage: string;
    fallbackImage: string;
    overlayOpacity: number;
  }
> = {
  "kava-u-zrnu": {
    backgroundImage: "/ritual/images/dalmatia.png",
    fallbackImage: "/ritual/images/cat-1.png",
    overlayOpacity: 0.5,
  },
  "kava-u-kapsulama": {
    backgroundImage: "/ritual/images/istria.png",
    fallbackImage: "/ritual/images/cat-2.png",
    overlayOpacity: 0.55,
  },
  "cajevi-i-matcha": {
    backgroundImage: "/ritual/images/ritual-pattern-bg-2.jpg",
    fallbackImage: "/ritual/images/cat-3.png",
    overlayOpacity: 0.15,
  },
  "aparati-za-kavu": {
    backgroundImage: "/ritual/images/ritual-pattern-bg-2.jpg",
    fallbackImage: "/ritual/images/cat-4.png",
    overlayOpacity: 0.05,
  },
  pribor: {
    backgroundImage: "/ritual/images/slavonia.png",
    fallbackImage: "/ritual/images/cat-5.png",
    overlayOpacity: 0.2,
  },
  "za-ured": {
    backgroundImage: "/ritual/uploads/hero-ritual.webp",
    fallbackImage: "/ritual/images/cat-6.png",
    overlayOpacity: 0,
  },
};

const productTypeLabels: Record<ProductTypeValue, string> = {
  accessory: "Dodatak",
  cold_beverage_concentrate: "Koncentrat",
  confectionery_snack: "Slatkiš",
  drink_mix_ingredient: "Sastojak za napitke",
  equipment: "Oprema",
  packaged_coffee: "Pakirana kava",
  single_serve_beverage: "Jednodozni napitak",
  tea_matcha: "Čaj / matcha",
  technical_consumable: "Potrošni materijal",
};

const badgeLabels: Record<NonNullable<Product["badges"]>[number], string> = {
  "best-seller": "Najprodavanije",
  limited: "Ograničeno",
  new: "Novo",
  sale: "Akcija",
};

const CATALOG_PAGE_SIZE = 12;

export type CatalogStoreProduct = StoreProduct & {
  articleCode: string;
  brandSlug: null | string;
  catalogReviewStatus: Product["catalogReviewStatus"];
  categorySlugs: string[];
  editorialBadges: string[];
  notes: string[];
  productType: ProductTypeValue;
  specifications: StoreAdditionalInfo[];
};

export type CatalogScope = {
  brandSlugs?: string[];
  categorySlugs?: string[];
  productTypes?: ProductTypeValue[];
};

export type CatalogListingSearchParams = Partial<
  Record<
    | (typeof STORE_FILTER_QUERY_PARAMS)[number]
    | typeof STORE_PAGE_QUERY_PARAM
    | "q",
    string | string[]
  >
>;

type CatalogParsedListingParams = {
  filters: StoreActiveFilters;
  page: number;
  searchQuery: string;
};

type CatalogStoreCategory = StoreCategory;

function normalizeText(value: null | string | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function normalizeComparableText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function splitTextarea(content?: null | string) {
  return (content ?? "")
    .split(/\r?\n/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeDescriptionText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getString(value: unknown) {
  return typeof value === "string" ? normalizeText(value) : null;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getRawDescriptionField(rawData: Record<string, unknown>, key: string) {
  const value = getString(rawData[key]);

  return value ? normalizeDescriptionText(value) : null;
}

function getSelectedLabel(value: unknown) {
  const key = getString(value);

  return key ? resolveProductDetailLabel(key) : null;
}

function getSelectedLabels(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => getSelectedLabel(item))
    .filter((item): item is string => typeof item === "string" && item.length > 0);
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

function resolveNetContentLabel(details: Record<string, unknown>) {
  const netContent = asRecord(details.netContent);
  const display = getString(netContent.display);

  if (display) {
    return display;
  }

  const amount = getNumber(netContent.amount);
  const unit = getString(netContent.unit);

  return amount !== null && unit ? `${amount} ${resolveProductDetailLabel(unit)}` : "";
}

function resolveNetContentAmountLabel(details: Record<string, unknown>) {
  const netContent = asRecord(details.netContent);
  const amount = getNumber(netContent.amount);
  const unit = getString(netContent.unit);

  return amount !== null && unit ? `${amount} ${resolveProductDetailLabel(unit)}` : "";
}

function resolveNetContentRowLabel(details: Record<string, unknown>) {
  const unit = getString(asRecord(details.netContent).unit);

  if (unit === "g" || unit === "kg") {
    return "Neto masa";
  }

  if (unit === "ml" || unit === "l") {
    return "Neto volumen";
  }

  return "Neto sadržaj";
}

function resolvePackageUnitsLabel(details: Record<string, unknown>) {
  const packageUnits = getNumber(details.packageUnits);

  return packageUnits !== null ? `${packageUnits} kom` : "";
}

function resolvePackageDisplay(details: Record<string, unknown>) {
  const netContentLabel = resolveNetContentLabel(details);
  const packageUnitsLabel = resolvePackageUnitsLabel(details);

  if (!netContentLabel) {
    return packageUnitsLabel;
  }

  if (
    packageUnitsLabel &&
    !normalizeComparableText(netContentLabel).includes(
      normalizeComparableText(packageUnitsLabel),
    )
  ) {
    return `${packageUnitsLabel} / ${netContentLabel}`;
  }

  return netContentLabel;
}

function resolveCompatibleSystemsLabel(details: Record<string, unknown>) {
  return getSelectedLabels(details.compatibleSystems).join(", ");
}

function pushSelectedInfo(
  items: StoreAdditionalInfo[],
  label: string,
  details: Record<string, unknown>,
  key: string,
  seenLabels?: Set<string>,
) {
  pushAdditionalInfo(items, label, getSelectedLabel(details[key]), seenLabels);
}

function pushNumberInfo(
  items: StoreAdditionalInfo[],
  label: string,
  details: Record<string, unknown>,
  key: string,
  suffix = "",
  seenLabels?: Set<string>,
) {
  const value = getNumber(details[key]);

  pushAdditionalInfo(
    items,
    label,
    value === null ? null : `${value}${suffix}`,
    seenLabels,
  );
}

function resolveMedia(
  media: number | Media | null | undefined,
  fallbackAlt: string,
  fallbackSrc?: string,
) {
  if (!media || typeof media === "number") {
    return fallbackSrc
      ? {
          alt: fallbackAlt,
          src: fallbackSrc,
        }
      : null;
  }

  const src = media.sizes?.card?.url ?? media.url ?? fallbackSrc;

  if (!src) {
    return null;
  }

  return {
    alt: media.alt?.trim() || fallbackAlt,
    src,
  };
}

function resolveCategory(category: number | Category | undefined) {
  return category && typeof category === "object" ? category : null;
}

function resolveBrand(brand: number | Brand | null | undefined) {
  return brand && typeof brand === "object" ? brand : null;
}

function resolvePrimaryCategory(product: Product) {
  return product.categories
    .map((category) => resolveCategory(category))
    .find((category): category is Category => category !== null);
}

function resolveCategorySlugs(product: Product) {
  return product.categories
    .map((category) => resolveCategory(category)?.slug ?? null)
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
}

function resolveBrandName(product: Product) {
  return (
    normalizeText(resolveBrand(product.brand)?.name) ??
    productTypeLabels[product.productType]
  );
}

function resolveBrandSlug(product: Product) {
  return normalizeText(resolveBrand(product.brand)?.slug) ?? null;
}

function resolveBadgeLabel(product: Product) {
  const badge = product.badges?.[0];

  return badge ? badgeLabels[badge] : undefined;
}

function resolvePriceValue(product: Product) {
  return typeof product.moralis.price === "number" ? product.moralis.price : 0;
}

function resolvePriceLabel(product: Product) {
  const priceValue = resolvePriceValue(product);

  return priceValue > 0 ? formatEuro(priceValue) : "Cijena na upit";
}

function pushAdditionalInfo(
  items: StoreAdditionalInfo[],
  label: string,
  value: null | number | string | undefined,
  seenLabels?: Set<string>,
) {
  if (value === null || value === undefined) {
    return;
  }

  const normalized =
    typeof value === "number" ? String(value) : normalizeText(value);

  if (!normalized) {
    return;
  }

  const comparableLabel = normalizeComparableText(label);

  if (seenLabels?.has(comparableLabel)) {
    return;
  }

  seenLabels?.add(comparableLabel);
  items.push({ label, value: normalized });
}

function getFlags(details: Record<string, unknown>) {
  return Array.isArray(details.flags)
    ? details.flags.filter((flag): flag is string => typeof flag === "string")
    : [];
}

function pushBadge(badges: string[], value: null | string | undefined) {
  const label = normalizeText(value);

  if (!label || badges.length >= 3) {
    return;
  }

  const comparableLabel = normalizeComparableText(label);

  if (badges.some((badge) => normalizeComparableText(badge) === comparableLabel)) {
    return;
  }

  badges.push(label);
}

function pushFlagBadges(badges: string[], flags: string[]) {
  if (flags.includes("decaf")) {
    pushBadge(badges, "Decaf");
  }

  if (flags.includes("organic")) {
    pushBadge(badges, "BIO");
  }
}

function buildEditorialBadges(product: Product) {
  const details = getProductDetails(product);
  const badges: string[] = [];
  const flags = getFlags(details);
  const compatibleSystems = getSelectedLabels(details.compatibleSystems);
  const packageUnitsLabel = resolvePackageUnitsLabel(details);
  const netContentAmountLabel = resolveNetContentAmountLabel(details);

  switch (product.productType) {
    case "single_serve_beverage":
      pushBadge(badges, packageUnitsLabel);
      pushBadge(badges, netContentAmountLabel);
      pushFlagBadges(badges, flags);
      pushBadge(badges, compatibleSystems[0]);
      break;

    case "packaged_coffee":
      pushBadge(badges, netContentAmountLabel || resolveNetContentLabel(details));
      pushBadge(badges, getSelectedLabel(details.format));
      pushFlagBadges(badges, flags);
      break;

    case "drink_mix_ingredient":
      pushBadge(badges, packageUnitsLabel);
      pushBadge(badges, netContentAmountLabel);
      pushFlagBadges(badges, flags);
      pushBadge(badges, getSelectedLabel(details.beverageType));
      break;

    case "tea_matcha":
      pushBadge(badges, packageUnitsLabel);
      pushBadge(badges, netContentAmountLabel);
      pushFlagBadges(badges, flags);
      pushBadge(badges, getSelectedLabel(details.teaType));
      break;

    case "cold_beverage_concentrate":
      pushBadge(badges, netContentAmountLabel || resolveNetContentLabel(details));
      pushBadge(badges, getSelectedLabel(details.beverageType));
      pushBadge(badges, getSelectedLabel(details.flavour));
      break;

    case "confectionery_snack":
      pushBadge(badges, packageUnitsLabel);
      pushBadge(badges, netContentAmountLabel);
      pushFlagBadges(badges, flags);
      pushBadge(badges, getSelectedLabel(details.productForm));
      break;

    case "equipment":
      pushBadge(badges, getSelectedLabel(details.equipmentType));
      pushBadge(badges, compatibleSystems[0]);
      break;

    case "accessory":
      pushBadge(badges, packageUnitsLabel);
      pushBadge(badges, compatibleSystems[0]);
      break;

    case "technical_consumable":
      pushBadge(badges, getSelectedLabel(details.physicalForm));
      pushFlagBadges(badges, flags);
      pushBadge(badges, compatibleSystems[0]);
      break;
  }

  return badges;
}

function buildInstructions(product: Product): StoreInstruction[] {
  const details = getProductDetails(product);
  const labels = [
    resolveCompatibleSystemsLabel(details),
    getSelectedLabel(details.equipmentType),
    getSelectedLabel(details.beverageType),
    getSelectedLabel(details.teaType),
    getSelectedLabel(details.productForm),
    resolveNetContentLabel(details),
  ].filter((item): item is string => typeof item === "string" && item.length > 0);

  return labels.slice(0, 3).map((label) => ({
    icon: "/ritual/icons/delivery.svg",
    label,
  }));
}

function buildAdditionalInfo(product: Product) {
  const items: StoreAdditionalInfo[] = [];
  const details = getProductDetails(product);
  const seenLabels = new Set<string>();
  const flags = getFlags(details);
  const packageDisplay = resolvePackageDisplay(details);
  const netContentAmountLabel = resolveNetContentAmountLabel(details);
  const netContentRowLabel = resolveNetContentRowLabel(details);
  const compatibleSystemsLabel = resolveCompatibleSystemsLabel(details);

  for (const specification of product.specifications ?? []) {
    pushAdditionalInfo(items, specification.label, specification.value, seenLabels);
  }

  pushAdditionalInfo(items, "Brend", resolveBrandName(product), seenLabels);
  pushAdditionalInfo(items, "Pakiranje", packageDisplay, seenLabels);
  pushAdditionalInfo(
    items,
    netContentRowLabel,
    normalizeComparableText(netContentAmountLabel) === normalizeComparableText(packageDisplay)
      ? null
      : netContentAmountLabel,
    seenLabels,
  );
  pushSelectedInfo(items, "Format", details, "format", seenLabels);
  pushAdditionalInfo(items, "Sustav", compatibleSystemsLabel, seenLabels);

  switch (product.productType) {
    case "single_serve_beverage":
      pushSelectedInfo(items, "Vrsta napitka", details, "beverageType", seenLabels);
      break;

    case "equipment":
      pushSelectedInfo(items, "Vrsta opreme", details, "equipmentType", seenLabels);
      pushSelectedInfo(items, "Priključak vode", details, "waterConnection", seenLabels);
      pushSelectedInfo(items, "Vrsta noževa", details, "burrType", seenLabels);
      pushNumberInfo(items, "Snaga", details, "powerW", " W", seenLabels);
      pushNumberInfo(items, "Spremnik vode", details, "waterTankL", " L", seenLabels);
      pushNumberInfo(items, "Broj grupa", details, "groupCount", "", seenLabels);
      break;

    case "drink_mix_ingredient":
      pushSelectedInfo(items, "Vrsta napitka", details, "beverageType", seenLabels);
      pushSelectedInfo(items, "Fizički oblik", details, "physicalForm", seenLabels);
      pushSelectedInfo(items, "Okus", details, "flavour", seenLabels);
      break;

    case "technical_consumable":
      pushSelectedInfo(items, "Fizički oblik", details, "physicalForm", seenLabels);
      break;

    case "tea_matcha":
      pushSelectedInfo(items, "Vrsta čaja", details, "teaType", seenLabels);
      pushSelectedInfo(items, "Obitelj okusa", details, "flavorFamily", seenLabels);
      break;

    case "cold_beverage_concentrate":
      pushSelectedInfo(items, "Vrsta napitka", details, "beverageType", seenLabels);
      pushSelectedInfo(items, "Okus", details, "flavour", seenLabels);
      break;

    case "confectionery_snack":
      pushSelectedInfo(items, "Oblik proizvoda", details, "productForm", seenLabels);
      break;
  }

  if (flags.includes("decaf")) {
    pushAdditionalInfo(items, "Bez kofeina", "Da", seenLabels);
  }

  if (flags.includes("organic")) {
    pushAdditionalInfo(items, "BIO", "Da", seenLabels);
  }

  pushAdditionalInfo(items, "Šifra artikla", resolveArticleCode(product), seenLabels);

  return items;
}

function resolvePackSize(product: Product) {
  const details = getProductDetails(product);

  return resolvePackageDisplay(details);
}

function resolveArticleCode(product: Product) {
  const itemID = normalizeText(product.moralis.itemID);

  return itemID?.replace(/^0+/, "") || itemID || "";
}

function resolveNotes(product: Product) {
  return (product.notes ?? [])
    .map((note) => normalizeText(note.label))
    .filter((note): note is string => note !== null);
}

function resolveRegion(product: Product) {
  const details = getProductDetails(product);

  switch (product.productType) {
    case "single_serve_beverage":
    case "accessory":
    case "equipment":
    case "technical_consumable":
      return resolveCompatibleSystemsLabel(details);
    case "packaged_coffee":
      return getSelectedLabel(details.format) ?? "";
    case "drink_mix_ingredient":
    case "cold_beverage_concentrate":
      return getSelectedLabel(details.flavour) ?? getSelectedLabel(details.beverageType) ?? "";
    case "tea_matcha":
      return getSelectedLabel(details.teaType) ?? "";
    case "confectionery_snack":
      return getSelectedLabel(details.productForm) ?? "";
    default:
      return "";
  }
}

function resolveDescription(product: Product) {
  if (product.catalogReviewStatus === "review_required") {
    const rawDescription = resolveReviewRequiredDescription(product);

    if (rawDescription) {
      return [rawDescription];
    }
  }

  const description = splitTextarea(product.description);

  return description.length > 0
    ? description
    : ["Detaljan opis proizvoda bit će dostupan uskoro."];
}

function resolveMoralisOpisDescription(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const entries = JSON.parse(value) as unknown;

    if (!Array.isArray(entries)) {
      return normalizeDescriptionText(value);
    }

    const preferredEntry = entries.find(
      (entry): entry is { key?: unknown; value?: unknown } =>
        Boolean(
          entry &&
            typeof entry === "object" &&
            "key" in entry &&
            getString((entry as { key?: unknown }).key) === "web_info",
        ),
    );
    const fallbackEntry = entries.find(
      (entry): entry is { key?: unknown; value?: unknown } =>
        Boolean(
          entry &&
            typeof entry === "object" &&
            "key" in entry &&
            getString((entry as { key?: unknown }).key) === "info",
        ),
    );
    const description = getString(preferredEntry?.value) ?? getString(fallbackEntry?.value);

    return description ? normalizeDescriptionText(description) : null;
  } catch {
    return normalizeDescriptionText(value);
  }
}

function resolveReviewRequiredDescription(product: Product) {
  const rawData = asRecord(product.moralis.rawOperationalData);

  return (
    getRawDescriptionField(rawData, "web_opis") ??
    getRawDescriptionField(rawData, "opis_text") ??
    resolveMoralisOpisDescription(rawData.OPIS) ??
    getRawDescriptionField(rawData, "description")
  );
}

function mapStoreProduct(product: Product): CatalogStoreProduct | null {
  if (!product.slug) {
    return null;
  }

  const primaryCategory = resolvePrimaryCategory(product);
  const image = resolveMedia(product.heroImage, product.title, DEFAULT_PRODUCT_IMAGE)?.src;

  if (!image) {
    return null;
  }

  const brandName = resolveBrandName(product);
  const showEnrichedFacts = product.catalogReviewStatus !== "review_required";
  const additionalInfo = showEnrichedFacts ? buildAdditionalInfo(product) : [];

  return {
    additionalInfo,
    articleCode: resolveArticleCode(product),
    badge: showEnrichedFacts ? resolveBadgeLabel(product) : undefined,
    brand: brandName,
    brandSlug: resolveBrandSlug(product),
    catalogReviewStatus: product.catalogReviewStatus,
    categoryName:
      normalizeText(primaryCategory?.title) ??
      productTypeLabels[product.productType],
    categorySlug:
      normalizeText(primaryCategory?.slug) ?? product.productType,
    categorySlugs: resolveCategorySlugs(product),
    countryLabel: brandName,
    description: resolveDescription(product),
    editorialBadges: showEnrichedFacts ? buildEditorialBadges(product) : [],
    format: productTypeLabels[product.productType],
    image,
    inStock: Boolean(product.moralis.isAvailable),
    instructions: showEnrichedFacts ? buildInstructions(product) : [],
    notes: showEnrichedFacts ? resolveNotes(product) : [],
    packSize: showEnrichedFacts ? resolvePackSize(product) : "",
    priceBand: "",
    priceLabel: resolvePriceLabel(product),
    priceValue: resolvePriceValue(product),
    productType: product.productType,
    region: showEnrichedFacts ? resolveRegion(product) : "",
    slug: product.slug,
    specifications: additionalInfo,
    stockLabel: product.moralis.isAvailable ? "Na zalihi" : "Na upit",
    title: product.title,
    year: product.updatedAt
      ? new Date(product.updatedAt).getFullYear()
      : new Date().getFullYear(),
  };
}

function mapStoreCategory(category: Category): CatalogStoreCategory | null {
  if (!category.slug) {
    return null;
  }

  const visual = categoryVisuals[category.slug];
  const image =
    resolveMedia(category.image, category.title, visual?.fallbackImage)?.src ??
    visual?.fallbackImage ??
    DEFAULT_PRODUCT_IMAGE;

  return {
    backgroundImage: visual?.backgroundImage ?? image ?? DEFAULT_CATEGORY_BACKGROUND,
    image,
    name: category.title,
    overlayOpacity: visual?.overlayOpacity ?? 0.18,
    slug: category.slug,
    supportCta: undefined,
  };
}

async function readCatalogProducts() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    depth: 1,
    limit: 300,
    pagination: false,
    sort: "title",
    where: {
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
  });

  return result.docs.flatMap((product) => {
    const mapped = mapStoreProduct(product);

    return mapped ? [mapped] : [];
  });
}

async function readCatalogCategories() {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "categories",
    depth: 1,
    limit: 200,
    pagination: false,
    sort: "title",
  });

  return result.docs.flatMap((category) => {
    const mapped = mapStoreCategory(category);

    return mapped ? [mapped] : [];
  });
}

export const getCatalogProducts = unstable_cache(
  async () => readCatalogProducts(),
  ["catalog-products"],
  {
    tags: [FRONTEND_CACHE_TAG, getCollectionTag("products")],
  },
);

export const getCatalogCategories = unstable_cache(
  async () => readCatalogCategories(),
  ["catalog-categories"],
  {
    tags: [FRONTEND_CACHE_TAG, getCollectionTag("categories")],
  },
);

export async function getCatalogProductBySlug(slug: string) {
  const products = await getCatalogProducts();

  return products.find((product) => product.slug === slug) ?? null;
}

export async function getCatalogCategoryBySlug(slug: string) {
  const categories = await getCatalogCategories();

  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getCatalogActiveCategories() {
  const [categories, products] = await Promise.all([
    getCatalogCategories(),
    getCatalogProducts(),
  ]);
  const activeSlugs = new Set(
    products.flatMap((product) => product.categorySlugs),
  );

  return categories.filter((category) => activeSlugs.has(category.slug));
}

export function normalizeCatalogSearchQuery(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getProductSearchText(product: CatalogStoreProduct) {
  return normalizeCatalogSearchQuery(
    [
      product.title,
      product.slug,
      product.categoryName,
      product.countryLabel,
      product.region,
      product.brand,
      product.format,
      product.packSize,
      product.priceLabel,
      product.stockLabel,
      ...product.description,
      ...product.additionalInfo.flatMap((item) => [item.label, item.value]),
      ...product.instructions.map((item) => item.label),
    ].join(" "),
  );
}

export function searchCatalogProducts(
  products: CatalogStoreProduct[],
  query: string,
  limit = products.length,
) {
  const normalizedQuery = normalizeCatalogSearchQuery(query);

  if (!normalizedQuery) {
    return products.slice(0, limit);
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);

  return products
    .map((product) => {
      const title = normalizeCatalogSearchQuery(product.title);
      const brand = normalizeCatalogSearchQuery(product.brand);
      const category = normalizeCatalogSearchQuery(product.categoryName);
      const format = normalizeCatalogSearchQuery(product.format);
      const searchText = getProductSearchText(product);

      if (tokens.some((token) => !searchText.includes(token))) {
        return null;
      }

      let score = 0;

      if (title === normalizedQuery) {
        score += 200;
      }
      if (title.startsWith(normalizedQuery)) {
        score += 140;
      }
      if (title.includes(normalizedQuery)) {
        score += 120;
      }
      if (brand.startsWith(normalizedQuery)) {
        score += 90;
      }
      if (brand.includes(normalizedQuery)) {
        score += 75;
      }
      if (category.includes(normalizedQuery)) {
        score += 65;
      }
      if (format.includes(normalizedQuery)) {
        score += 45;
      }

      score += tokens.reduce((total, token) => {
        if (title.includes(token)) {
          return total + 24;
        }

        if (brand.includes(token)) {
          return total + 18;
        }

        if (category.includes(token)) {
          return total + 16;
        }

        if (searchText.includes(token)) {
          return total + 10;
        }

        return total;
      }, 0);

      return { product, score };
    })
    .filter((entry): entry is { product: CatalogStoreProduct; score: number } => entry !== null)
    .sort((left, right) => right.score - left.score || left.product.title.localeCompare(right.product.title))
    .slice(0, limit)
    .map((entry) => entry.product);
}

export function filterProductsByScope(
  products: CatalogStoreProduct[],
  scope: CatalogScope,
) {
  const brandSlugs = new Set(scope.brandSlugs ?? []);
  const categorySlugs = new Set(scope.categorySlugs ?? []);
  const productTypes = new Set(scope.productTypes ?? []);

  return products.filter((product) => {
    if (
      brandSlugs.size > 0 &&
      (!product.brandSlug || !brandSlugs.has(product.brandSlug))
    ) {
      return false;
    }

    if (
      categorySlugs.size > 0 &&
      !product.categorySlugs.some((slug) => categorySlugs.has(slug))
    ) {
      return false;
    }

    if (
      productTypes.size > 0 &&
      !productTypes.has(product.productType)
    ) {
      return false;
    }

    return true;
  });
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getListParam(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function getNumberParam(value: string | string[] | undefined) {
  const parsed = Number(getFirstParam(value));

  return Number.isFinite(parsed) ? parsed : null;
}

export function parseCatalogListingSearchParams(
  searchParams: CatalogListingSearchParams = {},
): CatalogParsedListingParams {
  const page = Math.floor(Number(getFirstParam(searchParams.page)) || 1);
  const minPrice = getNumberParam(searchParams.min);
  const maxPrice = getNumberParam(searchParams.max);
  const filters: StoreActiveFilters = {};

  const brandValues = getListParam(searchParams.brand);
  const categoryValues = getListParam(searchParams.category);
  const typeValues = getListParam(searchParams.type);

  if (brandValues.length > 0) {
    filters.brand = brandValues;
  }

  if (categoryValues.length > 0) {
    filters.categoryName = categoryValues;
  }

  if (typeValues.length > 0) {
    filters.format = typeValues;
  }

  if (minPrice !== null || maxPrice !== null) {
    filters.priceValue = {
      min: minPrice ?? Number.NEGATIVE_INFINITY,
      max: maxPrice ?? Number.POSITIVE_INFINITY,
    };
  }

  return {
    filters,
    page: Math.max(page, 1),
    searchQuery: getFirstParam(searchParams.q)?.trim() ?? "",
  };
}

function setFilterOption(
  options: Map<string, string>,
  value: null | string | undefined,
  label: null | string | undefined,
) {
  if (!value || !label || options.has(value)) {
    return;
  }

  options.set(value, label);
}

function buildCheckboxFilterOptions(
  key: Extract<CatalogVisibleFilterKey, "brand" | "categoryName" | "format">,
  products: CatalogStoreProduct[],
): StoreCheckboxFilterOption[] {
  const options = new Map<string, string>();

  for (const product of products) {
    switch (key) {
      case "brand":
        setFilterOption(options, product.brandSlug, product.brand);
        break;
      case "categoryName":
        setFilterOption(options, product.categorySlug, product.categoryName);
        break;
      case "format":
        setFilterOption(options, product.productType, product.format);
        break;
    }
  }

  return Array.from(options, ([value, label]) => ({ label, value })).sort(
    (left, right) => left.label.localeCompare(right.label, "hr"),
  );
}

function buildCheckboxFilterGroup(
  key: Extract<CatalogVisibleFilterKey, "brand" | "categoryName" | "format">,
  products: CatalogStoreProduct[],
): null | StoreFilterGroup {
  const definition = getCatalogVisibleFilterDefinition(key);

  if (!definition) {
    return null;
  }

  const options = buildCheckboxFilterOptions(key, products);

  if (options.length < 2) {
    return null;
  }

  return {
    key,
    kind: "checkbox",
    label: definition.storefrontLabel,
    param:
      key === "categoryName" ? "category" : key === "format" ? "type" : "brand",
    options,
  };
}

function buildPriceFilterGroup(products: CatalogStoreProduct[]) {
  const definition = getCatalogVisibleFilterDefinition("priceValue");

  if (!definition) {
    return null;
  }

  const prices = products
    .map((product) => product.priceValue)
    .filter((value) => Number.isFinite(value) && value > 0);

  if (prices.length < 2) {
    return null;
  }

  const min = Math.floor(Math.min(...prices) / 5) * 5;
  const max = Math.ceil(Math.max(...prices) / 5) * 5;

  if (min === max) {
    return null;
  }

  return {
    key: "priceValue",
    kind: "range",
    label: definition.storefrontLabel,
    minParam: "min",
    maxParam: "max",
    max,
    maxLabel: "Maks. cijena",
    min,
    minLabel: "Min. cijena",
    step: 5,
  } satisfies StoreFilterGroup;
}

export function buildCatalogFilterGroups(
  products: CatalogStoreProduct[],
  keys: CatalogVisibleFilterKey[],
): StoreFilterGroup[] {
  return keys.flatMap((key) => {
    switch (key) {
      case "brand":
      case "categoryName":
      case "format": {
        const group = buildCheckboxFilterGroup(key, products);

        return group ? [group] : [];
      }

      case "priceValue": {
        const group = buildPriceFilterGroup(products);

        return group ? [group] : [];
      }
    }
  });
}

function getCheckboxFilterValues(
  activeFilters: StoreActiveFilters,
  key: "brand" | "categoryName" | "format" | "region",
) {
  const value = activeFilters[key];

  return Array.isArray(value) ? value : [];
}

function getRangeFilterValue(
  activeFilters: StoreActiveFilters,
  key: "priceValue" | "year",
) {
  const value = activeFilters[key];

  return value && !Array.isArray(value) ? value : null;
}

function clampRangeFilterValue(
  group: Extract<StoreFilterGroup, { kind: "range" }>,
  value: StoreRangeFilterValue,
) {
  const rawMin = Number.isFinite(value.min) ? value.min : group.min;
  const rawMax = Number.isFinite(value.max) ? value.max : group.max;
  const min = Math.min(Math.max(rawMin, group.min), group.max);
  const max = Math.min(Math.max(rawMax, group.min), group.max);

  return min <= max ? { min, max } : { min: max, max: min };
}

function normalizeCatalogActiveFilters(
  filters: StoreActiveFilters,
  filterGroups: StoreFilterGroup[],
) {
  const activeFilters: StoreActiveFilters = {};

  for (const group of filterGroups) {
    const selected = filters[group.key];

    if (!selected) {
      continue;
    }

    if (group.kind === "checkbox") {
      const allowedValues = new Set(group.options.map((option) => option.value));
      const values = Array.isArray(selected)
        ? Array.from(new Set(selected)).filter((value) => allowedValues.has(value))
        : [];

      if (values.length > 0) {
        activeFilters[group.key] = values;
      }

      continue;
    }

    if (Array.isArray(selected)) {
      continue;
    }

    const range = clampRangeFilterValue(group, selected);

    if (range.min !== group.min || range.max !== group.max) {
      activeFilters[group.key] = range;
    }
  }

  return activeFilters;
}

function applyCatalogActiveFilters(
  products: CatalogStoreProduct[],
  activeFilters: StoreActiveFilters,
) {
  const brandValues = new Set(getCheckboxFilterValues(activeFilters, "brand"));
  const categoryValues = new Set(
    getCheckboxFilterValues(activeFilters, "categoryName"),
  );
  const typeValues = new Set(getCheckboxFilterValues(activeFilters, "format"));
  const priceValue = getRangeFilterValue(activeFilters, "priceValue");

  return products.filter((product) => {
    if (
      brandValues.size > 0 &&
      (!product.brandSlug || !brandValues.has(product.brandSlug))
    ) {
      return false;
    }

    if (
      categoryValues.size > 0 &&
      !product.categorySlugs.some((slug) => categoryValues.has(slug))
    ) {
      return false;
    }

    if (typeValues.size > 0 && !typeValues.has(product.productType)) {
      return false;
    }

    if (
      priceValue &&
      (product.priceValue < priceValue.min || product.priceValue > priceValue.max)
    ) {
      return false;
    }

    return true;
  });
}

function paginateCatalogProducts(
  products: CatalogStoreProduct[],
  requestedPage: number,
) {
  const totalCount = products.length;
  const totalPages = Math.max(Math.ceil(totalCount / CATALOG_PAGE_SIZE), 1);
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const start = (page - 1) * CATALOG_PAGE_SIZE;

  return {
    pagination: {
      page,
      pageSize: CATALOG_PAGE_SIZE,
      totalCount,
      totalPages,
    } satisfies StorePagination,
    products: products.slice(start, start + CATALOG_PAGE_SIZE),
  };
}

export function getCatalogListingData({
  products,
  searchParams = {},
  visibleFilterKeys,
}: {
  products: CatalogStoreProduct[];
  searchParams?: CatalogListingSearchParams;
  visibleFilterKeys: CatalogVisibleFilterKey[];
}) {
  const parsedParams = parseCatalogListingSearchParams(searchParams);
  const normalizedSearchQuery = normalizeCatalogSearchQuery(
    parsedParams.searchQuery,
  );
  const searchableProducts = normalizedSearchQuery
    ? searchCatalogProducts(products, parsedParams.searchQuery)
    : products;
  const filterGroups = buildCatalogFilterGroups(
    searchableProducts,
    visibleFilterKeys,
  );
  const activeFilters = normalizeCatalogActiveFilters(
    parsedParams.filters,
    filterGroups,
  );
  const filteredProducts = applyCatalogActiveFilters(
    searchableProducts,
    activeFilters,
  );
  const paginatedProducts = paginateCatalogProducts(
    filteredProducts,
    parsedParams.page,
  );

  return {
    activeFilters,
    filterGroups,
    pagination: paginatedProducts.pagination,
    products: paginatedProducts.products,
    searchQuery: parsedParams.searchQuery,
  };
}

export async function getShopPageCatalogData(
  searchParams: CatalogListingSearchParams = {},
) {
  const products = await getCatalogProducts();

  return getCatalogListingData({
    products,
    searchParams,
    visibleFilterKeys: defaultShopVisibleFilterKeys,
  });
}

export async function getCategoryPageCatalogData(
  slug: string,
  searchParams: CatalogListingSearchParams = {},
) {
  const [categories, products] = await Promise.all([
    getCatalogActiveCategories(),
    getCatalogProducts(),
  ]);
  const category = categories.find((item) => item.slug === slug) ?? null;

  if (!category) {
    return null;
  }

  const scopedProducts = products.filter((product) =>
    product.categorySlugs.includes(slug),
  );

  return {
    category,
    categories,
    ...getCatalogListingData({
      products: scopedProducts,
      searchParams,
      visibleFilterKeys: defaultCategoryVisibleFilterKeys,
    }),
  };
}

export async function getRelatedCatalogProducts(
  product: CatalogStoreProduct,
  limit = 4,
) {
  const products = await getCatalogProducts();

  return products
    .filter(
      (item) =>
        item.slug !== product.slug &&
        item.categorySlug === product.categorySlug,
    )
    .slice(0, limit);
}
