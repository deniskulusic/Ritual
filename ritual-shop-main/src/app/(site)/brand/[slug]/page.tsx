import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandCta } from "./_components/brand-cta";
import { getBrandPageBySlug, getBrandPageSlugs } from "./_components/brand-page-data";
import { BrandProductSlider } from "./_components/brand-product-slider";
import { BrandTileGrid } from "./_components/brand-tile-grid";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getBrandPageSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getBrandPageBySlug(slug);

  if (!page) {
    return {
      title: "Brand | Ritual Shop",
    };
  }

  return {
    description: page.metaDescription ?? undefined,
    title: page.metaTitle ?? `${page.title} | Ritual Shop`,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const page = await getBrandPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="headerClearance">
      {page.layout.map((block) => {
        switch (block.blockType) {
          case "brand-product-slider":
            return block.section.products.length > 0 ? (
              <BrandProductSlider key={block.id} section={block.section} />
            ) : null;

          case "brand-tile-grid":
            return block.section.tiles.length > 0 ? (
              <BrandTileGrid key={block.id} section={block.section} />
            ) : null;

          case "brand-cta-banner":
            return <BrandCta key={block.id} cta={block.cta} />;
        }
      })}
    </div>
  );
}
