import Image from "next/image";

import { ProductCard } from "../../../../_components/product-card";
import type { StoreProduct } from "../../../../_data/catalog-data";
import styles from "./related-products.module.css";

type RelatedProductsProps = {
  title: string;
  products: StoreProduct[];
};

export function RelatedProducts({ title, products }: RelatedProductsProps) {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <h2>{title}</h2>
        <h3>
          Pogledaj sve
          <Image src="/ritual/icons/explore-arrow.svg" alt="" aria-hidden="true" width={12} height={10} />
        </h3>
      </div>
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
