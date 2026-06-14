"use client";

import Image from "next/image";

import type {
  BoxNowWidgetConfig,
  ShippingPickupPoint,
} from "@/payload/collections/carts/shipping-contract";
import { BoxNowLockerSelector } from "./box-now-locker-selector";
import styles from "./checkout.module.css";

type CheckoutShippingOption = {
  available: boolean;
  description: string;
  disabledLabel: string;
  id: string;
  kind: "home" | "locker";
  label: string;
  priceLabel: string;
  provider: string;
  requiresPickupPoint: boolean;
  selected: boolean;
};

type CheckoutShippingMethodsProps = {
  boxNowWidgetConfig: BoxNowWidgetConfig | null;
  onSelectPickupPoint: (pickupPoint: ShippingPickupPoint) => void;
  onSelectShippingOption: (shippingOptionId: string) => void;
  shippingOptions: CheckoutShippingOption[];
  selectedPickupPoint: null | ShippingPickupPoint;
};

export function CheckoutShippingMethods({
  boxNowWidgetConfig,
  onSelectPickupPoint,
  onSelectShippingOption,
  shippingOptions,
  selectedPickupPoint,
}: CheckoutShippingMethodsProps) {
  const selectedOption = shippingOptions.find((option) => option.selected) ?? null;
  const orderedOptions = [
    ...shippingOptions.filter((option) => option.kind === "home"),
    ...shippingOptions.filter((option) => option.kind === "locker"),
  ];

  function getOptionDisplay(option: CheckoutShippingOption) {
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

  function getDeliveryTypeLabel(option: CheckoutShippingOption) {
    return option.kind === "locker" ? "Preuzimanje u paketomatu" : "Dostava na adresu";
  }

  return (
    <div className={styles.shippingMethods}>
      <div className={styles.shippingMethodRow}>
        {orderedOptions.map((option) => {
          const display = getOptionDisplay(option);

          return (
            <div key={option.id} className={styles.shippingMethodGroup}>
              <div className={styles.shippingMethodGroupLabel}>{getDeliveryTypeLabel(option)}</div>
              <button
                type="button"
                className={`${styles.shippingMethodButton} ${option.selected ? styles.shippingMethodButtonActive : ""} ${!option.available ? styles.shippingMethodButtonDisabled : ""}`}
                aria-label={`${option.label} ${option.available ? option.priceLabel : option.disabledLabel}`}
                aria-pressed={option.selected}
                disabled={!option.available}
                onClick={() => onSelectShippingOption(option.id)}
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
      {selectedOption?.requiresPickupPoint && selectedOption.available ? (
        <BoxNowLockerSelector
          widgetConfig={boxNowWidgetConfig}
          pickupPoint={selectedPickupPoint}
          onSelectPickupPoint={onSelectPickupPoint}
        />
      ) : null}
    </div>
  );
}
