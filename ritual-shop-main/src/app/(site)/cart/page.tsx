"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "../_components/cart-provider";
import { QuantitySelector } from "../_components/quantity-selector";
import type { CartQuote } from "../_components/cart-provider/types";
import { getFreeShippingProgress } from "@/payload/collections/carts/shipping-contract";
import styles from "./cart-page.module.css";

type CartShippingOption = CartQuote["shippingOptions"][number];

function getShippingOptionDisplay(option: CartShippingOption) {
  if (option.provider === "gls") {
    return {
      className: styles.shippingMethodLogoGls,
      height: 24,
      icon: "/ritual/images/gls_logo.png",
      iconAlt: "GLS",
      width: 72,
    };
  }

  return {
    className: styles.shippingMethodLogoBoxNow,
    height: 38,
    icon: "/ritual/images/boxnow_logo.png",
    iconAlt: "BOX NOW",
    width: 38,
  };
}

function getDeliveryTypeLabel(option: CartShippingOption) {
  return option.kind === "locker" ? "Preuzimanje u paketomatu" : "Dostava na adresu";
}

export default function CartPage() {
  const {
    adjustments,
    cartItems,
    hasHydrated,
    isQuotePending,
    isRestoring,
    isSyncPending,
    promotion,
    removeItem,
    selectedShippingOption,
    selectShippingOption,
    shippingPickupPoint,
    shippingOptions,
    totals,
    updateItemQuantity,
  } = useCart();
  const isLoading = !hasHydrated || (isRestoring && cartItems.length === 0);
  const isEmpty = !isLoading && cartItems.length === 0;
  const cartPageShippingOptions = shippingOptions;
  const freeShipping = getFreeShippingProgress(totals.subtotal);
  const isAmountsPending = isQuotePending || isSyncPending;

  return (
    <div className="headerClearance">
      <section className={styles.cartTitle}>
        <div className={styles.cartTitleInner}>
          <h1>Košarica</h1>
          <p>Pregledajte odabrane proizvode, potvrdite dostavu i nastavite na plaćanje.</p>
        </div>
      </section>
      <section className={styles.cartWrapper}>
        <div className={styles.grid}>
          {isLoading ? (
            <div className={styles.cartLoading}>
              <h4>Učitavanje košarice...</h4>
            </div>
          ) : isEmpty ? (
            <div className={styles.cartEmpty}>
              <Image src="/ritual/icons/empty-cart.svg" alt="" aria-hidden="true" width={94} height={94} />
              <h4>Vaša košarica je prazna</h4>
              <Link href="/shop" className={styles.checkoutLink}>
                Pogledaj ponudu
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.cart}>
                {adjustments.length > 0 ? (
                  <div className={styles.noticeBox}>
                    {adjustments.map((adjustment) => (
                      <p key={`${adjustment.productSlug}-${adjustment.type}`}>{adjustment.message}</p>
                    ))}
                  </div>
                ) : null}
                <div className={styles.itemsHolder}>
                  {cartItems.map((item) => (
                    <article key={item.productSlug} className={styles.item}>
                      <div className={styles.productImage}>
                        <Image
                          src={item.image ?? "/ritual/icons/missing-icon.svg"}
                          alt={item.title}
                          width={108}
                          height={132}
                        />
                      </div>
                      <div className={styles.itemBody}>
                        <div className={styles.itemPrimary}>
                          <div className={styles.itemDetails}>
                            <h2 className={styles.itemTitle}>{item.title}</h2>
                            <div className={styles.itemMeta}>
                              <div className={styles.itemPriceBlock}>
                                <span className={styles.itemMetricLabel}>Cijena</span>
                                <div className={`${styles.itemPrice} ${isAmountsPending ? styles.pendingValue : ""}`}>
                                  {item.priceLabel}
                                </div>
                              </div>
                              <div className={styles.itemQuantityBlock}>
                                <span className={styles.itemMetricLabel}>Količina</span>
                                <QuantitySelector
                                  className={styles.itemQuantity}
                                  value={item.quantity}
                                  max={item.maxQuantity}
                                  onChange={(quantity) => updateItemQuantity(item.productSlug, quantity)}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={styles.itemRail}>
                            <button
                              type="button"
                              className={styles.removeAction}
                              aria-label={`Ukloni ${item.title}`}
                              onClick={() => removeItem(item.productSlug)}
                            >
                              <span aria-hidden="true">&times;</span>
                            </button>
                            <div className={styles.itemSummary}>
                              <span className={styles.itemMetricLabel}>Ukupno</span>
                              <strong className={isAmountsPending ? styles.pendingValue : undefined}>{item.totalLabel}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className={styles.delivery}>
                  <div className={styles.deliveryHeader}>
                    <h2>Odaberite način isporuke</h2>
                  </div>
                  <div className={styles.shippingMethods}>
                    <div className={styles.shippingMethodRow}>
                      {cartPageShippingOptions.map((option) => {
                        const display = getShippingOptionDisplay(option);

                        return (
                          <div key={option.id} className={styles.shippingMethodGroup}>
                            <div className={styles.shippingMethodGroupLabel}>{getDeliveryTypeLabel(option)}</div>
                            <button
                              type="button"
                              className={`${styles.shippingMethodButton} ${option.selected ? styles.shippingMethodButtonActive : ""} ${!option.available ? styles.shippingMethodButtonDisabled : ""}`}
                              aria-label={`${option.label} ${option.available ? option.priceLabel : option.disabledLabel}`}
                              aria-pressed={option.selected}
                              disabled={!option.available}
                              onClick={() => selectShippingOption(option.id)}
                            >
                              <span className={styles.shippingMethodRadio} aria-hidden="true" />
                              <div className={styles.shippingMethodLead}>
                                <div className={styles.shippingMethodHeader}>
                                  <div className={styles.shippingMethodLogo}>
                                    <Image
                                      src={display.icon}
                                      alt={display.iconAlt}
                                      width={display.width}
                                      height={display.height}
                                      className={`${styles.shippingMethodLogoImage} ${display.className}`}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className={styles.shippingMethodMeta}>
                                <span className={option.available ? styles.shippingMethodPrice : styles.shippingMethodState}>
                                  {option.available ? option.priceLabel : option.disabledLabel}
                                </span>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {selectedShippingOption?.checkoutOnly ? (
                    <div className={`${styles.noticeBox} ${styles.deliveryNotice}`}>
                      <p>{selectedShippingOption.label} odabire se u checkoutu.</p>
                      {shippingPickupPoint ? (
                        <p>
                          Odabrani paketomat: {shippingPickupPoint.name}, {shippingPickupPoint.addressLine1},{" "}
                          {shippingPickupPoint.postalCode} {shippingPickupPoint.city}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
              <aside className={styles.bill}>
                <div className={styles.billWrapper}>
                  <div className={styles.summary}>
                    <h3>Vaša narudžba</h3>
                    <div className={styles.freeDeliveryStatus}>
                      <div className={styles.freeDeliveryCopy}>
                        <strong>
                          {freeShipping.isUnlocked
                            ? <span className={isAmountsPending ? styles.pendingValue : undefined}>Besplatna dostava je aktivna.</span>
                            : (
                              <>
                                Još{" "}
                                <span className={isAmountsPending ? styles.pendingValue : undefined}>
                                  {freeShipping.remainingLabel}
                                </span>{" "}
                                do besplatne dostave.
                              </>
                            )}
                        </strong>
                        <span>Prag za besplatnu dostavu je {freeShipping.thresholdLabel}.</span>
                      </div>
                      <div className={styles.freeDeliveryBar} aria-hidden="true">
                        <span style={{ width: `${freeShipping.progressPercent}%` }} />
                      </div>
                    </div>
                    <div className={styles.summaryItems}>
                      {cartItems.map((item) => (
                        <div key={item.productSlug} className={styles.summaryItemRow}>
                          <div className={styles.summaryName}>{item.title}</div>
                          <div className={styles.summaryQuantity}>x{item.quantity}</div>
                          <div className={`${styles.summaryPriceValue} ${isAmountsPending ? styles.pendingValue : ""}`}>
                            {item.totalLabel}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.summaryItems}>
                      <div className={styles.summaryValueRow}>
                        <div className={styles.summaryName}>Međuzbroj</div>
                        <div className={`${styles.summaryPriceValue} ${isAmountsPending ? styles.pendingValue : ""}`}>
                          {totals.subtotalLabel}
                        </div>
                      </div>
                      <div className={styles.summaryValueRow}>
                        <div className={styles.summaryName}>{selectedShippingOption?.label ?? "Odaberi dostavu"}</div>
                        <div className={`${styles.summaryPriceValue} ${isAmountsPending ? styles.pendingValue : ""}`}>
                          {selectedShippingOption ? totals.shippingLabel : "-"}
                        </div>
                      </div>
                      {totals.discount > 0 ? (
                        <div className={styles.summaryValueRow}>
                          <div className={styles.summaryName}>
                            {promotion ? `Popust (${promotion.code})` : "Popust"}
                          </div>
                          <div className={`${styles.summaryPriceValue} ${isAmountsPending ? styles.pendingValue : ""}`}>
                            -{totals.discountLabel}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className={styles.summaryPriceRow}>
                      <h4>Ukupno</h4>
                      <h4 className={isAmountsPending ? styles.pendingValue : undefined}>{totals.grandTotalLabel}</h4>
                    </div>
                    <Link
                      href="/checkout"
                      className={`${styles.checkoutLink} ${isAmountsPending ? styles.checkoutLinkDisabled : ""}`}
                      aria-disabled={isAmountsPending}
                      tabIndex={isAmountsPending ? -1 : undefined}
                    >
                      Nastavi na plaćanje
                    </Link>
                  </div>
                  <div className={styles.underSummary}>
                    <div>
                      <Image src="/ritual/icons/secured-payment.svg" alt="" aria-hidden="true" width={22} height={22} />
                      <div>
                        Sigurno<br />plaćanje
                      </div>
                    </div>
                    <div>
                      <Image src="/ritual/icons/fast-shipping.svg" alt="" aria-hidden="true" width={22} height={22} />
                      <div>
                        Brza<br />dostava
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
