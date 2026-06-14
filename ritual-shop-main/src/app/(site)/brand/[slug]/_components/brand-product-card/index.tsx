import Image from "next/image";
import Link from "next/link";

import type { BrandPageProduct } from "../brand-page-data";
import styles from "./brand-product-card.module.css";

type BrandProductCardProps = {
  product: BrandPageProduct;
};

export function BrandProductCard({ product }: BrandProductCardProps) {
  return (
    <article className={styles.card}>
      <Link href={product.href} className={styles.link}>
        <div>
          <div className={styles.imageWrap}>
            <Image src={product.image} alt={product.title} width={300} height={520} className={styles.image} />
          </div>
          <h5>{product.eyebrow}</h5>
          <h3>{product.title}</h3>
        </div>
        <h4>{product.priceLabel}</h4>
      </Link>
    </article>
  );
}
