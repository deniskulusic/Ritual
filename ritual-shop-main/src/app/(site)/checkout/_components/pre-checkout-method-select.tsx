import Image from "next/image";
import Link from "next/link";

import styles from "./checkout.module.css";

const methods = [
  {
    title: "Registracija",
    subtitle: "Novi račun",
    href: "/register?checkout=1",
    label: "Registriraj se",
    image: "/ritual/images/cat-6.png",
  },
  {
    title: "Prijavi se",
    subtitle: "S korisničkim računom",
    href: "/login?checkout=1",
    label: "Prijavi se",
    image: "/ritual/images/cat-1.png",
  },
  {
    title: "Kupnja",
    subtitle: "Bez registracije",
    href: "/checkout?mode=guest",
    label: "Nastavi kao gost",
    image: "/ritual/images/cat-5.png",
  },
];

export function PreCheckoutMethodSelect() {
  return (
    <section className={styles.methodSelect}>
      <div className={styles.grid}>
        {methods.map((method) => (
          <div key={method.title} className={styles.methodCard}>
            <div className={styles.methodCardCopy}>
              <h2>{method.title}</h2>
              <h5>{method.subtitle}</h5>
            </div>
            <div className={styles.methodMedia}>
              <Image src={method.image} alt="" aria-hidden="true" width={320} height={220} />
            </div>
            <Link href={method.href} className={styles.methodAction}>
              {method.label}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
