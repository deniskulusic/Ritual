/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import { ResolvedLink } from "../../../_components/resolved-link";
import styles from "./featured-products.module.css";

type FeaturedProductsProps = {
  section: {
    browseLabel: string;
    browseLink: null | {
      href: string;
      kind: "internal" | "external";
      label: string;
      openInNewTab: boolean;
    };
    products: {
      badge: null | string;
      categoryLabel: string;
      image: {
        alt: string;
        src: string;
      };
      priceLabel: string;
      slug: string;
      title: string;
    }[];
    title: string;
  };
};

export function FeaturedProducts({ section }: FeaturedProductsProps) {
  return (
    <section className={styles.section}>
      <div className={styles.headerWrap}>
        <div className={styles.header}>
          <h2>{section.title}</h2>
          {section.browseLink ? (
            <ResolvedLink link={section.browseLink} className={styles.exploreLink}>
              {section.browseLabel}
              <img src="/ritual/icons/explore-arrow.svg" alt="" aria-hidden="true" />
            </ResolvedLink>
          ) : null}
        </div>
      </div>
      <div className={styles.gridWrap}>
        <div className={styles.grid}>
          {section.products.map((product) => (
            <article key={product.slug} className={styles.card}>
              {product.badge ? <div className={styles.badge}>{product.badge}</div> : null}
              <Link href={`/product/${product.slug}`} className={styles.cardLink}>
                <div>
                  <div className={styles.imageWrap}>
                    <img src={product.image.src} alt={product.image.alt} />
                  </div>
                  <h5>{product.categoryLabel}</h5>
                  <h3>{product.title}</h3>
                </div>
                <h4>{product.priceLabel}</h4>
              </Link>
            </article>
          ))}
          <div className={styles.sliderPadding} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
