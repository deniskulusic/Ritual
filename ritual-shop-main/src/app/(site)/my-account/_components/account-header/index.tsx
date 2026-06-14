import Link from "next/link";

import { StoreBreadcrumbs } from "../../../_components/store-breadcrumbs";
import styles from "./account-header.module.css";

type AccountHeaderProps = {
  title: string;
  description?: string;
  isRoot?: boolean;
};

export function AccountHeader({
  title,
  description,
  isRoot = false,
}: AccountHeaderProps) {
  const breadcrumbs = isRoot
    ? [{ label: "Ritual Shop", href: "/" }, { label: title }]
    : [
        { label: "Ritual Shop", href: "/" },
        { label: "Moj račun", href: "/my-account" },
        { label: title },
      ];

  return (
    <>
      <StoreBreadcrumbs items={breadcrumbs} />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroRow}>
            <div className={styles.header}>
              <h1>{title}</h1>
              {description ? <p>{description}</p> : null}
            </div>
            <Link href="/login" className={styles.logoutButton}>
              Odjava
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
