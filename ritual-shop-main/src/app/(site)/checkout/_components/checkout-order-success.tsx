import Link from "next/link";

import styles from "./checkout.module.css";

type CheckoutOrderSuccessProps = {
  orderNumber: string;
  showOrdersLink?: boolean;
};

export function CheckoutOrderSuccess({ orderNumber, showOrdersLink = false }: CheckoutOrderSuccessProps) {
  return (
    <section className={styles.checkoutSuccess}>
      <div className={styles.checkoutSuccessCard}>
        <p className={styles.checkoutSuccessEyebrow}>Narudžba zaprimljena</p>
        <h2>Hvala. Vaša narudžba je uspješno kreirana.</h2>
        <p className={styles.checkoutSuccessText}>
          Broj narudžbe: <strong>{orderNumber}</strong>
        </p>
        <p className={styles.checkoutSuccessText}>
          Pošiljku ćemo prijaviti odabranom dostavljaču kada narudžba prijeđe u obradu.
        </p>
        <div className={styles.checkoutSuccessActions}>
          <Link href="/shop" className={styles.secondaryButton}>
            Nastavi kupnju
          </Link>
          {showOrdersLink ? (
            <Link href="/my-account/orders" className={styles.primaryButton}>
              Moje narudžbe
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
