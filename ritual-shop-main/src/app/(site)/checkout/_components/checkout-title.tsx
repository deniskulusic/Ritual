import styles from "./checkout.module.css";

type CheckoutTitleProps = {
  description?: string;
};

export function CheckoutTitle({
  description = "Pregledajte podatke i dovršite narudžbu.",
}: CheckoutTitleProps) {
  return (
    <section className={styles.checkoutTitle}>
      <div className={styles.checkoutTitleInner}>
        <h1>Plaćanje</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
