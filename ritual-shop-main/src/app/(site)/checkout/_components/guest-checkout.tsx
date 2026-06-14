"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

import type { CheckoutStep } from "../../_data/checkout-data";
import type { AddressRecord, CustomerProfile } from "../../_data/customer-data";
import { useCart } from "../../_components/cart-provider";
import type {
  CheckoutAddressInput,
  CheckoutPaymentMethodId,
} from "@/payload/collections/carts/contracts";
import type { ShippingPickupPoint } from "@/payload/collections/carts/shipping-contract";
import {
  applyBusinessDetails,
  hasRequiredBusinessFields,
  isCheckoutAddressComplete,
  toCheckoutAddress,
} from "./checkout-address";
import { CheckoutBusinessFields } from "./checkout-business-fields";
import { CheckoutNav } from "./checkout-nav";
import { CheckoutOrderSuccess } from "./checkout-order-success";
import { CheckoutPaymentMethods } from "./checkout-payment-methods";
import { CheckoutShippingMethods } from "./checkout-shipping-methods";
import { CheckoutSummary } from "./checkout-summary";
import styles from "./checkout.module.css";

type GuestCheckoutProps = {
  buyer: CustomerProfile;
  address: AddressRecord;
};

export function GuestCheckout({ buyer, address }: GuestCheckoutProps) {
  const {
    boxNowWidgetConfig,
    cartItems,
    isCheckoutPending,
    isQuotePending,
    isSyncPending,
    placeOrder,
    selectShippingOption,
    selectShippingPickupPoint,
    selectedShippingOption,
    shippingOptions,
    shippingPickupPoint,
    totals,
  } = useCart();
  const [activeStep, setActiveStep] = useState<CheckoutStep>("buyer");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethodId>("card");
  const [billingSame, setBillingSame] = useState(true);
  const [buyerForm, setBuyerForm] = useState({
    email: buyer.email,
    firstName: buyer.firstName,
    lastName: buyer.lastName,
    phone: buyer.phone,
  });
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddressInput>(toCheckoutAddress(address));
  const [billingAddress, setBillingAddress] = useState<CheckoutAddressInput>(toCheckoutAddress(address));
  const [confirmedBuyer, setConfirmedBuyer] = useState<GuestCheckoutProps["buyer"] | undefined>(undefined);
  const [confirmedBillingAddress, setConfirmedBillingAddress] = useState<
    | Pick<
        CheckoutAddressInput,
        "addressLine1" | "city" | "company" | "country" | "isBusiness" | "postalCode" | "taxId"
      >
    | undefined
  >(undefined);
  const [confirmedShippingAddress, setConfirmedShippingAddress] = useState<
    | {
        addressLine1: string;
        city: string;
        country: string;
        postalCode: string;
      }
    | undefined
  >(undefined);
  const [confirmedShippingPickupPoint, setConfirmedShippingPickupPoint] = useState<ShippingPickupPoint | undefined>(
    undefined,
  );
  const [submitError, setSubmitError] = useState("");
  const [placedOrder, setPlacedOrder] = useState<null | { orderNumber: string }>(null);
  const formsRef = useRef<HTMLDivElement | null>(null);
  const buyerRef = useRef<HTMLDivElement | null>(null);
  const shippingRef = useRef<HTMLDivElement | null>(null);
  const paymentRef = useRef<HTMLDivElement | null>(null);
  const [formsHeight, setFormsHeight] = useState(444);
  const isHomeDelivery = selectedShippingOption?.kind === "home";
  const effectiveBillingAddress =
    billingSame && isHomeDelivery
      ? applyBusinessDetails(shippingAddress, billingAddress)
      : applyBusinessDetails(billingAddress, billingAddress);
  const canAdvanceFromShipping = !selectedShippingOption
    ? false
    : isHomeDelivery
      ? isCheckoutAddressComplete(shippingAddress) &&
        (billingSame || isCheckoutAddressComplete(billingAddress)) &&
        hasRequiredBusinessFields(effectiveBillingAddress)
      : !!shippingPickupPoint &&
        isCheckoutAddressComplete(billingAddress) &&
        hasRequiredBusinessFields(effectiveBillingAddress);
  const canPlaceOrder =
    !!selectedShippingOption &&
    !isCheckoutPending &&
    !isQuotePending &&
    !isSyncPending &&
    (isHomeDelivery ? isCheckoutAddressComplete(shippingAddress) : !!shippingPickupPoint) &&
    isCheckoutAddressComplete(effectiveBillingAddress) &&
    hasRequiredBusinessFields(effectiveBillingAddress);

  useLayoutEffect(() => {
    let frame = 0;
    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });

    const updateLayout = () => {
      const currentForm =
        activeStep === "buyer" ? buyerRef.current : activeStep === "shipping" ? shippingRef.current : paymentRef.current;
      const forms = formsRef.current;

      if (!currentForm || !forms) {
        return;
      }

      const nav = forms.querySelector("[class*=checkoutNav]") as HTMLElement | null;
      const navHeight = nav?.offsetHeight ?? 0;
      setFormsHeight(currentForm.offsetHeight + navHeight);
    };

    frame = requestAnimationFrame(updateLayout);
    const currentForm =
      activeStep === "buyer" ? buyerRef.current : activeStep === "shipping" ? shippingRef.current : paymentRef.current;

    if (currentForm) {
      resizeObserver.observe(currentForm);
    }

    window.addEventListener("resize", updateLayout);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [activeStep, billingSame, selectedShippingOption?.id, shippingPickupPoint?.id]);

  function updateBuyerField(field: keyof typeof buyerForm, value: string) {
    setBuyerForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateAddressField(kind: "billing" | "shipping", field: keyof CheckoutAddressInput, value: string) {
    if (kind === "shipping") {
      setShippingAddress((current) => {
        const nextAddress = {
          ...current,
          [field]: value,
        };

        if (billingSame) {
          setBillingAddress((currentBilling) => applyBusinessDetails(nextAddress, currentBilling));
        }

        return nextAddress;
      });

      return;
    }

    setBillingAddress((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateBusinessField(field: "company" | "isBusiness" | "taxId", value: boolean | string) {
    setBillingAddress((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function confirmBuyerStep() {
    setConfirmedBuyer({
      email: buyerForm.email,
      firstName: buyerForm.firstName,
      lastName: buyerForm.lastName,
      phone: buyerForm.phone,
    });
    setActiveStep("shipping");
  }

  function confirmShippingStep() {
    if (!canAdvanceFromShipping) {
      return;
    }

    setConfirmedBillingAddress({
      addressLine1: effectiveBillingAddress.addressLine1,
      city: effectiveBillingAddress.city,
      company: effectiveBillingAddress.company,
      country: effectiveBillingAddress.country,
      isBusiness: effectiveBillingAddress.isBusiness,
      postalCode: effectiveBillingAddress.postalCode,
      taxId: effectiveBillingAddress.taxId,
    });
    setConfirmedShippingAddress(
      isHomeDelivery
        ? {
            addressLine1: shippingAddress.addressLine1,
            city: shippingAddress.city,
            country: shippingAddress.country,
            postalCode: shippingAddress.postalCode,
          }
        : undefined,
    );
    setConfirmedShippingPickupPoint(shippingPickupPoint ?? undefined);
    setActiveStep("payment");
  }

  async function handlePlaceOrder() {
    if (!selectedShippingOption) {
      return;
    }

    setSubmitError("");

    try {
      const order = await placeOrder({
        billingAddress: effectiveBillingAddress,
        buyer: buyerForm,
        paymentMethodId: paymentMethod,
        shippingAddress: isHomeDelivery ? shippingAddress : null,
      });

      setPlacedOrder({
        orderNumber: order.orderNumber,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Narudžbu trenutno nije moguće dovršiti.");
    }
  }

  function renderAddressFields(kind: "billing" | "shipping", currentAddress: CheckoutAddressInput) {
    return (
      <div className={styles.formGrid}>
        <input
          type="text"
          className={styles.half}
          value={currentAddress.country}
          placeholder="Država *"
          onChange={(event) => updateAddressField(kind, "country", event.target.value)}
        />
        <input
          type="text"
          className={styles.half}
          value={currentAddress.region || ""}
          placeholder="Županija *"
          onChange={(event) => updateAddressField(kind, "region", event.target.value)}
        />
        <input
          type="text"
          className={styles.half}
          value={currentAddress.city}
          placeholder="Grad / mjesto*"
          onChange={(event) => updateAddressField(kind, "city", event.target.value)}
        />
        <input
          type="text"
          className={styles.half}
          value={currentAddress.postalCode}
          placeholder="Poštanski broj*"
          onChange={(event) => updateAddressField(kind, "postalCode", event.target.value)}
        />
        <input
          type="text"
          className={styles.full}
          value={currentAddress.addressLine1}
          placeholder="Adresa 1*"
          onChange={(event) => updateAddressField(kind, "addressLine1", event.target.value)}
        />
        <input
          type="text"
          className={styles.full}
          value={currentAddress.addressLine2 || ""}
          placeholder="Adresa 2"
          onChange={(event) => updateAddressField(kind, "addressLine2", event.target.value)}
        />
      </div>
    );
  }

  if (placedOrder) {
    return <CheckoutOrderSuccess orderNumber={placedOrder.orderNumber} />;
  }

  return (
    <section className={styles.checkoutWrapper}>
      <div className={styles.grid}>
        <div className={styles.checkoutFormsWrapper}>
          <div ref={formsRef} className={styles.checkoutForms} style={{ height: `${formsHeight}px` }}>
            <CheckoutNav activeStep={activeStep} />
            <div ref={buyerRef} className={`${styles.form} ${activeStep === "buyer" ? styles.formActive : styles.formFilled}`}>
              <div className={styles.formGrid}>
                <input
                  type="text"
                  className={styles.half}
                  value={buyerForm.firstName}
                  placeholder="Ime*"
                  onChange={(event) => updateBuyerField("firstName", event.target.value)}
                />
                <input
                  type="text"
                  className={styles.half}
                  value={buyerForm.lastName}
                  placeholder="Prezime*"
                  onChange={(event) => updateBuyerField("lastName", event.target.value)}
                />
                <input
                  type="tel"
                  className={styles.full}
                  value={buyerForm.phone}
                  placeholder="Telefon*"
                  onChange={(event) => updateBuyerField("phone", event.target.value)}
                />
                <input
                  type="email"
                  className={styles.full}
                  value={buyerForm.email}
                  placeholder="Email*"
                  onChange={(event) => updateBuyerField("email", event.target.value)}
                />
              </div>
              <div className={styles.formCta}>
                <div />
                <div className={`${styles.next} ${styles.available}`} onClick={confirmBuyerStep}>Dalje</div>
              </div>
            </div>
            <div ref={shippingRef} className={`${styles.form} ${activeStep === "shipping" ? styles.formActive : activeStep === "payment" ? styles.formFilled : ""}`}>
              <CheckoutShippingMethods
                boxNowWidgetConfig={boxNowWidgetConfig}
                onSelectPickupPoint={selectShippingPickupPoint}
                onSelectShippingOption={selectShippingOption}
                selectedPickupPoint={shippingPickupPoint}
                shippingOptions={shippingOptions}
              />
              {isHomeDelivery ? (
                <>
                  {renderAddressFields("shipping", shippingAddress)}
                  <div className={styles.billingAddress}>
                    <label className={styles.checkboxLabelWide}>
                      Adresa za naplatu je ista kao adresa dostave
                      <input
                        type="checkbox"
                        checked={billingSame}
                        onChange={() => {
                          setBillingSame((current) => {
                            const nextValue = !current;

                            if (nextValue) {
                              setBillingAddress((currentBilling) =>
                                applyBusinessDetails(shippingAddress, currentBilling),
                              );
                            }

                            return nextValue;
                          });
                        }}
                      />
                      <span className={styles.checkboxMark} />
                    </label>
                  </div>
                </>
              ) : null}
              <CheckoutBusinessFields address={billingAddress} onChange={updateBusinessField} />
              <div className={`${styles.billingForm} ${billingSame && isHomeDelivery ? styles.areSame : ""}`}>
                <div className={styles.formGrid}>
                  <div className={styles.full}>
                    <h3 className={styles.midTitle}>Adresa za naplatu</h3>
                  </div>
                </div>
                {renderAddressFields("billing", billingSame && isHomeDelivery ? shippingAddress : billingAddress)}
              </div>
              <div className={styles.formCta}>
                <div className={`${styles.back} ${styles.both}`} onClick={() => setActiveStep("buyer")}>
                  <Image src="/ritual/icons/checkout-back.svg" alt="" aria-hidden="true" width={14} height={12} />
                  Natrag
                </div>
                <div
                  className={`${styles.next} ${canAdvanceFromShipping ? styles.available : ""} ${styles.both}`}
                  onClick={confirmShippingStep}
                >
                  Dalje
                </div>
              </div>
            </div>
            <div ref={paymentRef} className={`${styles.form} ${activeStep === "payment" ? styles.formActive : ""}`}>
              <CheckoutPaymentMethods selected={paymentMethod} onSelect={setPaymentMethod} />
              {submitError ? <p className={styles.checkoutSubmitError}>{submitError}</p> : null}
              <div className={styles.formCta}>
                <div className={styles.back} onClick={() => setActiveStep("shipping")}>
                  <Image src="/ritual/icons/checkout-back.svg" alt="" aria-hidden="true" width={14} height={12} />
                  Natrag
                </div>
                <button
                  type="button"
                  className={`${styles.primaryButton} ${styles.checkoutSubmitButton}`}
                  disabled={!canPlaceOrder}
                  onClick={() => {
                    void handlePlaceOrder();
                  }}
                >
                  {isCheckoutPending ? "Obrada..." : "Naruči"}
                </button>
              </div>
            </div>
          </div>
          <div className={styles.obligatory}>*Polja označena zvjezdicom su obvezna</div>
        </div>
        <CheckoutSummary
          items={cartItems}
          shippingOption={
            selectedShippingOption ?? {
              label: "Odaberi dostavu",
              priceLabel: "-",
            }
          }
          buyer={confirmedBuyer}
          billingAddress={confirmedBillingAddress}
          shippingAddress={confirmedShippingAddress}
          shippingPickupPoint={confirmedShippingPickupPoint}
          totals={totals}
          promotionCode={null}
        />
      </div>
    </section>
  );
}
