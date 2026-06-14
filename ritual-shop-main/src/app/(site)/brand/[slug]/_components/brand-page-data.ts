import "server-only";

import { unstable_cache } from "next/cache";

import type { Brand, Media, Product } from "../../../../../../payload-types";
import {
  FRONTEND_CACHE_TAG,
  getCollectionTag,
  getDocumentTag,
} from "@/payload/cache/tags";
import { formatEuro } from "@/payload/collections/carts/shipping-contract";
import { getPayloadClient } from "../../../_data/payload-client";
import {
  resolvePayloadLink,
  type PayloadLinkInput,
  type ResolvedLinkData,
} from "../../../_helpers/resolve-payload-link";

const DEFAULT_BRAND_VISUAL = "/ritual/uploads/hero-ritual.webp";

export type BrandPageProduct = {
  title: string;
  eyebrow: string;
  priceLabel: string;
  image: string;
  href: string;
};

export type BrandProductSliderSection = {
  title: string;
  link: null | ResolvedLinkData;
  linkLabel: string;
  visual?: {
    image: string;
    copy: string;
  };
  products: BrandPageProduct[];
};

export type BrandPageTile = {
  label: string;
  link: ResolvedLinkData;
  backgroundImage: string;
};

export type BrandTileGridSection = {
  title: string;
  link: null | ResolvedLinkData;
  linkLabel: string;
  tiles: BrandPageTile[];
};

export type BrandPageCta = {
  title: string;
  subtitle: string;
  image?: string;
  actionLabel?: string | null;
  actionLink: null | ResolvedLinkData;
};

export type BrandProductSliderBlock = {
  blockType: "brand-product-slider";
  id: string;
  section: BrandProductSliderSection;
};

export type BrandTileGridBlock = {
  blockType: "brand-tile-grid";
  id: string;
  section: BrandTileGridSection;
};

export type BrandCtaBannerBlock = {
  blockType: "brand-cta-banner";
  cta: BrandPageCta;
  id: string;
};

export type BrandLayoutBlock =
  | BrandCtaBannerBlock
  | BrandProductSliderBlock
  | BrandTileGridBlock;

export type BrandPageData = {
  layout: BrandLayoutBlock[];
  metaDescription: null | string;
  metaTitle: null | string;
  title: string;
};

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

function resolveLink(link: PayloadLinkInput) {
  return resolvePayloadLink(link);
}

function resolveProductBrandName(product: Product, fallbackBrandName: string) {
  if (product.brand && typeof product.brand === "object" && typeof product.brand.name === "string") {
    return product.brand.name;
  }

  return fallbackBrandName;
}

function resolveProductPriceLabel(product: Product) {
  if (typeof product.moralis.price === "number") {
    return formatEuro(product.moralis.price);
  }

  return "Cijena na upit";
}

function resolveBrandProduct(product: number | Product, fallbackBrandName: string) {
  if (typeof product === "number" || !product.slug) {
    return null;
  }

  const image = resolveMedia(product.heroImage, product.title, DEFAULT_BRAND_VISUAL)?.src;

  if (!image) {
    return null;
  }

  return {
    eyebrow: resolveProductBrandName(product, fallbackBrandName),
    href: `/product/${product.slug}`,
    image,
    priceLabel: resolveProductPriceLabel(product),
    title: product.title,
  } satisfies BrandPageProduct;
}

function normalizeText(value: null | string | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function mapBrandPage(doc: Brand): BrandPageData {
  const layout = (doc.layout ?? []).flatMap<BrandLayoutBlock>((block, index) => {
    const blockId = block.id ?? `${block.blockType}-${index}`;

    switch (block.blockType) {
      case "brand-product-slider": {
        const visualImage = resolveMedia(block.visual?.image, block.section.title);

        return [
          {
            blockType: block.blockType,
            id: blockId,
            section: {
              link: resolveLink({
                label: block.section.browseLabel,
                linkAnchor: block.section.browseAnchor,
                linkOpenInNewTab: block.section.browseOpenInNewTab,
                linkReference: block.section.browseReference,
                linkType: block.section.browseType,
                linkUrl: block.section.browseUrl,
              }),
              linkLabel: block.section.browseLabel,
              products: (block.products ?? []).flatMap((product) => {
                const mapped = resolveBrandProduct(product, doc.name);

                return mapped ? [mapped] : [];
              }),
              title: block.section.title,
              visual:
                visualImage || normalizeText(block.visual?.copy)
                  ? {
                      copy: normalizeText(block.visual?.copy) ?? "",
                      image: visualImage?.src ?? DEFAULT_BRAND_VISUAL,
                    }
                  : undefined,
            },
          },
        ];
      }

      case "brand-tile-grid":
        return [
          {
            blockType: block.blockType,
            id: blockId,
            section: {
              link: resolveLink({
                label: block.section.browseLabel,
                linkAnchor: block.section.browseAnchor,
                linkOpenInNewTab: block.section.browseOpenInNewTab,
                linkReference: block.section.browseReference,
                linkType: block.section.browseType,
                linkUrl: block.section.browseUrl,
              }),
              linkLabel: block.section.browseLabel,
              tiles: (block.tiles ?? []).flatMap((tile) => {
                const link = resolveLink({
                  label: tile.label,
                  linkAnchor: tile.cardAnchor,
                  linkOpenInNewTab: tile.cardOpenInNewTab,
                  linkReference: tile.cardReference,
                  linkType: tile.cardType,
                  linkUrl: tile.cardUrl,
                });

                if (!link) {
                  return [];
                }

                const backgroundImage =
                  resolveMedia(tile.backgroundImage, tile.label)?.src;

                if (!backgroundImage) {
                  return [];
                }

                return [
                  {
                    backgroundImage,
                    label: tile.label,
                    link,
                  } satisfies BrandPageTile,
                ];
              }),
              title: block.section.title,
            },
          },
        ];

      case "brand-cta-banner":
        return [
          {
            blockType: block.blockType,
            cta: {
              actionLabel: normalizeText(block.actionLabel),
              actionLink: resolveLink({
                label: block.actionLabel ?? "",
                linkAnchor: block.actionAnchor,
                linkOpenInNewTab: block.actionOpenInNewTab,
                linkReference: block.actionReference,
                linkType: block.actionType,
                linkUrl: block.actionUrl,
              }),
              image: resolveMedia(block.image, block.title)?.src,
              subtitle: block.subtitle,
              title: block.title,
            },
            id: blockId,
          },
        ];
    }

    return [];
  });

  return {
    layout,
    metaDescription: doc.metaDescription ?? normalizeText(doc.shortDescription) ?? normalizeText(doc.story),
    metaTitle: doc.metaTitle ?? null,
    title: doc.name,
  };
}

async function readBrandPageBySlug(slug: string) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "brands",
    depth: 2,
    limit: 1,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  const page = result.docs[0];

  return page ? mapBrandPage(page) : null;
}

export async function getBrandPageBySlug(slug: string) {
  return unstable_cache(() => readBrandPageBySlug(slug), ["brand-page", slug], {
    tags: [FRONTEND_CACHE_TAG, getCollectionTag("brands"), getDocumentTag("brands", slug)],
  })();
}

export const getBrandPageSlugs = unstable_cache(
  async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "brands",
      depth: 0,
      limit: 100,
      pagination: false,
    });

    return result.docs
      .map((doc) => doc.slug)
      .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
  },
  ["brand-page-slugs"],
  {
    tags: [FRONTEND_CACHE_TAG, getCollectionTag("brands")],
  },
);
