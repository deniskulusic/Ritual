/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsletterSignup } from "../../_components/newsletter-signup";
import { SectionHeading } from "../../_components/section-heading";
import { StoreBreadcrumbs } from "../../_components/store-breadcrumbs";
import { getCatalogProducts } from "../../(catalog)/_data/catalog-page-data";
import type { StoreProduct } from "../../(catalog)/_data/catalog-data";
import { RelatedProducts } from "../../(catalog)/product/[slug]/_components/related-products";
import { BlogCard } from "../../blogs/_components/blog-card";
import { getBlogPageData } from "../../blogs/_components/blog-page-data";
import { getRecipePageBySlug, getRecipePageSlugs } from "../_components/recipe-page-data";
import styles from "./page.module.css";

type RecipePageProps = {
  params: Promise<{ slug: string }>;
};

function pickPlaceholderProducts(products: StoreProduct[], limit = 4) {
  if (products.length <= limit) {
    return products;
  }

  const selected: StoreProduct[] = [];
  const usedIndexes = new Set<number>();
  const step = (products.length - 1) / (limit - 1);

  for (let index = 0; index < limit; index += 1) {
    const candidateIndex = Math.round(index * step);

    if (!usedIndexes.has(candidateIndex)) {
      selected.push(products[candidateIndex]);
      usedIndexes.add(candidateIndex);
    }
  }

  for (const [index, product] of products.entries()) {
    if (selected.length >= limit) {
      break;
    }

    if (usedIndexes.has(index)) {
      continue;
    }

    selected.push(product);
    usedIndexes.add(index);
  }

  return selected;
}

export async function generateStaticParams() {
  const slugs = await getRecipePageSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipePageBySlug(slug);

  if (!recipe) {
    return {
      title: "Recepti | Ritual Shop",
    };
  }

  return {
    title: recipe.metaTitle ?? `${recipe.title} | Ritual Shop`,
    description: recipe.metaDescription,
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const [recipe, blogPage, catalogProducts] = await Promise.all([
    getRecipePageBySlug(slug),
    getBlogPageData(),
    getCatalogProducts(),
  ]);

  if (!recipe) {
    notFound();
  }

  const placeholderProducts = pickPlaceholderProducts(catalogProducts);
  const relatedStories = blogPage.recentPosts.slice(0, 3);

  return (
    <div className="headerClearance">
      <StoreBreadcrumbs
        items={[
          { label: "Ritual Shop", href: "/" },
          { label: "Recepti" },
          { label: recipe.title },
        ]}
      />

      <section className={styles.hero}>
        <div className={styles.heroIntro}>
          <div className={styles.meta}>
            <span>{recipe.typeLabel}</span>
            <span>{recipe.prepTime}</span>
            <span>{recipe.servings}</span>
          </div>
          <h1>{recipe.title}</h1>
          <p className={styles.excerpt}>{recipe.excerpt}</p>
        </div>
      </section>

      <section className={[styles.recipeSection, styles.firstSection].join(" ")}>
        <div className={styles.recipeMedia}>
          <img src={recipe.heroImage.src} alt={recipe.heroImage.alt} className={styles.sectionImage} />
        </div>
        <div className={styles.recipeGap} />
        <div className={styles.recipeContent}>
          <h2>Što trebaš</h2>

          <p className={styles.supportingLine}>
            Kratak popis ostaje namjerno jednostavan kako bi priprema bila brza i bez viška odluka.
          </p>

          <ul className={styles.ingredientList}>
            {recipe.ingredients.flatMap((group) => group.items).map((ingredient) => (
              <li key={`${ingredient.amount}-${ingredient.name}`}>
                <span>{ingredient.amount}</span> {ingredient.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={[styles.recipeSection, styles.reverse].join(" ")}>
        <div className={styles.recipeContent}>
          <h2>Kako napraviti</h2>

          <ol className={styles.simpleSteps}>
            {recipe.steps.map((step) => (
              <li key={step.title}>{step.body}</li>
            ))}
          </ol>

          {recipe.notes[0] ? <p className={styles.tipLine}>{recipe.notes[0].body}</p> : null}
        </div>
        <div className={styles.recipeGap} />
        <div className={styles.recipeMedia}>
          <img src={recipe.stepsImage.src} alt={recipe.stepsImage.alt} className={styles.sectionImage} />
        </div>
      </section>

      {placeholderProducts.length > 0 ? (
        <RelatedProducts title="Izdvojeno iz ponude" products={placeholderProducts} />
      ) : null}

      {relatedStories.length > 0 ? (
        <section className={styles.relatedSection}>
          <div className={styles.relatedHeader}>
            <SectionHeading
              eyebrow={recipe.relatedHeading.eyebrow}
              title={recipe.relatedHeading.title}
            />
          </div>
          <div className={styles.relatedGrid}>
            {relatedStories.map((story) => (
              <BlogCard key={story.slug} post={story} />
            ))}
          </div>
        </section>
      ) : null}

      <NewsletterSignup />
    </div>
  );
}
