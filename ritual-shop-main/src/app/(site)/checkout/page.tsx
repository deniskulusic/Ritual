import { headers } from "next/headers";
import { createLocalReq, getPayload } from "payload";

import type { Customer } from "../../../../payload-types";
import type { AddressRecord, CustomerProfile } from "../_data/customer-data";
import { CheckoutLoadingOverlay } from "./_components/checkout-loading-overlay";
import { CheckoutTitle } from "./_components/checkout-title";
import { GuestCheckout } from "./_components/guest-checkout";
import { PreCheckoutMethodSelect } from "./_components/pre-checkout-method-select";
import { RegisteredCheckout } from "./_components/registered-checkout";
import config from "@payload-config";

const emptyBuyer: CustomerProfile = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
};

const emptyGuestAddress: AddressRecord = {
  address1: "",
  address2: "",
  city: "",
  company: "",
  country: "",
  email: "",
  firstName: "",
  id: "guest-address",
  isBusiness: false,
  lastName: "",
  phone: "",
  postcode: "",
  state: "",
  taxId: "",
  title: "Adresa dostave",
};

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(value: unknown) {
  return value === true;
}

function hasAddressValue(address: Record<string, unknown> | null | undefined) {
  if (!address) {
    return false;
  }

  return [
    address.firstName,
    address.lastName,
    address.addressLine1,
    address.city,
    address.postalCode,
    address.country,
    address.phone,
    address.company,
    address.taxId,
  ].some((value) => getText(value).length > 0);
}

function mapAddress(
  address: Record<string, unknown>,
  buyer: CustomerProfile,
  fallbackId: string,
  title: string,
  isDefault = false,
): AddressRecord {
  return {
    address1: getText(address.addressLine1),
    address2: getText(address.addressLine2),
    city: getText(address.city),
    company: getText(address.company),
    country: getText(address.country),
    email: buyer.email,
    firstName: getText(address.firstName) || buyer.firstName,
    id: getText(address.id) || fallbackId,
    isDefault,
    isBusiness: getBoolean(address.isBusiness) || !!getText(address.taxId),
    lastName: getText(address.lastName) || buyer.lastName,
    phone: getText(address.phone) || buyer.phone,
    postcode: getText(address.postalCode),
    state: getText(address.region),
    taxId: getText(address.taxId),
    title,
  };
}

function buildCustomerCheckoutData(customer: Customer) {
  const buyer: CustomerProfile = {
    email: getText(customer.email),
    firstName: getText(customer.firstName),
    lastName: getText(customer.lastName),
    phone: getText(customer.phone),
  };

  const addresses: AddressRecord[] = [];
  const seenIds = new Set<string>();
  const savedAddresses = Array.isArray(customer.savedAddresses)
    ? customer.savedAddresses
    : [];

  for (const [index, entry] of savedAddresses.entries()) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const record = entry as Record<string, unknown>;

    if (!hasAddressValue(record)) {
      continue;
    }

    const address = mapAddress(
      record,
      buyer,
      `saved-address-${index + 1}`,
      `Spremljena adresa ${index + 1}`,
      !!record.isDefault,
    );

    if (seenIds.has(address.id)) {
      continue;
    }

    seenIds.add(address.id);
    addresses.push(address);
  }

  const shippingAddress =
    customer.shippingAddress && typeof customer.shippingAddress === "object"
      ? (customer.shippingAddress as Record<string, unknown>)
      : null;

  if (hasAddressValue(shippingAddress)) {
    const address = mapAddress(shippingAddress!, buyer, "shipping-address", "Adresa dostave");

    if (!seenIds.has(address.id)) {
      seenIds.add(address.id);
      addresses.unshift(address);
    }
  }

  const billingAddress =
    customer.billingAddress && typeof customer.billingAddress === "object"
      ? (customer.billingAddress as Record<string, unknown>)
      : null;

  if (hasAddressValue(billingAddress)) {
    const address = mapAddress(billingAddress!, buyer, "billing-address", "Adresa za naplatu");

    if (!seenIds.has(address.id)) {
      seenIds.add(address.id);
      addresses.push(address);
    }
  }

  const defaultAddressIndex = addresses.findIndex((address) => address.isDefault);

  if (defaultAddressIndex > 0) {
    const [defaultAddress] = addresses.splice(defaultAddressIndex, 1);
    addresses.unshift(defaultAddress);
  }

  return {
    addresses,
    buyer,
  };
}

async function getCurrentCustomerCheckoutData() {
  const payload = await getPayload({
    config,
    cron: true,
  });
  const requestHeaders = await headers();
  const localReq = await createLocalReq(
    {
      req: {
        headers: requestHeaders,
      },
    },
    payload,
  );
  const { user } = await payload.auth({
    headers: requestHeaders,
    req: localReq,
  });

  if (!user || user.collection !== "customers") {
    return null;
  }

  const customer = (await payload.findByID({
    collection: "customers",
    depth: 0,
    id: Number(user.id),
    overrideAccess: true,
  })) as Customer;

  return buildCustomerCheckoutData(customer);
}

type CheckoutPageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { mode } = await searchParams;
  const checkoutMode = mode === "registered" || mode === "guest" ? mode : "pre";
  const customerCheckoutData =
    checkoutMode === "registered" ? await getCurrentCustomerCheckoutData() : null;
  const resolvedMode =
    checkoutMode === "registered" && !customerCheckoutData ? "pre" : checkoutMode;
  const checkoutTitleDescription =
    resolvedMode === "pre"
      ? "Odaberite način nastavka kupnje."
      : "Pregledajte podatke i dovršite narudžbu.";

  return (
    <div className="headerClearance">
      <CheckoutLoadingOverlay />
      <CheckoutTitle description={checkoutTitleDescription} />
      {resolvedMode === "registered" && customerCheckoutData ? (
        <RegisteredCheckout buyer={customerCheckoutData.buyer} addresses={customerCheckoutData.addresses} />
      ) : resolvedMode === "guest" ? (
        <GuestCheckout buyer={emptyBuyer} address={emptyGuestAddress} />
      ) : (
        <PreCheckoutMethodSelect />
      )}
    </div>
  );
}
