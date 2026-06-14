/* eslint-disable @next/next/no-img-element */

import { ResolvedLink } from "../../../_components/resolved-link";
import { SectionHeading } from "../../../_components/section-heading";
import styles from "./partners-grid.module.css";

type PartnersGridProps = {
  section: {
    eyebrow?: null | string;
    items: {
      link: null | {
        href: string;
        kind: "internal" | "external";
        label: string;
        openInNewTab: boolean;
      };
      logo: {
        alt: string;
        src: string;
      };
      title: string;
    }[];
    title: string;
  };
};

export function PartnersGrid({ section }: PartnersGridProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading eyebrow={section.eyebrow} title={section.title} light align="center" />
        <div className={styles.carouselle}>
          <article className={styles.carouselleArticle}>
            <div className={styles.carouselleTrack}>
              <ul className={styles.carouselleList}>
                {section.items.map((partner) => (
                  <li key={`${partner.title}-${partner.logo.src}`} className={styles.carouselleItem}>
                    {partner.link ? (
                      <ResolvedLink link={partner.link} className={styles.carouselleLink}>
                        <img src={partner.logo.src} alt={partner.logo.alt} />
                      </ResolvedLink>
                    ) : (
                      <img src={partner.logo.src} alt={partner.logo.alt} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.carouselleTrack}>
              <ul className={styles.carouselleList}>
                {section.items.map((partner) => (
                  <li key={`${partner.title}-${partner.logo.src}-2`} className={styles.carouselleItem}>
                    {partner.link ? (
                      <ResolvedLink link={partner.link} className={styles.carouselleLink}>
                        <img src={partner.logo.src} alt={partner.logo.alt} />
                      </ResolvedLink>
                    ) : (
                      <img src={partner.logo.src} alt={partner.logo.alt} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.carouselleTrack}>
              <ul className={styles.carouselleList}>
                {section.items.map((partner) => (
                  <li key={`${partner.title}-${partner.logo.src}-3`} className={styles.carouselleItem}>
                    {partner.link ? (
                      <ResolvedLink link={partner.link} className={styles.carouselleLink}>
                        <img src={partner.logo.src} alt={partner.logo.alt} />
                      </ResolvedLink>
                    ) : (
                      <img src={partner.logo.src} alt={partner.logo.alt} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className={`${styles.carouselleArticle} ${styles.article2}`}>
            <div className={styles.carouselleTrack}>
              <ul className={styles.carouselleList}>
                {section.items.map((partner) => (
                  <li key={`${partner.title}-${partner.logo.src}-4`} className={styles.carouselleItem}>
                    {partner.link ? (
                      <ResolvedLink link={partner.link} className={styles.carouselleLink}>
                        <img src={partner.logo.src} alt={partner.logo.alt} />
                      </ResolvedLink>
                    ) : (
                      <img src={partner.logo.src} alt={partner.logo.alt} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.carouselleTrack}>
              <ul className={styles.carouselleList}>
                {section.items.map((partner) => (
                  <li key={`${partner.title}-${partner.logo.src}-5`} className={styles.carouselleItem}>
                    {partner.link ? (
                      <ResolvedLink link={partner.link} className={styles.carouselleLink}>
                        <img src={partner.logo.src} alt={partner.logo.alt} />
                      </ResolvedLink>
                    ) : (
                      <img src={partner.logo.src} alt={partner.logo.alt} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.carouselleTrack}>
              <ul className={styles.carouselleList}>
                {section.items.map((partner) => (
                  <li key={`${partner.title}-${partner.logo.src}-6`} className={styles.carouselleItem}>
                    {partner.link ? (
                      <ResolvedLink link={partner.link} className={styles.carouselleLink}>
                        <img src={partner.logo.src} alt={partner.logo.alt} />
                      </ResolvedLink>
                    ) : (
                      <img src={partner.logo.src} alt={partner.logo.alt} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
      <div className={styles.bottomClip} />
    </section>
  );
}
