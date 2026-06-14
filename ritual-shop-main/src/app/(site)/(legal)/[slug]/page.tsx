import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocument } from "../_components/legal-document";
import { getLegalPageBySlug, getLegalPageSlugs } from "../_data/legal-page-data";

type LegalPageRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getLegalPageSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: LegalPageRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegalPageBySlug(slug);

  if (!page) {
    return {};
  }

  return {
    description: page.metaDescription ?? undefined,
    title: page.metaTitle ?? `Ritual Shop | ${page.title}`,
  };
}

export default async function LegalPageRoute({ params }: LegalPageRouteProps) {
  const { slug } = await params;
  const page = await getLegalPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <LegalDocument page={page} />;
}
