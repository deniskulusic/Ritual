export type StoreCategory = {
  slug: string;
  name: string;
  backgroundImage: string;
  image: string;
  overlayOpacity: number;
  supportCta?: {
    title: string;
    description: string;
    href: string;
    label: string;
    image: string;
  };
};

export type StoreInstruction = {
  icon: string;
  label: string;
};

export type StoreAdditionalInfo = {
  label: string;
  value: string;
};

export type StoreCatalogReviewStatus = "ready" | "review_required" | "do_not_publish";

export type StoreProduct = {
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  year: number;
  countryLabel: string;
  region: string;
  brand: string;
  format: string;
  packSize: string;
  priceLabel: string;
  priceValue: number;
  priceBand: string;
  image: string;
  articleCode?: string;
  badge?: string;
  catalogReviewStatus?: StoreCatalogReviewStatus;
  editorialBadges?: string[];
  stockLabel: string;
  inStock: boolean;
  description: string[];
  notes?: string[];
  specifications?: StoreAdditionalInfo[];
  instructions: StoreInstruction[];
  additionalInfo: StoreAdditionalInfo[];
};

export const STORE_PAGE_QUERY_PARAM = "page";

export const STORE_FILTER_QUERY_PARAMS = [
  "brand",
  "category",
  "type",
  "region",
  "min",
  "max",
  "minYear",
  "maxYear",
] as const;

export type StoreCheckboxFilterOption = {
  label: string;
  value: string;
};

export type StoreCheckboxFilterGroup = {
  key: "brand" | "region" | "format" | "categoryName";
  label: string;
  kind: "checkbox";
  param: "brand" | "category" | "region" | "type";
  options: StoreCheckboxFilterOption[];
};

export type StoreRangeFilterGroup = {
  key: "year" | "priceValue";
  label: string;
  kind: "range";
  minParam: "min" | "minYear";
  maxParam: "max" | "maxYear";
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
};

export type StoreFilterGroup = StoreCheckboxFilterGroup | StoreRangeFilterGroup;

export type StoreRangeFilterValue = {
  min: number;
  max: number;
};

export type StoreFilterValue = string[] | StoreRangeFilterValue;

export type StoreActiveFilters = Partial<
  Record<StoreFilterGroup["key"], StoreFilterValue>
>;

export type StorePagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export const storeCategories: StoreCategory[] = [
  {
    slug: "kava-u-zrnu",
    name: "Kava u zrnu",
    backgroundImage: "/ritual/images/dalmatia.png",
    image: "/ritual/images/cat-1.png",
    overlayOpacity: 0.5,
    supportCta: {
      title: "Tražite savjet za ured ili ugostiteljstvo?",
      description:
        "Privremeni placeholder sadržaj prati postojeću CTA strukturu i ostaje spreman za kasnije CMS povezivanje.",
      href: "/shop",
      label: "Kontaktirajte nas",
      image: "/ritual/images/have-questions.png",
    },
  },
  {
    slug: "kava-u-kapsulama",
    name: "Kava u kapsulama",
    backgroundImage: "/ritual/images/istria.png",
    image: "/ritual/images/cat-2.png",
    overlayOpacity: 0.55,
  },
  {
    slug: "cajevi-i-matcha",
    name: "Čajevi i matcha",
    backgroundImage: "/ritual/images/ritual-pattern-bg-2.jpg",
    image: "/ritual/images/cat-3.png",
    overlayOpacity: 0.15,
  },
  {
    slug: "aparati-za-kavu",
    name: "Aparati za kavu",
    backgroundImage: "/ritual/images/ritual-pattern-bg-2.jpg",
    image: "/ritual/images/cat-4.png",
    overlayOpacity: 0.05,
  },
  {
    slug: "pribor",
    name: "Pribor",
    backgroundImage: "/ritual/images/slavonia.png",
    image: "/ritual/images/cat-5.png",
    overlayOpacity: 0.2,
  },
  {
    slug: "za-ured",
    name: "Za ured",
    backgroundImage: "/ritual/uploads/hero-ritual.webp",
    image: "/ritual/images/cat-6.png",
    overlayOpacity: 0,
  },
];

export const storeProducts: StoreProduct[] = [
  {
    slug: "goppion-jbm-1000g",
    title: "Goppion J.B.M. 1000g",
    categorySlug: "kava-u-zrnu",
    categoryName: "Kava u zrnu",
    year: 2024,
    countryLabel: "Brazil",
    region: "Cerrado",
    brand: "Goppion",
    format: "Zrno",
    packSize: "1000 g",
    priceLabel: "24 EUR",
    priceValue: 24,
    priceBand: "20-30 EUR",
    image: "/ritual/uploads/products/0101004.png",
    badge: "Novo",
    stockLabel: "Na zalihi",
    inStock: true,
    description: [
      "Izbalansirana espresso mješavina za svakodnevni ritual pripreme, s punim tijelom i čistim završetkom.",
      "Privremeni sadržaj ostaje placeholder dok se detaljni opisi i podaci ne povežu iz Payload CMS-a.",
    ],
    instructions: [
      { icon: "/ritual/icons/thermometer.svg", label: "Espresso" },
      { icon: "/ritual/icons/wine-bottle.svg", label: "100% Arabica" },
      { icon: "/ritual/icons/fast-shipping.svg", label: "Svježe prženo" },
    ],
    additionalInfo: [
      { label: "Težina", value: "1000 g" },
      { label: "Vrsta", value: "Kava u zrnu" },
      { label: "Pržionica", value: "Goppion" },
      { label: "Blend", value: "Arabica" },
      { label: "Podrijetlo", value: "Brazil" },
      { label: "Napomene", value: "Čokolada, karamela, uravnotežena kiselost." },
    ],
  },
  {
    slug: "lavazza-point-cream",
    title: "Lavazza Point Cream",
    categorySlug: "kava-u-kapsulama",
    categoryName: "Kava u kapsulama",
    year: 2023,
    countryLabel: "Italija",
    region: "Torino",
    brand: "Lavazza",
    format: "Kapsule",
    packSize: "50 kom",
    priceLabel: "29 EUR",
    priceValue: 29,
    priceBand: "20-30 EUR",
    image: "/ritual/uploads/products/0101008.png",
    badge: "Top",
    stockLabel: "Na zalihi",
    inStock: true,
    description: [
      "Kapsule za kremasti espresso s blagim završetkom i prepoznatljivim Lavazza profilom okusa.",
      "Frontend struktura već sada prati proizvodni raspored bez uključenih košarica i checkout logike.",
    ],
    instructions: [
      { icon: "/ritual/icons/thermometer.svg", label: "Lavazza Point" },
      { icon: "/ritual/icons/payment.svg", label: "Kremasto" },
      { icon: "/ritual/icons/delivery.svg", label: "Jednostavna priprema" },
    ],
    additionalInfo: [
      { label: "Težina", value: "50 kapsula" },
      { label: "Vrsta", value: "Kompatibilne kapsule" },
      { label: "Pržionica", value: "Lavazza" },
      { label: "Blend", value: "Espresso blend" },
      { label: "Podrijetlo", value: "Italija" },
    ],
  },
  {
    slug: "lavazza-point-espresso",
    title: "Lavazza Point Espresso",
    categorySlug: "kava-u-kapsulama",
    categoryName: "Kava u kapsulama",
    year: 2022,
    countryLabel: "Italija",
    region: "Torino",
    brand: "Lavazza",
    format: "Kapsule",
    packSize: "50 kom",
    priceLabel: "34 EUR",
    priceValue: 34,
    priceBand: "30+ EUR",
    image: "/ritual/uploads/products/demo-product.png",
    badge: "Akcija",
    stockLabel: "Na zalihi",
    inStock: true,
    description: [
      "Intenzivniji espresso profil za korisnike koji traže više tijela i puniji okus u kapsuli.",
    ],
    instructions: [
      { icon: "/ritual/icons/thermometer.svg", label: "Intenzitet 9" },
      { icon: "/ritual/icons/location.svg", label: "Tamnije prženje" },
    ],
    additionalInfo: [
      { label: "Težina", value: "50 kapsula" },
      { label: "Vrsta", value: "Kompatibilne kapsule" },
      { label: "Pržionica", value: "Lavazza" },
      { label: "Blend", value: "Espresso roast" },
      { label: "Podrijetlo", value: "Italija" },
    ],
  },
  {
    slug: "lavazza-point-decaf",
    title: "Lavazza Point Decaf",
    categorySlug: "kava-u-kapsulama",
    categoryName: "Kava u kapsulama",
    year: 2021,
    countryLabel: "Italija",
    region: "Torino",
    brand: "Lavazza",
    format: "Kapsule",
    packSize: "50 kom",
    priceLabel: "31 EUR",
    priceValue: 31,
    priceBand: "30+ EUR",
    image: "/ritual/uploads/products/0101010.png",
    stockLabel: "Na zalihi",
    inStock: true,
    description: [
      "Bez kofeina, ali s punim aromatskim profilom za večernje rituale i uredsku svakodnevicu.",
    ],
    instructions: [
      { icon: "/ritual/icons/secured-payment.svg", label: "Bez kofeina" },
      { icon: "/ritual/icons/delivery.svg", label: "Kapsule" },
    ],
    additionalInfo: [
      { label: "Težina", value: "50 kapsula" },
      { label: "Vrsta", value: "Decaf kapsule" },
      { label: "Pržionica", value: "Lavazza" },
      { label: "Blend", value: "Mješavina bez kofeina" },
      { label: "Podrijetlo", value: "Italija" },
    ],
  },
  {
    slug: "lavazza-point-aroma",
    title: "Lavazza Point Aroma",
    categorySlug: "kava-u-kapsulama",
    categoryName: "Kava u kapsulama",
    year: 2020,
    countryLabel: "Italija",
    region: "Torino",
    brand: "Lavazza",
    format: "Kapsule",
    packSize: "50 kom",
    priceLabel: "39 EUR",
    priceValue: 39,
    priceBand: "30+ EUR",
    image: "/ritual/uploads/products/0101011.png",
    stockLabel: "Na zalihi",
    inStock: true,
    description: [
      "Aromatična kapsula za korisnike koji traže slojevitiji profil i uravnotežen crema sloj.",
    ],
    instructions: [
      { icon: "/ritual/icons/thermometer.svg", label: "Aromatično" },
      { icon: "/ritual/icons/wpay.svg", label: "Puna krema" },
    ],
    additionalInfo: [
      { label: "Težina", value: "50 kapsula" },
      { label: "Vrsta", value: "Kompatibilne kapsule" },
      { label: "Pržionica", value: "Lavazza" },
      { label: "Blend", value: "Signature blend" },
      { label: "Podrijetlo", value: "Italija" },
    ],
  },
  {
    slug: "baru-matcha-latte-250g",
    title: "Baru Matcha Latte 250g",
    categorySlug: "cajevi-i-matcha",
    categoryName: "Čajevi i matcha",
    year: 2025,
    countryLabel: "Matcha",
    region: "Kyoto",
    brand: "Baru",
    format: "Prah",
    packSize: "250 g",
    priceLabel: "19 EUR",
    priceValue: 19,
    priceBand: "Do 20 EUR",
    image: "/ritual/uploads/products/0101012.png",
    badge: "Novo",
    stockLabel: "Na zalihi",
    inStock: true,
    description: [
      "Baru matcha latte mješavina za jutarnje rituale, brzu pripremu i kremastu teksturu u šalici.",
    ],
    instructions: [
      { icon: "/ritual/icons/thermometer.svg", label: "Toplo i hladno" },
      { icon: "/ritual/icons/location.svg", label: "Matcha blend" },
    ],
    additionalInfo: [
      { label: "Težina", value: "250 g" },
      { label: "Vrsta", value: "Matcha latte" },
      { label: "Pržionica", value: "Baru" },
      { label: "Blend", value: "Zeleni čaj i mlijeko" },
      { label: "Podrijetlo", value: "Japan" },
    ],
  },
];

export const shopFilterGroups: StoreFilterGroup[] = [
  {
    key: "year",
    label: "Jahrgang",
    kind: "range",
    minParam: "minYear",
    maxParam: "maxYear",
    min: 2020,
    max: 2025,
    step: 1,
    minLabel: "Min. Jahrgang",
    maxLabel: "Max. Jahrgang",
  },
  {
    key: "brand",
    label: "Produzent",
    kind: "checkbox",
    param: "brand",
    options: ["Goppion", "Lavazza", "Baru"].map((label) => ({
      label,
      value: label,
    })),
  },
  {
    key: "priceValue",
    label: "Preis",
    kind: "range",
    minParam: "min",
    maxParam: "max",
    min: 10,
    max: 50,
    step: 5,
    minLabel: "Min. Preis",
    maxLabel: "Max. Preis",
  },
  {
    key: "region",
    label: "Region",
    kind: "checkbox",
    param: "region",
    options: ["Cerrado", "Torino", "Kyoto"].map((label) => ({
      label,
      value: label,
    })),
  },
  {
    key: "categoryName",
    label: "Weintyp",
    kind: "checkbox",
    param: "category",
    options: storeCategories.map((category) => ({
      label: category.name,
      value: category.slug,
    })),
  },
];

export const categoryFilterGroups: StoreFilterGroup[] = [
  {
    key: "year",
    label: "Jahrgang",
    kind: "range",
    minParam: "minYear",
    maxParam: "maxYear",
    min: 2020,
    max: 2025,
    step: 1,
    minLabel: "Min. Jahrgang",
    maxLabel: "Max. Jahrgang",
  },
  {
    key: "brand",
    label: "Produzent",
    kind: "checkbox",
    param: "brand",
    options: ["Goppion", "Lavazza", "Baru"].map((label) => ({
      label,
      value: label,
    })),
  },
  {
    key: "priceValue",
    label: "Preis",
    kind: "range",
    minParam: "min",
    maxParam: "max",
    min: 10,
    max: 50,
    step: 5,
    minLabel: "Min. Preis",
    maxLabel: "Max. Preis",
  },
  {
    key: "region",
    label: "Region",
    kind: "checkbox",
    param: "region",
    options: ["Cerrado", "Torino", "Kyoto"].map((label) => ({
      label,
      value: label,
    })),
  },
];

export function getCategoryBySlug(slug: string) {
  return storeCategories.find((category) => category.slug === slug);
}

export function getProductBySlug(slug: string) {
  return storeProducts.find((product) => product.slug === slug);
}

export function getProductsByCategory(categorySlug: string) {
  return storeProducts.filter((product) => product.categorySlug === categorySlug);
}

export function getRelatedProducts(product: StoreProduct, limit = 4) {
  return storeProducts
    .filter((item) => item.slug !== product.slug && item.categorySlug === product.categorySlug)
    .slice(0, limit);
}

export function normalizeStoreSearchQuery(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getStoreProductSearchText(product: StoreProduct) {
  return normalizeStoreSearchQuery(
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

export function searchStoreProducts(query: string, limit = storeProducts.length) {
  const normalizedQuery = normalizeStoreSearchQuery(query);

  if (!normalizedQuery) {
    return storeProducts.slice(0, limit);
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);

  return storeProducts
    .map((product) => {
      const title = normalizeStoreSearchQuery(product.title);
      const brand = normalizeStoreSearchQuery(product.brand);
      const category = normalizeStoreSearchQuery(product.categoryName);
      const region = normalizeStoreSearchQuery(product.region);
      const country = normalizeStoreSearchQuery(product.countryLabel);
      const searchText = getStoreProductSearchText(product);

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
      if (region.includes(normalizedQuery) || country.includes(normalizedQuery)) {
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
    .filter((entry): entry is { product: StoreProduct; score: number } => entry !== null)
    .sort((left, right) => right.score - left.score || left.product.title.localeCompare(right.product.title))
    .slice(0, limit)
    .map((entry) => entry.product);
}

export function getStoreSearchBrands(limit = 6) {
  return Array.from(new Set(storeProducts.map((product) => product.brand))).slice(0, limit);
}

export function getStoreFeaturedSearchProducts(limit = 3) {
  return storeProducts.filter((product) => product.badge || product.inStock).slice(0, limit);
}
