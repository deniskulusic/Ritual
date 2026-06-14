export type ProductSearchHit = {
  brand: string;
  image: string;
  priceLabel: string;
  slug: string;
  title: string;
};

export type ProductSearchResponse = {
  results: ProductSearchHit[];
};

export function normalizeProductSearchQuery(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
