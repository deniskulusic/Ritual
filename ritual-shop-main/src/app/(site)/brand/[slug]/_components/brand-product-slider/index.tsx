import Image from "next/image";

import { ResolvedLink } from "../../../../_components/resolved-link";
import type { BrandProductSliderSection } from "../brand-page-data";
import { BrandProductCard } from "../brand-product-card";
import { BrandSectionHeader } from "../brand-section-header";
import styles from "./brand-product-slider.module.css";

type BrandProductSliderProps = {
  section: BrandProductSliderSection;
};

export function BrandProductSlider({ section }: BrandProductSliderProps) {
  return (
    <section className={styles.section}>
      <div className={styles.headerWrap}>
        <BrandSectionHeader title={section.title} link={section.link} linkLabel={section.linkLabel} />
      </div>
      <div className={styles.slider}>
        {section.visual ? (
          <div className={styles.lead}>
            <div className={styles.leadVisual} style={{ backgroundImage: `url(${section.visual.image})` }}>
              <h4>{section.visual.copy}</h4>
            </div>
          </div>
        ) : null}
        {section.products.map((product) => (
          <BrandProductCard key={`${section.title}-${product.title}`} product={product} />
        ))}
        {section.link ? (
          <ResolvedLink link={section.link} className={styles.moreCard}>
            <Image src="/ritual/icons/view-more.svg" alt="" aria-hidden="true" width={43} height={37} />
            <h4>Pogledaj više</h4>
          </ResolvedLink>
        ) : null}
        <div className={styles.sliderPadding} aria-hidden="true" />
      </div>
    </section>
  );
}
