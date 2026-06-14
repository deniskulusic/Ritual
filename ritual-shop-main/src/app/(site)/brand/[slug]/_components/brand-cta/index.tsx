import { ResolvedLink } from "../../../../_components/resolved-link";
import type { BrandPageCta } from "../brand-page-data";
import styles from "./brand-cta.module.css";

type BrandCtaProps = {
  cta: BrandPageCta;
};

export function BrandCta({ cta }: BrandCtaProps) {
  return (
    <section className={styles.section}>
      <div className={styles.visual} style={cta.image ? { backgroundImage: `url(${cta.image})` } : undefined}>
        <div className={styles.overlay} />
        <div className={styles.content}>
          <h3>{cta.title}</h3>
          <p>{cta.subtitle}</p>
          {cta.actionLink && cta.actionLabel ? (
            <ResolvedLink link={cta.actionLink}>{cta.actionLabel}</ResolvedLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
