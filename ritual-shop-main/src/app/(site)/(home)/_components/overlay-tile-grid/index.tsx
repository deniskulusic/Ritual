import Image from "next/image";

import { ResolvedLink } from "../../../_components/resolved-link";
import { ScrollReveal } from "../scroll-reveal";
import styles from "./overlay-tile-grid.module.css";

type OverlayTileGridProps = {
  section: {
    browseLabel: string;
    browseLink: null | {
      href: string;
      kind: "internal" | "external";
      label: string;
      openInNewTab: boolean;
    };
    items: {
      backgroundImage: {
        alt: string;
        src: string;
      };
      label: string;
      link: {
        href: string;
        kind: "internal" | "external";
        label: string;
        openInNewTab: boolean;
      };
    }[];
    title: string;
  };
};

export function OverlayTileGrid({ section }: OverlayTileGridProps) {
  return (
    <section className={styles.section}>
      <div className={styles.headerWrap}>
        <div className={styles.header}>
          <h2>{section.title}</h2>
          {section.browseLink ? (
            <ResolvedLink link={section.browseLink} className={styles.link}>
              <span>{section.browseLabel}</span>
              <Image
                src="/ritual/icons/explore-arrow.svg"
                alt=""
                aria-hidden="true"
                width={11}
                height={17}
                className={styles.linkIcon}
              />
            </ResolvedLink>
          ) : null}
        </div>
      </div>
      <div className={styles.grid}>
        {section.items.map((tile, index) => (
          <ScrollReveal
            key={`${tile.label}-${tile.link.href}`}
            className={styles.tile}
            style={{ backgroundImage: `url(${tile.backgroundImage.src})` }}
            yOffset={(index % 4) * 30}
          >
            <ResolvedLink
              link={tile.link}
              style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', zIndex: 2 }}
            >
              <div className={styles.overlay} style={{ opacity: 0.35 }} />
              <h3>{tile.label}</h3>
            </ResolvedLink>
          </ScrollReveal>
        ))}
        <div className={styles.sliderPadding} aria-hidden="true" />
      </div>
    </section>
  );
}
