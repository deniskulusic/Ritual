import Image from "next/image";

import { ResolvedLink } from "../../../../_components/resolved-link";
import type { ResolvedLinkData } from "../../../../_helpers/resolve-payload-link";
import styles from "./brand-section-header.module.css";

type BrandSectionHeaderProps = {
  linkLabel: string;
  link: null | ResolvedLinkData;
  title: string;
};

export function BrandSectionHeader({ title, link, linkLabel }: BrandSectionHeaderProps) {
  return (
    <div className={styles.header}>
      <h2>{title}</h2>
      {link ? (
        <ResolvedLink link={link} className={styles.link}>
          <span>{linkLabel}</span>
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
  );
}
