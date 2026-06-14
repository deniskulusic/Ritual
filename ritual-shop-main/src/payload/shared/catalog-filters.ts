export const catalogVisibleFilterDefinitions = [
  {
    adminLabel: { en: "Brand", hr: "Brend" },
    key: "brand",
    storefrontLabel: "Brend",
  },
  {
    adminLabel: { en: "Category", hr: "Kategorija" },
    key: "categoryName",
    storefrontLabel: "Kategorija",
  },
  {
    adminLabel: { en: "Product type", hr: "Vrsta proizvoda" },
    key: "format",
    storefrontLabel: "Vrsta proizvoda",
  },
  {
    adminLabel: { en: "Price", hr: "Cijena" },
    key: "priceValue",
    storefrontLabel: "Cijena",
  },
] as const;

export type CatalogVisibleFilterKey =
  (typeof catalogVisibleFilterDefinitions)[number]["key"];

export const defaultShopVisibleFilterKeys: CatalogVisibleFilterKey[] = [
  "brand",
  "categoryName",
  "format",
  "priceValue",
];

export const defaultCategoryVisibleFilterKeys: CatalogVisibleFilterKey[] = [
  "brand",
  "format",
  "priceValue",
];

export function getCatalogVisibleFilterDefinition(key: CatalogVisibleFilterKey) {
  return (
    catalogVisibleFilterDefinitions.find((definition) => definition.key === key) ??
    null
  );
}
