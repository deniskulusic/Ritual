import Link from "next/link";

import { SectionHeading } from "../../../_components/section-heading";
import type { StoreCategory } from "../../_data/catalog-data";
import { CategoryCard } from "../category-card";
import styles from "./category-explorer.module.css";

type CategoryExplorerProps = {
  categories: StoreCategory[];
  className?: string;
};

export function CategoryExplorer({ categories, className = "" }: CategoryExplorerProps) {
  return (
    <section className={`${styles.section} ${className}`.trim()}>
      <SectionHeading eyebrow="Istražite ponudu" title="Kategorije" align="center" />
      <div className={styles.grid}>
        {categories.map((category, index) => (
          <CategoryCard
            key={category.slug}
            category={category}
            trailing={index === categories.length - 1}
          />
        ))}
      </div>
      <div className={styles.ctaWrap}>
        <Link href="/shop" className={styles.cta}>Pogledaj sve</Link>
      </div>
    </section>
  );
}
