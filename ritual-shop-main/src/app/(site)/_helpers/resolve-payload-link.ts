import type {
  Category,
  LegalPage,
  ListingPage,
  Page,
  Product,
} from "../../../../payload-types";

type PayloadLinkReference =
  | {
      relationTo: "pages";
      value: number | Pick<Page, "id" | "slug">;
    }
  | {
      relationTo: "legal-pages";
      value: number | Pick<LegalPage, "id" | "slug">;
    }
  | {
      relationTo: "listing-pages";
      value: number | Pick<ListingPage, "id" | "slug">;
    }
  | {
      relationTo: "products";
      value: number | Pick<Product, "id" | "slug">;
    }
  | {
      relationTo: "categories";
      value: number | Pick<Category, "id" | "slug">;
    };

export type PayloadLinkInput = {
  label: string;
  linkAnchor?: string | null;
  linkOpenInNewTab?: boolean | null;
  linkReference?: PayloadLinkReference | null;
  linkType: "internal" | "external";
  linkUrl?: string | null;
};

export type ResolvedLinkData = {
  href: string;
  kind: "internal" | "external";
  label: string;
  openInNewTab: boolean;
};

function normalizeAnchor(anchor: string | null | undefined) {
  if (typeof anchor !== "string") {
    return "";
  }

  return anchor.trim().replace(/^#+/, "");
}

function resolveReferenceSlug(reference: PayloadLinkReference) {
  if (typeof reference.value === "number") {
    return null;
  }

  if (typeof reference.value.slug === "string") {
    return reference.value.slug;
  }

  return null;
}

function buildInternalHref(reference: PayloadLinkReference, slug: string) {
  switch (reference.relationTo) {
    case "pages":
      return slug ? `/${slug}` : "/";
    case "legal-pages":
      return slug ? `/${slug}` : "/";
    case "listing-pages":
      return slug ? `/shop/${slug}` : "/shop";
    case "products":
      return slug ? `/product/${slug}` : "/product";
    case "categories":
      return slug ? `/product-category/${slug}` : "/product-category";
  }
}

export function resolvePayloadLink(link: PayloadLinkInput): ResolvedLinkData | null {
  if (link.linkType === "external") {
    const href = typeof link.linkUrl === "string" ? link.linkUrl.trim() : "";

    if (!href) {
      return null;
    }

    return {
      href,
      kind: "external",
      label: link.label,
      openInNewTab: Boolean(link.linkOpenInNewTab),
    };
  }

  if (!link.linkReference) {
    return null;
  }

  const slug = resolveReferenceSlug(link.linkReference);

  if (slug === null) {
    return null;
  }

  const anchor = normalizeAnchor(link.linkAnchor);
  const href = buildInternalHref(link.linkReference, slug);

  return {
    href: anchor ? `${href}#${anchor}` : href,
    kind: "internal",
    label: link.label,
    openInNewTab: Boolean(link.linkOpenInNewTab),
  };
}
