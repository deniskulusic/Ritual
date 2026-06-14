import styles from "./checkout.module.css";

export function CheckoutLoadingOverlay() {
  return (
    <div className={styles.overlaySpinner}>
      <div className={styles.cvSpinner}>
        <span className={styles.spinner} />
      </div>
    </div>
  );
}
