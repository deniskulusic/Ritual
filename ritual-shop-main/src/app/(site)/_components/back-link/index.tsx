import Image from "next/image";
import Link from "next/link";

import styles from "./back-link.module.css";

type BackLinkProps = {
  href: string;
  label: string;
};

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <section className={styles.backTo}>
      <div>
        <Image src="/ritual/icons/back-to.svg" alt="" aria-hidden="true" width={14} height={12} />
        <Link href={href}>
          <h4>{label}</h4>
        </Link>
      </div>
    </section>
  );
}
