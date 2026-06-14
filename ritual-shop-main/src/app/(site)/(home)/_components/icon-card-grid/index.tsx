/* eslint-disable @next/next/no-img-element */

import { ScrollAnimation } from "../../../_components/scroll-animation";
import { SectionHeading } from "../../../_components/section-heading";
import styles from "./icon-card-grid.module.css";

type IconCardGridProps = {
  section: {
    eyebrow?: null | string;
    items: {
      icon: {
        alt: string;
        src: string;
      };
      title: string;
    }[];
    title: string;
  };
};

export function IconCardGrid({ section }: IconCardGridProps) {
  return (
    <section className={styles.section}>
      <div className={styles.topClip} />
      <div className={styles.gridWrap}>
        <div className={styles.grid}>
          <div className={styles.leftCol}>
            <SectionHeading  eyebrow={section.eyebrow} title={section.title} light align="left" />
            <p className={styles.description}>
              &quot;Adriatic Sense 1&quot; is designed for those who value independence. Supported by solar panels, a generator, and a watermaker, you are free from the need to dock in crowded marinas.
              <br /><br />
              Whether you are seeking adventure or pure relaxation, the yacht is equipped with air-conditioning and heating for all seasons. Located in Marina Kremik, Primošten, it is your perfect gateway to the Kornati islands and Vis archipelago.
            </p>
          </div>
          <ScrollAnimation mode="parallax" factor={-0.04} className={`${styles.cardColWrapper} ${styles.cardColFirst}`}>
            <div className={styles.cardColInner}>
              {section.items.slice(0, 2).map((item) => (
                <article key={item.title} className={styles.card}>
                  <img src={item.icon.src} alt={item.icon.alt} />
                  <h4>{item.title}</h4>
                </article>
              ))}
            </div>
          </ScrollAnimation>
          <ScrollAnimation mode="parallax" factor={0.14} className={`${styles.cardColWrapper} ${styles.cardColOffset}`}>
            <div className={styles.cardColInner}>
              {section.items.slice(2, 4).map((item) => (
                <article key={item.title} className={styles.card}>
                  <img src={item.icon.src} alt={item.icon.alt} />
                  <h4>{item.title}</h4>
                </article>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
