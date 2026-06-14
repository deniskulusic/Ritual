"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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
  toCheckoutAddress,
} from "./checkout-address";
import { CheckoutBusinessFields } from "./checkout-business-fields";
import { CheckoutDiscountModal } from "./checkout-discount-modal";
import { CheckoutNav } from "./checkout-nav";
import { CheckoutOrderSuccess } from "./checkout-order-success";
import { CheckoutPaymentMethods } from "./checkout-payment-methods";
import { CheckoutShippingMethods } from "./checkout-shipping-methods";
import { CheckoutSummary } from "./checkout-summary";
import styles from "./checkout.module.css";

type RegisteredCheckoutProps = {
  buyer: CustomerProfile;
  addresses: AddressRecord[];
};

export function RegisteredCheckout({ buyer, addresses }: RegisteredCheckoutProps) {
  const {
    boxNowWidgetConfig,
    cartItems,
    isCheckoutPending,
    isQuotePending,
    isSyncPending,
    placeOrder,
    promotion,
    selectShippingOption,
    selectShippingPickupPoint,
    selectedShippingOption,
    shippingOptions,
    shippingPickupPoint,
    totals,
  } = useCart();
  const [activeStep, setActiveStep] = useState<CheckoutStep>("buyer");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethodId>("card");
  const [discountOpen, setDiscountOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id ?? "");
  const [billingAddress, setBillingAddress] = useState<CheckoutAddressInput>(toCheckoutAddress(addresses[0]));
  const [isBuyerConfirmed, setIsBuyerConfirmed] = useState(false);
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
  }, [activeStep, selectedShippingOption?.id, shippingPickupPoint?.id]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? addresses[0] ?? null,
    [addresses, selectedAddressId],
  );

  useEffect(() => {
    setBillingAddress(toCheckoutAddress(selectedAddress));
  }, [selectedAddress]);

  const isHomeDelivery = selectedShippingOption?.kind === "home";
  const effectiveBillingAddress = applyBusinessDetails(
    selectedAddress ? toCheckoutAddress(selectedAddress) : billingAddress,
    billingAddress,
  );
  const canAdvanceFromShipping = !selectedShippingOption
    ? false
      : isHomeDelivery
      ? !!selectedAddress && hasRequiredBusinessFields(billingAddress)
      : !!shippingPickupPoint && hasRequiredBusinessFields(billingAddress);
  const canPlaceOrder =
    !!selectedShippingOption &&
    !!selectedAddress &&
    !isCheckoutPending &&
    !isQuotePending &&
    !isSyncPending &&
    hasRequiredBusinessFields(billingAddress);

  function updateBusinessField(field: "company" | "isBusiness" | "taxId", value: boolean | string) {
    setBillingAddress((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function confirmBuyerStep() {
    setIsBuyerConfirmed(true);
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
      isHomeDelivery && selectedAddress
        ? {
            addressLine1: selectedAddress.address1,
            city: selectedAddress.city,
            country: selectedAddress.country,
            postalCode: selectedAddress.postcode,
          }
        : undefined,
    );
    setConfirmedShippingPickupPoint(shippingPickupPoint ?? undefined);
    setActiveStep("payment");
  }

  async function handlePlaceOrder() {
    if (!selectedAddress || !selectedShippingOption) {
      return;
    }

    setSubmitError("");

    try {
      const order = await placeOrder({
        billingAddress: effectiveBillingAddress,
        buyer: {
          email: buyer.email,
          firstName: buyer.firstName,
          lastName: buyer.lastName,
          phone: buyer.phone,
        },
        paymentMethodId: paymentMethod,
        shippingAddress: isHomeDelivery ? toCheckoutAddress(selectedAddress) : null,
      });

      setPlacedOrder({
        orderNumber: order.orderNumber,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Narudžbu trenutno nije moguće dovršiti.");
    }
  }

  if (placedOrder) {
    return <CheckoutOrderSuccess orderNumber={placedOrder.orderNumber} showOrdersLink />;
  }

  return (
    <section className={styles.checkoutWrapper}>
      <div className={styles.grid}>
        <div className={styles.checkoutFormsWrapper}>
          <div ref={formsRef} className={styles.checkoutForms} style={{ height: `${formsHeight}px` }}>
            <CheckoutNav activeStep={activeStep} />
            <div ref={buyerRef} className={`${styles.form} ${activeStep === "buyer" ? styles.formActive : styles.formFilled}`}>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.half}`}>{buyer.firstName}</div>
                <div className={`${styles.field} ${styles.half}`}>{buyer.lastName}</div>
                <div className={`${styles.field} ${styles.full}`}>{buyer.phone}</div>
                <div className={`${styles.field} ${styles.full}`}>{buyer.email}</div>
              </div>
              <div className={`${styles.formCta} ${styles.mobColumn}`}>
                <div className={styles.edit}>
                  <button type="button">
                    <Image src="/ritual/icons/edit.svg" alt="" aria-hidden="true" width={14} height={14} />
                    Uredi
                  </button>
                </div>
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
              {isHomeDelivery && selectedAddress ? (
                <div className={styles.formGrid}>
                  <div className={`${styles.addressContainer} ${styles.full}`}>
                    <div>
                      <h4>{selectedAddress.firstName} {selectedAddress.lastName}, {selectedAddress.address1}, {selectedAddress.postcode} {selectedAddress.city}</h4>
                      <p>{selectedAddress.firstName} {selectedAddress.lastName}</p>
                      <p>{selectedAddress.phone}</p>
                      <p>{selectedAddress.country}</p>
                      <p>{selectedAddress.address1}</p>
                      <p>{selectedAddress.postcode} {selectedAddress.city}</p>
                    </div>
                    <div className={styles.change} onClick={() => setAddressOpen(true)}>
                      Promijeni
                      <Image src="/ritual/icons/checkout-back.svg" alt="" aria-hidden="true" width={14} height={12} />
                    </div>
                  </div>
                </div>
              ) : null}
              {selectedAddress ? <CheckoutBusinessFields address={billingAddress} onChange={updateBusinessField} /> : null}
              <div className={styles.discount} onClick={() => setDiscountOpen(true)}>
                <Image src="/ritual/icons/barcode.svg" alt="" aria-hidden="true" width={22} height={22} />
                {promotion ? `Promo kod ${promotion.code} je primijenjen` : "Imam promo kod"}
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
          buyer={isBuyerConfirmed ? buyer : undefined}
          billingAddress={confirmedBillingAddress}
          shippingAddress={confirmedShippingAddress}
          shippingPickupPoint={confirmedShippingPickupPoint}
          totals={totals}
          promotionCode={promotion?.code ?? null}
        />
      </div>
      <div className={`${styles.popupContainer} ${addressOpen && isHomeDelivery ? styles.opened : ""}`}>
        <button type="button" className={styles.overlay} onClick={() => setAddressOpen(false)} aria-label="Zatvori" />
        <div className={styles.selectAddressPopup}>
          <button type="button" className={styles.exitIcon} onClick={() => setAddressOpen(false)} aria-label="Zatvori">
            <span />
            <span />
          </button>
          <h3>Odaberite adresu dostave</h3>
          <div className={styles.availableAddresses}>
            {addresses.map((address) => (
              <label key={address.id} className={`${styles.availableAddress} ${selectedAddressId === address.id ? styles.checked : ""}`}>
                <input type="radio" name="shipping-address" checked={selectedAddressId === address.id} onChange={() => setSelectedAddressId(address.id)} />
                <span className={styles.radioMark} />
                <div className={styles.addressInfo}>
                  <h3>{address.firstName} {address.lastName}, {address.address1}</h3>
                  <p>{address.firstName} {address.lastName}, {address.phone}, {address.country} {address.address1}, {address.postcode} {address.city}</p>
                  <div className={styles.addressCta}>
                    <div>
                      <Image src="/ritual/icons/edit.svg" alt="" aria-hidden="true" width={14} height={14} />
                      Uredi
                    </div>
                    {address.isDefault ? <div className={styles.defaultTag}>Zadano</div> : null}
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className={styles.addNewAddress}>
            <Link href="/my-account/edit-address">Uredi adrese</Link>
          </div>
        </div>
      </div>
      <CheckoutDiscountModal open={discountOpen} onClose={() => setDiscountOpen(false)} />
    </section>
  );
}
