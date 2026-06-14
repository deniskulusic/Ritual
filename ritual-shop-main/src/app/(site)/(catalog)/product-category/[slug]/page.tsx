import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  type CatalogListingSearchParams,
  getCatalogActiveCategories,
  getCategoryPageCatalogData,
} from "../../_data/catalog-page-data";
import { ProductBrowser } from "../../_components/product-browser";
import { CategoryExplorer } from "../../_components/category-explorer";
import { SupportCta } from "../../../_components/support-cta";
import { StoreBreadcrumbs } from "../../../_components/store-breadcrumbs";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogListingSearchParams>;
};

export async function generateStaticParams() {
  const categories = await getCatalogActiveCategories();

  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pageData = await getCategoryPageCatalogData(slug);

  if (!pageData) {
    return {
      title: "Ponuda | Ritual Shop",
    };
  }

  return {
    title: `${pageData.category.name} | Ritual Shop`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const pageData = await getCategoryPageCatalogData(slug, resolvedSearchParams);

  if (!pageData) {
    notFound();
  }

  const {
    activeFilters,
    categories,
    category,
    filterGroups,
    pagination,
    products,
  } = pageData;
  const supportCta = category.supportCta ?? {
    title: "Trebate pomoć pri odabiru proizvoda?",
    description:
      "Privremeni CTA blok prati postojeći WordPress raspored i ostaje spreman za kasnije CMS povezivanje.",
    href: "/shop",
    label: "Pogledaj ponudu",
    image: "/ritual/images/have-questions.png",
  };

  return (
    <div className="headerClearance">
      <StoreBreadcrumbs
        items={[
          { label: "Ponuda", href: "/shop" },
          { label: category.name },
        ]}
      />

      <ProductBrowser
        title={category.name}
        activeFilters={activeFilters}
        products={products}
        filterGroups={filterGroups}
        pagination={pagination}
      />

      <CategoryExplorer categories={categories} />

      <SupportCta
        title={supportCta.title}
        description={supportCta.description}
        href={supportCta.href}
        label={supportCta.label}
        image={supportCta.image}
      />
    </div>
  );
}
