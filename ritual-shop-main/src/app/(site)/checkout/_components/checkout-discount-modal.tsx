"use client";

import { useEffect, useState } from "react";

import { useCart } from "../../_components/cart-provider";
import styles from "./checkout.module.css";

type CheckoutDiscountModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CheckoutDiscountModal({ open, onClose }: CheckoutDiscountModalProps) {
  const {
    applyPromoCode,
    isQuotePending,
    isSyncPending,
    promoCodeError,
    promotion,
    removePromoCode,
  } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const isPending = isQuotePending || isSyncPending;
  const hasPromoCode = promoCode.trim().length > 0;

  useEffect(() => {
    if (promotion?.code) {
      setPromoCode(promotion.code);
    }
  }, [promotion?.code]);

  useEffect(() => {
    if (open && !promotion?.code) {
      setPromoCode("");
    }
  }, [open, promotion?.code]);

  function handleApply() {
    if (!hasPromoCode || isPending) {
      return;
    }

    applyPromoCode(promoCode);
  }

  function handleRemove() {
    removePromoCode();
    setPromoCode("");
  }

  return (
    <div className={`${styles.discountPopup} ${open ? styles.opened : ""}`}>
      <button type="button" className={styles.overlay} onClick={onClose} aria-label="Zatvori" />
      <div className={styles.discountForm}>
        <button type="button" className={styles.exitIcon} onClick={onClose} aria-label="Zatvori">
          <span />
          <span />
        </button>
        <h3>Promo kod</h3>
        <p className={styles.discountLead}>
          Promo kodovi vrijede samo za prijavljene kupce i ponovno se provjeravaju pri završetku narudžbe.
        </p>
        <div className={styles.fields}>
          <input
            className={styles.full}
            type="text"
            value={promoCode}
            onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
            placeholder="Unesite promo kod"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        {promoCodeError ? <p className={styles.discountError}>{promoCodeError}</p> : null}
        {promotion ? (
          <div className={styles.promoSummary}>
            <div>
              <strong>{promotion.code}</strong>
              <span>{promotion.name}</span>
            </div>
            <div className={styles.promoDiscount}>-{promotion.discountLabel}</div>
            <p>
              {promotion.scopeLabel}
              {promotion.description ? ` • ${promotion.description}` : ""}
            </p>
          </div>
        ) : null}
        <div className={styles.discountActions}>
          <button
            type="button"
            className={styles.promoApplyButton}
            disabled={!hasPromoCode || isPending}
            onClick={handleApply}
          >
            {isPending ? "Provjera..." : promotion ? "Primijeni novi kod" : "Primijeni kod"}
          </button>
          {promotion ? (
            <button type="button" className={styles.promoRemoveButton} onClick={handleRemove}>
              Ukloni kod
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
