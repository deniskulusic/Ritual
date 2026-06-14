import { ResolvedLink } from "../../../../_components/resolved-link";
import type { BrandTileGridSection } from "../brand-page-data";
import { BrandSectionHeader } from "../brand-section-header";
import styles from "./brand-tile-grid.module.css";

type BrandTileGridProps = {
  section: BrandTileGridSection;
};

export function BrandTileGrid({ section }: BrandTileGridProps) {
  return (
    <section className={styles.section}>
      <div className={styles.headerWrap}>
        <BrandSectionHeader title={section.title} link={section.link} linkLabel={section.linkLabel} />
      </div>
      <div className={styles.grid}>
        {section.tiles.map((tile) => (
          <ResolvedLink
            key={`${section.title}-${tile.label}`}
            link={tile.link}
            className={styles.tile}
            style={{ backgroundImage: `url(${tile.backgroundImage})` }}
          >
            <div className={styles.overlay} style={{ opacity: 0.35 }} />
            <h4>{tile.label}</h4>
          </ResolvedLink>
        ))}
        <div className={styles.sliderPadding} aria-hidden="true" />
      </div>
    </section>
  );
}
