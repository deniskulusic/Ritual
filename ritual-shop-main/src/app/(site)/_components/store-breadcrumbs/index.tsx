/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import styles from "./store-breadcrumbs.module.css";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type StoreBreadcrumbsProps = {
  items: BreadcrumbItem[];
  compact?: boolean;
  tone?: "default" | "light";
};

export function StoreBreadcrumbs({ items, compact = false, tone = "default" }: StoreBreadcrumbsProps) {
  return (
    <section
      className={`${styles.breadcrumbs} ${compact ? styles.compact : ""} ${tone === "light" ? styles.light : ""}`}
    >
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className={styles.item}>
          {item.href && index < items.length - 1 ? <Link href={item.href}><h4>{item.label}</h4></Link> : <h4>{item.label}</h4>}
          {index < items.length - 1 ? <img src="/ritual/icons/back-to.svg" alt="" aria-hidden="true" /> : null}
        </div>
      ))}
    </section>
  );
}
