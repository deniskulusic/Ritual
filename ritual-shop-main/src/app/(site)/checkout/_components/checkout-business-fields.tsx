"use client";

import type { CheckoutAddressInput } from "@/payload/collections/carts/contracts";

import styles from "./checkout.module.css";

type CheckoutBusinessFieldsProps = {
  address: Pick<CheckoutAddressInput, "company" | "isBusiness" | "taxId">;
  onChange: (field: "company" | "isBusiness" | "taxId", value: boolean | string) => void;
};

export function CheckoutBusinessFields({ address, onChange }: CheckoutBusinessFieldsProps) {
  return (
    <div className={styles.businessPanel}>
      <div className={styles.businessPanelHeader}>
        <h3 className={styles.midTitle}>Podaci za R1 račun</h3>
        <p>Ako kupujete kao tvrtka, unesite naziv tvrtke i OIB / VAT ID za izdavanje računa.</p>
      </div>
      <label className={styles.checkboxLabelWide}>
        Kupujem kao tvrtka
        <input
          type="checkbox"
          checked={!!address.isBusiness}
          onChange={(event) => onChange("isBusiness", event.target.checked)}
        />
        <span className={styles.checkboxMark} />
      </label>
      {address.isBusiness ? (
        <div className={`${styles.formGrid} ${styles.businessFields}`}>
          <input
            type="text"
            className={styles.full}
            value={address.company || ""}
            placeholder="Naziv tvrtke*"
            onChange={(event) => onChange("company", event.target.value)}
          />
          <input
            type="text"
            className={styles.full}
            value={address.taxId || ""}
            placeholder="OIB / VAT ID*"
            onChange={(event) => onChange("taxId", event.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}
