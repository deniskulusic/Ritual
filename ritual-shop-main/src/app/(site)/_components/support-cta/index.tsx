import Link from "next/link";

import styles from "./support-cta.module.css";

type SupportCtaProps = {
  title: string;
  description: string;
  href: string;
  label: string;
  image: string;
};

export function SupportCta({ title, description, href, label, image }: SupportCtaProps) {
  return (
    <section className={styles.section}>
      <div className={styles.visual} style={{ backgroundImage: `url(${image})` }}>
        <div className={styles.overlay} />
        <div className={styles.content}>
          <h3>{title}</h3>
          <p>{description}</p>
          <Link href={href}>{label}</Link>
        </div>
      </div>
    </section>
  );
}
