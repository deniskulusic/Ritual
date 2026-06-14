/* eslint-disable @next/next/no-img-element */

import { ResolvedLink } from "../../../_components/resolved-link";
import { SectionHeading } from "../../../_components/section-heading";
import { ScrollReveal } from "../scroll-reveal";
import styles from "./product-categories.module.css";

const cardClassNames = [
  styles.cat1,
  styles.cat2,
  styles.cat3,
  styles.cat4,
  styles.cat5,
  styles.cat6,
];

type ProductCategoriesProps = {
  section: {
    browseLabel: string;
    browseLink: null | {
      href: string;
      kind: "internal" | "external";
      label: string;
      openInNewTab: boolean;
    };
    eyebrow?: null | string;
    items: {
      backgroundImage: {
        alt: string;
        src: string;
      };
      link: {
        href: string;
        kind: "internal" | "external";
        label: string;
        openInNewTab: boolean;
      };
      name: string;
      productImage: {
        alt: string;
        src: string;
      };
    }[];
    title: string;
  };
};

export function ProductCategories({ section }: ProductCategoriesProps) {
  return (
    <section className={styles.section}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} align="center" />
      <div className={styles.grid}>
        {section.items.map((category, index) => {
          const gridClass = cardClassNames[index] ?? styles.cat6;
          
          // Map the index to the requested multiplier:
          // Top 3 (index 0, 1, 2) -> 0, 1, 2
          // Fourth (index 3) -> 0
          // Bottom 3 (index 4, 5) -> 0, 1
          const multiplierMap = [0, 1, 2, 2, 0, 1];
          const multiplier = multiplierMap[index] ?? 0;

          return (
            <ScrollReveal key={`${category.name}-${category.link.href}`} className={gridClass} yOffset={multiplier * 30}>
              <ResolvedLink
                link={category.link}
                className={styles.card}
                style={{ backgroundImage: `url(${category.backgroundImage.src})`, height: '100%', width: '100%' }}
              >
                <div className={styles.overlay} style={{ opacity: 0.3 }} />
                <h3>{category.name}</h3>
                <div className={styles.imageWrap}>
                  <img src={category.productImage.src} alt={category.productImage.alt} />
                </div>
              </ResolvedLink>
            </ScrollReveal>
          );
        })}
        {section.browseLink ? (
          // The third element of the bottom row gets a multiplier of 2 (2 * 30 = 60)
          <ScrollReveal className={styles.exploreAll} yOffset={2 * 30}>
            <ResolvedLink link={section.browseLink} style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', height: '100%', width: '100%', gap: '10px' }}>
              {section.browseLabel}
              <img src="/ritual/icons/explore-arrow.svg" alt="" aria-hidden="true" />
            </ResolvedLink>
          </ScrollReveal>
        ) : null}
      </div>
    </section>
  );
}
