/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsletterSignup } from "../../_components/newsletter-signup";
import { SectionHeading } from "../../_components/section-heading";
import { StoreBreadcrumbs } from "../../_components/store-breadcrumbs";
import { BlogCard } from "../_components/blog-card";
import { getBlogPostBySlug, getBlogPostSlugs } from "../_components/blog-page-data";
import styles from "./page.module.css";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog | Ritual Shop",
    };
  }

  return {
    title: post.metaTitle ?? `${post.title} | Ritual Shop`,
    description: post.metaDescription ?? post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="headerClearance">
      <StoreBreadcrumbs
        items={[
          { label: "Ritual Shop", href: "/" },
          { label: "Blog", href: "/blogs" },
          { label: post.title },
        ]}
      />

      <section className={styles.hero}>
        <div className={styles.heroIntro}>
          <div className={styles.meta}>
            <span>{post.publishedAt}</span>
            <span>{post.readingTime}</span>
          </div>
          <h1>{post.title}</h1>
          <p className={styles.excerpt}>{post.excerpt}</p>
        </div>
        <div className={styles.heroMediaWrap}>
          <div className={styles.heroFlags}>
            <span className={styles.heroFlag}>{post.heroBadges.primaryLabel}</span>
            <span className={styles.heroStamp}>{post.heroBadges.stampLabel}</span>
          </div>
          <div className={styles.heroMedia}>
            <img src={post.image.src} alt={post.image.alt} className={styles.heroImage} />
          </div>
        </div>
      </section>

      <section className={styles.articleSection}>
        <div className={styles.articleBody}>
          {post.sections.map((section) => (
            section.blockType === "callout-block" ? (
              <aside key={section.id} className={styles.calloutBlock}>
                {section.content}
              </aside>
            ) : (
              <section key={section.id} className={styles.contentBlock}>
                <header className={styles.contentHeader}>
                  <h2>{section.title}</h2>
                </header>
                {section.image ? (
                  <figure className={styles.figure}>
                    <img src={section.image.src} alt={section.image.alt} />
                    {section.caption ? <figcaption>{section.caption}</figcaption> : null}
                  </figure>
                ) : null}
                <div className={styles.contentBody}>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            )
          ))}
        </div>
      </section>

      {post.relatedPosts.length > 0 ? (
        <section className={styles.relatedSection}>
          <div className={styles.relatedHeader}>
            <div className={styles.relatedHeadingBlock}>
              <SectionHeading
                eyebrow={post.relatedHeading.eyebrow ?? "Dalje čitati"}
                title={post.relatedHeading.title}
              />
            </div>
          </div>
          <div className={styles.relatedGrid}>
            {post.relatedPosts.map((relatedPost) => (
              <BlogCard key={relatedPost.slug} post={relatedPost} compact />
            ))}
          </div>
        </section>
      ) : null}

      <NewsletterSignup />
    </div>
  );
}
