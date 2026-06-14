import { ResolvedLink } from "../resolved-link";
import styles from "./newsletter-signup.module.css";

type NewsletterSignupProps = {
  content?: {
    disclaimerLink?: null | {
      href: string;
      kind: "internal" | "external";
      label: string;
      openInNewTab: boolean;
    };
    disclaimerLinkLabel?: string;
    disclaimerText?: string;
    emailPlaceholder?: string;
    eyebrow?: null | string;
    submitLabel?: string;
    title?: string;
  };
};

const defaultContent = {
  disclaimerLink: null,
  disclaimerLinkLabel: "Datenschutzrichtlinie",
  disclaimerText: "Unsere",
  emailPlaceholder: "Unesite svoju e-mail adresu",
  eyebrow: "Newsletter",
  submitLabel: "Pošalji",
  title: "Prijavi se za novosti i posebne ponude",
};

export function NewsletterSignup({ content }: NewsletterSignupProps) {
  const resolvedContent = {
    ...defaultContent,
    ...content,
  };

  return (
    <section className={styles.section}>
      <div className={styles.topClip} />
      <div className={styles.inner}>
        <div className={styles.innerWrapper} >
        <div className={styles.heading}>
          {resolvedContent.eyebrow ? <h3>{resolvedContent.eyebrow}</h3> : null}
          <h2>{resolvedContent.title}</h2>
        </div>
        <div className={styles.formWrapper}>
          <form className={styles.form} action="#">
            <input type="email" placeholder={resolvedContent.emailPlaceholder} />
            <button type="submit">{resolvedContent.submitLabel}</button>
          </form>
          <p className={styles.description}>
            {resolvedContent.disclaimerText}{" "}
            {resolvedContent.disclaimerLink ? (
              <ResolvedLink link={resolvedContent.disclaimerLink}>
                {resolvedContent.disclaimerLinkLabel}
              </ResolvedLink>
            ) : (
              <span>{resolvedContent.disclaimerLinkLabel}</span>
            )}
          </p>
        </div>
        </div>
        <div className={styles.bottomClip} />
      </div>
      
    </section>
  );
}
