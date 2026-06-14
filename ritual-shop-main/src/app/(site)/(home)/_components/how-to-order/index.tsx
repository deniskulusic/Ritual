import { ScrollAnimation } from "../../../_components/scroll-animation";
import { SectionHeading } from "../../../_components/section-heading";
import styles from "./how-to-order.module.css";

type HowToOrderProps = {
  section: {
    eyebrow?: null | string;
    steps: {
      image: {
        alt: string;
        src: string;
      };
      title: string;
    }[];
    title: string;
  };
};

export function HowToOrder({ section }: HowToOrderProps) {
  return (
    <section className={styles.section}>
      <SectionHeading eyebrow={section.eyebrow} title={section.title} align="center" />
      <div className={styles.grid}>
        {section.steps.map((step, index) => {
          const factors = [-0.06, 0.02, -0.04];
          const factor = factors[index] || 0;

          return (
            <ScrollAnimation
              key={step.title}
              mode="parallax"
              factor={factor}
              className={styles.cardWrapper}
            >
              <article className={styles.card}>
                <picture className={styles.media}>
                  <img src={step.image.src} alt={step.image.alt} />
                </picture>
                <h4>{step.title}</h4>
              </article>
            </ScrollAnimation>
          );
        })}
      </div>
    </section>
  );
}
