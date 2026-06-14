import Image from "next/image";
import Link from "next/link";

import type { StoreCategory } from "../../_data/catalog-data";
import styles from "./category-card.module.css";

type CategoryCardProps = {
  category: StoreCategory;
  trailing?: boolean;
};

export function CategoryCard({ category, trailing = false }: CategoryCardProps) {
  return (
    <Link href={`/product-category/${category.slug}`} className={`${styles.card} ${trailing ? styles.trailing : ""}`}>
      <div className={styles.visual} style={{ backgroundImage: `url(${category.backgroundImage})` }}>
        <div className={styles.overlay} style={{ opacity: category.overlayOpacity }} />
        <div className={styles.imageWrap}>
          <Image src={category.image} alt={category.name} width={220} height={260} className={styles.image} />
        </div>
        <h3>{category.name}</h3>
      </div>
    </Link>
  );
}
