/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import { ResolvedLink } from "../../../_components/resolved-link";
import { SectionHeading } from "../../../_components/section-heading";
import styles from "./office-shop.module.css";

type OfficeShopProps = {
  section: {
    eyebrow?: null | string;
    featureCard: {
      backgroundImage: {
        alt: string;
        src: string;
      };
      eyebrow?: null | string;
      link: null | {
        href: string;
        kind: "internal" | "external";
        label: string;
        openInNewTab: boolean;
      };
      linkLabel: string;
      title: string;
    };
    products: {
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

export function OfficeShop({ section }: OfficeShopProps) {
  return (
    <section id="home-shop-grid" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.headingWrap}>
          <SectionHeading eyebrow={section.eyebrow} title={section.title} align="center" />
        </div>
        <div className={styles.layout}>
          <div className={styles.feature}>
            <div
              className={styles.featureBackground}
              style={{ backgroundImage: `url(${section.featureCard.backgroundImage.src})` }}
            />
            <div className={styles.featureContent}>
              {section.featureCard.eyebrow ? (
                <div className={styles.featureEyebrow}>{section.featureCard.eyebrow}</div>
              ) : null}
              <h2>{section.featureCard.title}</h2>
              {section.featureCard.link ? (
                <ResolvedLink link={section.featureCard.link} className={styles.featureButton}>
                  {section.featureCard.linkLabel}
                </ResolvedLink>
              ) : null}
            </div>
          </div>
          <div className={styles.products}>
            {section.products.map((product) => (
              <Link key={product.slug} href={`/product/${product.slug}`} className={styles.productCard}>
                <div className={styles.productImageWrap}>
                  <img src={product.image.src} alt={product.image.alt} />
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.productCountry}>{product.categoryLabel}</div>
                  <h3>{product.title}</h3>
                  <p>{product.priceLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
