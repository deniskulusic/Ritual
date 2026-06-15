/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import Link from "next/link";

import { NewsletterSignup } from "../_components/newsletter-signup";
import { ScrollAnimation } from "../_components/scroll-animation";
import { SectionHeading } from "../_components/section-heading";
import { StoreBreadcrumbs } from "../_components/store-breadcrumbs";
import { BlogCard } from "./_components/blog-card";
import { getBlogPageData } from "./_components/blog-page-data";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getBlogPageData();

  return {
    title: page.metaTitle ?? "Blog | Ritual Shop",
    description: page.metaDescription ?? undefined,
  };
}

export default async function BlogsPage() {
  const page = await getBlogPageData();
  const featuredPosts = page.featuredPosts.slice(0, 2);
  const remainingPosts = [...page.featuredPosts.slice(2), ...page.recentPosts];

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <div className="headerClearance">
      <StoreBreadcrumbs items={[{ label: "Ritual Shop", href: "/" }, { label: "Blog" }]} />

      <section className={styles.introSection}>
        <div className={styles.introCopy}>
          {page.intro.eyebrow ? <p className={styles.eyebrow}>{page.intro.eyebrow}</p> : null}
          <h1>{page.intro.title}</h1>
        </div>
      </section>

      <div className={styles.featuredWrap}>
        {featuredPosts.map((post, index) => {
          const reverse = index % 2 === 1;

          return (
            <section
              key={post.slug}
              className={[styles.featuredSection, reverse ? styles.reverse : ""].filter(Boolean).join(" ")}
            >
              {!reverse ? (
                <>
                  <ScrollAnimation
                    mode="scaleTranslate"
                    initialScale={1.1}
                    translateRange={150}
                    className={styles.featuredMedia}
                  >
                    <img src={post.image.src} alt={post.image.alt} className={styles.coverImage} />
                  </ScrollAnimation>
                  <div className={styles.featuredGap} />
                  <div className={styles.featuredCopy}>
                    <div className={styles.meta}>
                      <span>{post.category}</span>
                      <span>{post.publishedAt}</span>
                      <span>{post.readingTime}</span>
                    </div>
                    <h2>{post.title}</h2>
                    <p className={styles.featuredExcerpt}>{post.excerpt}</p>
                    <Link href={`/blogs/${post.slug}`} className={styles.primaryLink}>
                      {post.ctaLabel}
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.featuredCopy}>
                    <div className={styles.meta}>
                      <span>{post.category}</span>
                      <span>{post.publishedAt}</span>
                      <span>{post.readingTime}</span>
                    </div>
                    <h2>{post.title}</h2>
                    <p className={styles.featuredExcerpt}>{post.excerpt}</p>
                    <Link href={`/blogs/${post.slug}`} className={styles.primaryLink}>
                      {post.ctaLabel}
                    </Link>
                  </div>
                  <div className={styles.featuredGap} />
                  <ScrollAnimation
                    mode="scaleTranslate"
                    initialScale={1.1}
                    translateRange={150}
                    className={styles.featuredMedia}
                  >
                    <img src={post.image.src} alt={post.image.alt} className={styles.coverImage} />
                  </ScrollAnimation>
                </>
              )}
            </section>
          );
        })}
      </div>

      <section className={styles.listSection}>
        <div className={styles.listIntro}>
          <div className={styles.listHeading}>
            <SectionHeading
              eyebrow={page.latestHeading.eyebrow}
              title={page.latestHeading.title}
            />
          </div>
          {page.latestHeading.description ? (
            <p className={styles.listDescription}>{page.latestHeading.description}</p>
          ) : null}
        </div>
        <div className={styles.grid}>
          {remainingPosts.map((post, index) => (
            <BlogCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      </section>

      <NewsletterSignup />
    </div>
  );
}
