import { ScrollAnimation } from "../../../_components/scroll-animation";
import { ResolvedLink } from "../../../_components/resolved-link";
import styles from "./story-pair.module.css";

type StoryPairProps = {
  section: {
    stories: {
      ctaLabel?: null | string;
      ctaLink?: null | {
        href: string;
        kind: "internal" | "external";
        label: string;
        openInNewTab: boolean;
      };
      description: string;
      eyebrow?: null | string;
      image: {
        alt: string;
        src: string;
      };
      title: string;
    }[];
  };
};

export function StoryPair({ section }: StoryPairProps) {
  return (
    <div className={styles.wrap}>
      {section.stories.map((story, index) => {
        const reverse = index % 2 === 1;

        return (
          <section
            key={story.title}
            className={[styles.section, reverse ? styles.reverse : ""].filter(Boolean).join(" ")}
          >
            {!reverse ? (
              <>
                <ScrollAnimation
                  mode="scaleTranslate"
                  initialScale={1.1}
                  translateRange={150}
                  className={styles.imageWrapper}
                >
                  <div
                    className={styles.image}
                    style={{ backgroundImage: `url(${story.image.src})` }}
                    aria-label={story.image.alt}
                  />
                </ScrollAnimation>
                <div className={styles.empty} />
                <div className={styles.content}>
                  {story.eyebrow ? <h4>{story.eyebrow}</h4> : null}
                  <h3>{story.title}</h3>
                  <p>{story.description}</p>
                  {story.ctaLink && story.ctaLabel ? (
                    <ResolvedLink link={story.ctaLink}>{story.ctaLabel}</ResolvedLink>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <div className={styles.content}>
                  {story.eyebrow ? <h4>{story.eyebrow}</h4> : null}
                  <h3>{story.title}</h3>
                  <p>{story.description}</p>
                  {story.ctaLink && story.ctaLabel ? (
                    <ResolvedLink link={story.ctaLink}>{story.ctaLabel}</ResolvedLink>
                  ) : null}
                </div>
                <div className={styles.empty} />
                <ScrollAnimation
                  mode="scaleTranslate"
                  initialScale={1.1}
                  translateRange={150}
                  className={styles.imageWrapper}
                >
                  <div
                    className={styles.image}
                    style={{ backgroundImage: `url(${story.image.src})` }}
                    aria-label={story.image.alt}
                  />
                </ScrollAnimation>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
