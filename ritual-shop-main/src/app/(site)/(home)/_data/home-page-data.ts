import "server-only";

import { unstable_cache } from "next/cache";

import type {
  Category,
  HomePage as PayloadHomePage,
  Media,
  Product,
} from "../../../../../payload-types";
import {
  FRONTEND_CACHE_TAG,
  getGlobalTag,
} from "@/payload/cache/tags";
import { formatEuro } from "@/payload/collections/carts/shipping-contract";
import { getPayloadClient } from "../../_data/payload-client";
import {
  resolvePayloadLink,
  type PayloadLinkInput,
  type ResolvedLinkData,
} from "../../_helpers/resolve-payload-link";

const DEFAULT_HERO_IMAGE = "/ritual/uploads/hero-ritual.webp";

const productTypeLabels: Record<Product["productType"], string> = {
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

const badgeLabels = {
  "best-seller": "Top",
  limited: "Ograničeno",
  new: "Novo",
  sale: "Akcija",
} as const satisfies Record<NonNullable<Product["badges"]>[number], string>;

export type HomeImage = {
  alt: string;
  src: string;
};

export type HomeHeroData = {
  backgroundImage: HomeImage;
  description: string;
  highlights: {
    icon: HomeImage;
    label: string;
  }[];
  primaryCtaLabel: string;
  primaryCtaLink: null | ResolvedLinkData;
  title: string;
};

export type HomeFeaturedProduct = {
  badge: null | string;
  categoryLabel: string;
  image: HomeImage;
  priceLabel: string;
  slug: string;
  title: string;
};

export type HomeFeaturedProductsBlock = {
  blockType: "featured-products";
  browseLabel: string;
  browseLink: null | ResolvedLinkData;
  id: string;
  products: HomeFeaturedProduct[];
  title: string;
};

export type HomeCategoryGridBlock = {
  blockType: "category-grid";
  browseLabel: string;
  browseLink: null | ResolvedLinkData;
  id: string;
  items: {
    backgroundImage: HomeImage;
    link: ResolvedLinkData;
    name: string;
    productImage: HomeImage;
  }[];
  eyebrow: null | string;
  title: string;
};

export type HomeOverlayTileGridBlock = {
  blockType: "overlay-tile-grid";
  browseLabel: string;
  browseLink: null | ResolvedLinkData;
  id: string;
  items: {
    backgroundImage: HomeImage;
    label: string;
    link: ResolvedLinkData;
  }[];
  title: string;
};

export type HomeIconCardGridBlock = {
  blockType: "icon-card-grid";
  eyebrow: null | string;
  id: string;
  items: {
    icon: HomeImage;
    title: string;
  }[];
  title: string;
};

export type HomePartnersGridBlock = {
  blockType: "partners-grid";
  eyebrow: null | string;
  id: string;
  items: {
    link: null | ResolvedLinkData;
    logo: HomeImage;
    title: string;
  }[];
  title: string;
};

export type HomeOfficeShopBlock = {
  blockType: "office-shop";
  eyebrow: null | string;
  featureCard: {
    backgroundImage: HomeImage;
    eyebrow: null | string;
    link: null | ResolvedLinkData;
    linkLabel: string;
    title: string;
  };
  id: string;
  products: HomeFeaturedProduct[];
  title: string;
};

export type HomeHowToOrderBlock = {
  blockType: "how-to-order";
  eyebrow: null | string;
  id: string;
  steps: {
    image: HomeImage;
    title: string;
  }[];
  title: string;
};

export type HomeStoryPairBlock = {
  blockType: "story-pair";
  id: string;
  stories: {
    ctaLabel: null | string;
    ctaLink: null | ResolvedLinkData;
    description: string;
    eyebrow: null | string;
    image: HomeImage;
    title: string;
  }[];
};

export type HomeNewsletterSignupBlock = {
  blockType: "newsletter-signup";
  disclaimerLink: null | ResolvedLinkData;
  disclaimerLinkLabel: string;
  disclaimerText: string;
  emailPlaceholder: string;
  eyebrow: null | string;
  id: string;
  submitLabel: string;
  title: string;
};

export type HomeLayoutBlock =
  | HomeCategoryGridBlock
  | HomeFeaturedProductsBlock
  | HomeHowToOrderBlock
  | HomeIconCardGridBlock
  | HomeNewsletterSignupBlock
  | HomeOfficeShopBlock
  | HomeOverlayTileGridBlock
  | HomePartnersGridBlock
  | HomeStoryPairBlock;

export type HomePageData = {
  hero: HomeHeroData;
  layout: HomeLayoutBlock[];
  metaDescription: null | string;
  metaTitle: null | string;
};

function resolveMedia(
  media: number | Media | null | undefined,
  fallbackAlt: string,
  fallbackSrc?: string,
): HomeImage | null {
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

function resolveLink(link: PayloadLinkInput) {
  return resolvePayloadLink(link);
}

function resolveCategoryTitle(category: number | Category | undefined) {
  if (!category || typeof category === "number") {
    return null;
  }

  return category.title;
}

function resolveBadgeLabel(product: Product) {
  const badge = product.badges?.[0];

  if (!badge) {
    return null;
  }

  return badgeLabels[badge];
}

function resolveProductPriceLabel(product: Product) {
  if (typeof product.moralis.price === "number") {
    return formatEuro(product.moralis.price);
  }

  return "Cijena na upit";
}

function resolveProductCategoryLabel(product: Product) {
  const firstCategory = product.categories.find(
    (category): category is Category => typeof category === "object" && category !== null,
  );

  return resolveCategoryTitle(firstCategory) ?? productTypeLabels[product.productType];
}

function resolveFeaturedProduct(
  product: number | Product,
): HomeFeaturedProduct | null {
  if (typeof product === "number") {
    return null;
  }

  const image =
    resolveMedia(product.heroImage, product.title) ??
    resolveMedia(null, product.title, DEFAULT_HERO_IMAGE);

  if (!image || !product.slug) {
    return null;
  }

  return {
    badge: resolveBadgeLabel(product),
    categoryLabel: resolveProductCategoryLabel(product),
    image,
    priceLabel: resolveProductPriceLabel(product),
    slug: product.slug,
    title: product.title,
  };
}

function normalizeText(value: null | string | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function mapHomePage(doc: PayloadHomePage): HomePageData {
  const hero: HomeHeroData = {
    backgroundImage:
      resolveMedia(doc.hero.backgroundImage, doc.hero.title, DEFAULT_HERO_IMAGE) ?? {
        alt: doc.hero.title,
        src: DEFAULT_HERO_IMAGE,
      },
    description: doc.hero.description,
    highlights: (doc.hero.highlights ?? []).flatMap((highlight) => {
      const icon = resolveMedia(highlight.icon, highlight.label);

      return icon
        ? [
            {
              icon,
              label: highlight.label,
            },
          ]
        : [];
    }),
    primaryCtaLabel: doc.hero.primaryCtaLabel,
    primaryCtaLink: resolveLink({
      label: doc.hero.primaryCtaLabel,
      linkAnchor: doc.hero.primaryCtaAnchor,
      linkOpenInNewTab: doc.hero.primaryCtaOpenInNewTab,
      linkReference: doc.hero.primaryCtaReference,
      linkType: doc.hero.primaryCtaType,
      linkUrl: doc.hero.primaryCtaUrl,
    }),
    title: doc.hero.title,
  };

  const layout = (doc.layout ?? []).flatMap<HomeLayoutBlock>((block, index) => {
    const blockId = block.id ?? `${block.blockType}-${index}`;

    switch (block.blockType) {
      case "featured-products":
        return [
          {
            blockType: block.blockType,
            browseLabel: block.section.browseLabel,
            browseLink: resolveLink({
              label: block.section.browseLabel,
              linkAnchor: block.section.browseAnchor,
              linkOpenInNewTab: block.section.browseOpenInNewTab,
              linkReference: block.section.browseReference,
              linkType: block.section.browseType,
              linkUrl: block.section.browseUrl,
            }),
            id: blockId,
            products: block.products.flatMap((product) => {
              const mapped = resolveFeaturedProduct(product);

              return mapped ? [mapped] : [];
            }),
            title: block.section.title,
          },
        ];

      case "category-grid":
        return [
          {
            blockType: block.blockType,
            browseLabel: block.section.browseLabel,
            browseLink: resolveLink({
              label: block.section.browseLabel,
              linkAnchor: block.section.browseAnchor,
              linkOpenInNewTab: block.section.browseOpenInNewTab,
              linkReference: block.section.browseReference,
              linkType: block.section.browseType,
              linkUrl: block.section.browseUrl,
            }),
            eyebrow: normalizeText(block.section.eyebrow),
            id: blockId,
            items: (block.items ?? []).flatMap((item) => {
              const backgroundImage = resolveMedia(item.backgroundImage, item.name);
              const productImage = resolveMedia(item.productImage, item.name);
              const link = resolveLink({
                label: item.name,
                linkAnchor: item.cardAnchor,
                linkOpenInNewTab: item.cardOpenInNewTab,
                linkReference: item.cardReference,
                linkType: item.cardType,
                linkUrl: item.cardUrl,
              });

              return backgroundImage && productImage && link
                ? [
                    {
                      backgroundImage,
                      link,
                      name: item.name,
                      productImage,
                    },
                  ]
                : [];
            }),
            title: block.section.title,
          },
        ];

      case "overlay-tile-grid":
        return [
          {
            blockType: block.blockType,
            browseLabel: block.section.browseLabel,
            browseLink: resolveLink({
              label: block.section.browseLabel,
              linkAnchor: block.section.browseAnchor,
              linkOpenInNewTab: block.section.browseOpenInNewTab,
              linkReference: block.section.browseReference,
              linkType: block.section.browseType,
              linkUrl: block.section.browseUrl,
            }),
            id: blockId,
            items: (block.items ?? []).flatMap((item) => {
              const backgroundImage = resolveMedia(item.backgroundImage, item.label);
              const link = resolveLink({
                label: item.label,
                linkAnchor: item.cardAnchor,
                linkOpenInNewTab: item.cardOpenInNewTab,
                linkReference: item.cardReference,
                linkType: item.cardType,
                linkUrl: item.cardUrl,
              });

              return backgroundImage && link
                ? [
                    {
                      backgroundImage,
                      label: item.label,
                      link,
                    },
                  ]
                : [];
            }),
            title: block.section.title,
          },
        ];

      case "icon-card-grid":
        return [
          {
            blockType: block.blockType,
            eyebrow: normalizeText(block.section.eyebrow),
            id: blockId,
            items: (block.items ?? []).flatMap((item) => {
              const icon = resolveMedia(item.icon, item.title);

              return icon
                ? [
                    {
                      icon,
                      title: item.title,
                    },
                  ]
                : [];
            }),
            title: block.section.title,
          },
        ];

      case "partners-grid":
        return [
          {
            blockType: block.blockType,
            eyebrow: normalizeText(block.section.eyebrow),
            id: blockId,
            items: (block.items ?? []).flatMap((item) => {
              const logo = resolveMedia(item.logo, item.title);

              return logo
                ? [
                    {
                      link: resolveLink({
                        label: item.title,
                        linkAnchor: item.logoAnchor,
                        linkOpenInNewTab: item.logoOpenInNewTab,
                        linkReference: item.logoReference,
                        linkType: item.logoType,
                        linkUrl: item.logoUrl,
                      }),
                      logo,
                      title: item.title,
                    },
                  ]
                : [];
            }),
            title: block.section.title,
          },
        ];

      case "office-shop":
        return [
          {
            blockType: block.blockType,
            eyebrow: normalizeText(block.section.eyebrow),
            featureCard: {
              backgroundImage:
                resolveMedia(
                  block.featureCard.backgroundImage,
                  block.featureCard.title,
                  DEFAULT_HERO_IMAGE,
                ) ?? {
                  alt: block.featureCard.title,
                  src: DEFAULT_HERO_IMAGE,
                },
              eyebrow: normalizeText(block.featureCard.eyebrow),
              link: resolveLink({
                label: block.featureCard.linkLabel,
                linkAnchor: block.featureCard.featureAnchor,
                linkOpenInNewTab: block.featureCard.featureOpenInNewTab,
                linkReference: block.featureCard.featureReference,
                linkType: block.featureCard.featureType,
                linkUrl: block.featureCard.featureUrl,
              }),
              linkLabel: block.featureCard.linkLabel,
              title: block.featureCard.title,
            },
            id: blockId,
            products: block.products.flatMap((product) => {
              const mapped = resolveFeaturedProduct(product);

              return mapped ? [mapped] : [];
            }),
            title: block.section.title,
          },
        ];

      case "how-to-order":
        return [
          {
            blockType: block.blockType,
            eyebrow: normalizeText(block.section.eyebrow),
            id: blockId,
            steps: (block.steps ?? []).flatMap((step) => {
              const image = resolveMedia(step.image, step.title);

              return image
                ? [
                    {
                      image,
                      title: step.title,
                    },
                  ]
                : [];
            }),
            title: block.section.title,
          },
        ];

      case "story-pair":
        return [
          {
            blockType: block.blockType,
            id: blockId,
            stories: (block.stories ?? []).flatMap((story) => {
              const image = resolveMedia(story.image, story.title);

              return image
                ? [
                    {
                      ctaLabel:
                        story.ctaMode === "enabled" ? normalizeText(story.ctaLabel) : null,
                      ctaLink:
                        story.ctaMode === "enabled"
                          ? resolveLink({
                              label: story.ctaLabel ?? "",
                              linkAnchor: story.ctaAnchor,
                              linkOpenInNewTab: story.ctaOpenInNewTab,
                              linkReference: story.ctaReference,
                              linkType: story.ctaType ?? "internal",
                              linkUrl: story.ctaUrl,
                            })
                          : null,
                      description: story.description,
                      eyebrow: normalizeText(story.eyebrow),
                      image,
                      title: story.title,
                    },
                  ]
                : [];
            }),
          },
        ];

      case "newsletter-signup":
        return [
          {
            blockType: block.blockType,
            disclaimerLink: resolveLink({
              label: block.disclaimerLinkLabel,
              linkAnchor: block.disclaimerAnchor,
              linkOpenInNewTab: block.disclaimerOpenInNewTab,
              linkReference: block.disclaimerReference,
              linkType: block.disclaimerType,
              linkUrl: block.disclaimerUrl,
            }),
            disclaimerLinkLabel: block.disclaimerLinkLabel,
            disclaimerText: block.disclaimerText,
            emailPlaceholder: block.emailPlaceholder,
            eyebrow: normalizeText(block.eyebrow),
            id: blockId,
            submitLabel: block.submitLabel,
            title: block.title,
          },
        ];
    }

    return [];
  });

  return {
    hero,
    layout,
    metaDescription: doc.meta?.description ?? null,
    metaTitle: doc.meta?.title ?? null,
  };
}

export const getHomePageData = unstable_cache(
  async (): Promise<HomePageData> => {
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({
      slug: "home-page",
      depth: 2,
    });

    return mapHomePage(doc);
  },
  ["home-page"],
  {
    tags: [FRONTEND_CACHE_TAG, getGlobalTag("home-page")],
  },
);
