import Image from "next/image";
import Link from "next/link";

import type { StoreProduct } from "../../_data/catalog-data";
import styles from "./product-card.module.css";

type ProductCardProps = {
  product: StoreProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.slug}`} className={styles.card}>
      {product.badge ? <div className={styles.badge}>{product.badge}</div> : null}
      <div className={styles.body}>
        <div className={styles.imageWrap}>
          <Image src={product.image} alt={product.title} width={380} height={420} className={styles.image} />
        </div>
        <h5>{product.countryLabel}</h5>
        <h3>{product.title}</h3>
      </div>
      <h4>{product.priceLabel}</h4>
    </Link>
  );
}
