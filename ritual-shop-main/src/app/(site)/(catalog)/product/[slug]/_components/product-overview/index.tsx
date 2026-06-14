import Image from "next/image";

import type { StoreProduct } from "../../../../_data/catalog-data";
import { AddToCartControls } from "./add-to-cart-controls";
import styles from "./product-overview.module.css";

type ProductOverviewProps = {
  product: StoreProduct;
};

export function ProductOverview({ product }: ProductOverviewProps) {
  const showEnrichedFacts = product.catalogReviewStatus !== "review_required";
  const badges = showEnrichedFacts ? product.editorialBadges ?? [] : [];
  const notes = showEnrichedFacts ? product.notes ?? [] : [];
  const specs = showEnrichedFacts
    ? product.specifications ?? product.additionalInfo
    : [];

  return (
    <section className={styles.product}>
      <div className={styles.imageWrap}>
        <div className={styles.imageContainer}>
          {badges.length > 0 ? (
            <div className={styles.editorialBadges} aria-label="Ključne oznake proizvoda">
              {badges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          ) : null}
          <Image src={product.image} alt={product.title} width={520} height={620} className={styles.image} />
        </div>
      </div>
      <div className={styles.details}>
        <p className={styles.brandLabel}>{product.brand}</p>
        <h1 className={styles.name}>{product.title}</h1>
        <div className={styles.priceBlock}>
          <div className={styles.priceRow}>
            <h3>{product.priceLabel}</h3>
            <div className={`${styles.status} ${product.inStock ? styles.available : styles.notAvailable}`}>
              <div />
              {product.stockLabel}
            </div>
          </div>
        </div>
        {notes.length > 0 ? (
          <div className={styles.noteChips} aria-label="Profil okusa">
            {notes.map((note) => (
              <span key={note}>{note}</span>
            ))}
          </div>
        ) : null}
        <div className={styles.purchaseArea}>
          <AddToCartControls inStock={product.inStock} productSlug={product.slug} />
        </div>
        <div className={styles.editorialInfo}>
          <section className={styles.infoSection}>
            <h2>Opis</h2>
            <div className={styles.description}>
              {product.description.map((paragraph, index) => (
                <p key={`${index}-${paragraph}`}>{paragraph}</p>
              ))}
            </div>
          </section>
          {specs.length > 0 ? (
            <section className={styles.infoSection}>
              <h2>Karakteristike</h2>
              <dl className={styles.specGrid}>
                {specs.map((item) => (
                  <div key={item.label} className={styles.specItem}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>
      </div>
    </section>
  );
}
