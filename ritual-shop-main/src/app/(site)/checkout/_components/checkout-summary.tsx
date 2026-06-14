import {
  getFreeShippingProgress,
  type ShippingPickupPoint,
} from "@/payload/collections/carts/shipping-contract";
import type { CheckoutAddressInput } from "@/payload/collections/carts/contracts";
import styles from "./checkout.module.css";

type CheckoutSummaryProps = {
  buyer?: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  billingAddress?: Pick<
    CheckoutAddressInput,
    "addressLine1" | "city" | "company" | "country" | "isBusiness" | "postalCode" | "taxId"
  >;
  items: Array<{
    productSlug: string;
    quantity: number;
    title: string;
    totalLabel: string;
  }>;
  shippingOption: {
    label: string;
    priceLabel: string;
  };
  shippingAddress?: {
    addressLine1: string;
    city: string;
    country: string;
    postalCode: string;
  };
  shippingPickupPoint?: null | ShippingPickupPoint;
  totals: {
    discount: number;
    discountLabel: string;
    subtotal: number;
    grandTotalLabel: string;
    subtotalLabel: string;
  };
  promotionCode?: null | string;
};

function hasText(value: null | string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function compactLines(lines: Array<null | string | undefined>) {
  return lines.filter((line): line is string => hasText(line));
}

export function CheckoutSummary({
  items,
  shippingOption,
  buyer,
  billingAddress,
  shippingAddress,
  shippingPickupPoint,
  totals,
  promotionCode,
}: CheckoutSummaryProps) {
  const freeShipping = getFreeShippingProgress(totals.subtotal);
  const buyerLines = compactLines([
    hasText(`${buyer?.firstName ?? ""} ${buyer?.lastName ?? ""}`.trim())
      ? `${buyer?.firstName ?? ""} ${buyer?.lastName ?? ""}`.trim()
      : null,
    buyer?.phone,
    buyer?.email,
  ]);
  const shippingTitle = shippingPickupPoint ? "BOX NOW paketomat" : "Adresa dostave";
  const shippingLines = shippingPickupPoint
    ? compactLines([
        shippingPickupPoint.name,
        shippingPickupPoint.addressLine1,
        `${shippingPickupPoint.postalCode} ${shippingPickupPoint.city}`.trim(),
      ])
    : compactLines([
        shippingAddress?.addressLine1,
        `${shippingAddress?.postalCode ?? ""} ${shippingAddress?.city ?? ""}`.trim(),
        shippingAddress?.country,
      ]);
  const billingLines = billingAddress?.isBusiness
    ? compactLines([
        billingAddress.company,
        billingAddress.taxId,
        billingAddress.addressLine1,
        `${billingAddress.postalCode} ${billingAddress.city}`.trim(),
        billingAddress.country,
      ])
    : [];
  const hasBuyerDetails = buyerLines.length > 0;
  const hasShippingDetails = shippingLines.length > 0;
  const hasBillingDetails = billingAddress?.isBusiness && billingLines.length > 0;
  const hasSummaryDetails = hasBuyerDetails || hasShippingDetails || hasBillingDetails;

  return (
    <div className={styles.summary}>
      <h3>Sažetak narudžbe</h3>
      <div className={styles.freeDeliveryStatus}>
        <div className={styles.freeDeliveryCopy}>
          <strong>
            {freeShipping.isUnlocked
              ? "Besplatna dostava je aktivna."
              : `Još ${freeShipping.remainingLabel} do besplatne dostave.`}
          </strong>
          <span>Prag za besplatnu dostavu je {freeShipping.thresholdLabel}.</span>
        </div>
        <div className={styles.freeDeliveryBar} aria-hidden="true">
          <span style={{ width: `${freeShipping.progressPercent}%` }} />
        </div>
      </div>
      <div className={styles.summaryItems}>
        {items.map((item) => (
          <div key={item.productSlug}>
            <div className={styles.siName}>{item.title}</div>
            <div className={styles.siQuantity}>x{item.quantity}</div>
            <div className={styles.siPrice}>{item.totalLabel}</div>
          </div>
        ))}
      </div>
      <div className={styles.summaryItems}>
        <div>
          <div className={styles.siName}>Međuzbroj</div>
          <div className={styles.siPrice}>{totals.subtotalLabel}</div>
        </div>
        <div>
          <div className={styles.siName}>{shippingOption.label}</div>
          <div className={styles.siPrice}>{shippingOption.priceLabel}</div>
        </div>
        {totals.discount > 0 ? (
          <div>
            <div className={styles.siName}>
              {promotionCode ? `Popust (${promotionCode})` : "Popust"}
            </div>
            <div className={styles.siPrice}>-{totals.discountLabel}</div>
          </div>
        ) : null}
      </div>
      <div className={styles.summaryPrice}>
        <h4>Ukupno</h4>
        <h4>{totals.grandTotalLabel}</h4>
      </div>
      {hasSummaryDetails ? (
        <div className={styles.filledData}>
          {hasBuyerDetails ? (
            <div className={`${styles.summaryDetail} ${styles.summaryDetailVisible}`}>
              <h4>Podaci kupca</h4>
              {buyerLines.map((line, index) => <p key={`buyer-${index}`}>{line}</p>)}
            </div>
          ) : null}
          {hasShippingDetails ? (
            <div className={`${styles.summaryDetail} ${styles.summaryDetailVisible}`}>
              <h4>{shippingTitle}</h4>
              {shippingLines.map((line, index) => <p key={`shipping-${index}`}>{line}</p>)}
            </div>
          ) : null}
          {hasBillingDetails ? (
            <div className={`${styles.summaryDetail} ${styles.summaryDetailVisible}`}>
              <h4>Podaci za račun</h4>
              {billingLines.map((line, index) => <p key={`billing-${index}`}>{line}</p>)}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
