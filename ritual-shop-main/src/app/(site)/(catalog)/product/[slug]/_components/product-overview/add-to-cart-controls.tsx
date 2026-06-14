"use client";

import { useState } from "react";

import { useCart } from "../../../../../_components/cart-provider";
import { QuantitySelector } from "../../../../../_components/quantity-selector";
import styles from "./product-overview.module.css";

type AddToCartControlsProps = {
  inStock: boolean;
  productSlug: string;
};

export function AddToCartControls({ inStock, productSlug }: AddToCartControlsProps) {
  const { activeAddProductSlug, addItem, isAddPending } = useCart();
  const [quantity, setQuantity] = useState(1);
  const isLoading = isAddPending && activeAddProductSlug === productSlug;
  const isDisabled = !inStock || isLoading;

  return (
    <div className={styles.ctaRow}>
      <QuantitySelector disabled={isDisabled} value={quantity} onChange={setQuantity} variant="product" />
      <button
        type="button"
        className={`${styles.addToCart} ${isLoading ? styles.addToCartLoading : ""}`}
        disabled={isDisabled}
        aria-busy={isLoading}
        onClick={() => {
          if (!inStock || isLoading) {
            return;
          }

          addItem(productSlug, quantity);
        }}
      >
        <span className={`${styles.addToCartLabel} ${isLoading ? styles.addToCartLabelHidden : ""}`}>
          {inStock ? "Dodaj u košaricu" : "Trenutno nedostupno"}
        </span>
        <span className={`${styles.addToCartLoader} ${isLoading ? styles.addToCartLoaderVisible : ""}`}>
          <span className={styles.loaderDots} aria-hidden="true">
            <span className={styles.loaderDot} />
            <span className={styles.loaderDot} />
            <span className={styles.loaderDot} />
          </span>
          <span>Dodavanje...</span>
        </span>
      </button>
    </div>
  );
}
