import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  type CatalogListingSearchParams,
  filterProductsByScope,
  getCatalogListingData,
  getCatalogProducts,
} from "../../_data/catalog-page-data";
import { ProductBrowser } from "../../_components/product-browser";
import { StoreBreadcrumbs } from "../../../_components/store-breadcrumbs";
import {
  getListingPageBySlug,
  getListingPageSlugs,
} from "./_components/listing-page-data";

type ListingPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogListingSearchParams>;
};

export async function generateStaticParams() {
  const slugs = await getListingPageSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getListingPageBySlug(slug);

  if (!page) {
    return {
      title: "Ponuda | Ritual Shop",
    };
  }

  return {
    description: page.metaDescription ?? page.description ?? undefined,
    title: page.metaTitle ?? `${page.title} | Ritual Shop`,
  };
}

export default async function ListingPage({
  params,
  searchParams,
}: ListingPageProps) {
  const [{ slug }, page, products, resolvedSearchParams] = await Promise.all([
    params,
    params.then(({ slug }) => getListingPageBySlug(slug)),
    getCatalogProducts(),
    searchParams,
  ]);

  if (!page) {
    notFound();
  }

  const scopedProducts = filterProductsByScope(
    products,
    page.preappliedFilters,
  );
  const listingData = getCatalogListingData({
    products: scopedProducts,
    searchParams: resolvedSearchParams,
    visibleFilterKeys: page.visibleFilterKeys,
  });

  return (
    <div className="headerClearance">
      <StoreBreadcrumbs
        items={[
          { label: "Ponuda", href: "/shop" },
          { label: page.title },
        ]}
      />
      <ProductBrowser
        clearHref={`/shop/${slug}`}
        description={page.description ?? undefined}
        title={page.title}
        activeFilters={listingData.activeFilters}
        products={listingData.products}
        filterGroups={listingData.filterGroups}
        pagination={listingData.pagination}
        searchQuery={listingData.searchQuery}
      />
    </div>
  );
}
