/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import type { FooterData } from "./data";
import { ResolvedLink } from "../resolved-link";
import styles from "./footer.module.css";

type FooterProps = {
  footer: FooterData;
};

export function Footer({ footer }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerLogoWrap}>
          <Link href="/" aria-label="Ritual Shop naslovnica">
            <img className={styles.footerLogo} src="/ritual/uploads/ritual-logo.png" alt="Ritual Shop" />
          </Link>
        </div>
        <div className={styles.footerContent}>
          <div className={styles.footerNav}>
            <ul>
              {footer.topNavLinks.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <ResolvedLink link={item} />
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.footerLinks}>
            {footer.linkColumns.map((column, columnIndex) => (
              <div key={`footer-column-${columnIndex}`}>
                {column.map((item) => (
                  <ResolvedLink key={`${item.href}-${item.label}`} link={item} />
                ))}
              </div>
            ))}
          </div>
          <div className={styles.footerCopy}>
            <p>{footer.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
