/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ScrollReveal } from "../../../(home)/_components/scroll-reveal";

import type { BlogListItem } from "../blog-page-data";
import styles from "./blog-card.module.css";

type BlogCardProps = {
  post: BlogListItem;
  compact?: boolean;
  index?: number;
};

export function BlogCard({ post, compact = false, index = 0 }: BlogCardProps) {
  return (
    <ScrollReveal 
      className={[styles.card, compact ? styles.compact : ""].filter(Boolean).join(" ")}
      yOffset={((index+1)) * 50}
    >
      <Link href={`/blogs/${post.slug}`} className={styles.link}>
        <div className={styles.imageWrap}>
          <img src={post.image.cardSrc} alt={post.image.alt} className={styles.image} />
        </div>
        <div className={styles.body}>
          <div className={styles.meta}>
            <span>{post.category}</span>
            <span>{post.publishedAt}</span>
            <span>{post.readingTime}</span>
          </div>
          <h3>{post.title}</h3>
          <p>{post.preview}</p>
          <div className={styles.footer}>
            <span className={styles.readMore}>Pročitaj članak</span>
          </div>
        </div>
      </Link>
    </ScrollReveal>
  );
}
