import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryExplorer } from "../../_components/category-explorer";
import {
  getCatalogActiveCategories,
  getCatalogProductBySlug,
  getCatalogProducts,
  getRelatedCatalogProducts,
} from "../../_data/catalog-page-data";
import { StoreBreadcrumbs } from "../../../_components/store-breadcrumbs";
import { ProductOverview } from "./_components/product-overview";
import { RelatedProducts } from "./_components/related-products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getCatalogProducts();

  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    return {
      title: "Proizvod | Ritual Shop",
    };
  }

  return {
    description: product.description[0],
    title: `${product.title} | Ritual Shop`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([
    getCatalogProductBySlug(slug),
    getCatalogActiveCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedCatalogProducts(product);

  return (
    <div className="headerClearance">
      <StoreBreadcrumbs
        items={[
          { label: "Ponuda", href: "/shop" },
          { label: product.brand, href: product.brandSlug ? `/brand/${product.brandSlug}` : undefined },
          { label: product.categoryName, href: `/product-category/${product.categorySlug}` },
          { label: product.title },
        ]}
      />
      <ProductOverview product={product} />
      <RelatedProducts title={`Ostali ${product.categoryName.toLowerCase()}`} products={relatedProducts} />
      <CategoryExplorer categories={categories} />
    </div>
  );
}
