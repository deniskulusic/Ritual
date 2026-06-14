/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import styles from "./not-found-view.module.css";

type NotFoundViewProps = {
  includeHeaderClearance?: boolean;
};

export function NotFoundView({
  includeHeaderClearance = true,
}: NotFoundViewProps) {
  return (
    <div className={includeHeaderClearance ? `headerClearance ${styles.page}` : styles.page}>
      <Link href="/" className={styles.logoLink} aria-label="Ritual Shop naslovnica">
        <img className={styles.logo} src="/ritual/uploads/ritual-logo.png" alt="Ritual Shop" />
      </Link>
      <div className={styles.grid}>
        <div className={styles.visualContainer} />
        <div className={styles.textWrap}>
          <h1>Ova stranica ne postoji</h1>
          <h3>Imamo nešto bolje za vas...</h3>
          <Link href="/shop" className={styles.cta}>
            Ponuda
          </Link>
        </div>
      </div>
    </div>
  );
}
