import type { AddressRecord } from "../../_data/customer-data";
import type { CheckoutAddressInput } from "@/payload/collections/carts/contracts";

export function toCheckoutAddress(address: AddressRecord | null | undefined): CheckoutAddressInput {
  return {
    addressLine1: address?.address1 ?? "",
    addressLine2: address?.address2 ?? "",
    city: address?.city ?? "",
    company: address?.company ?? "",
    country: address?.country ?? "",
    firstName: address?.firstName ?? "",
    isBusiness: !!address?.isBusiness,
    lastName: address?.lastName ?? "",
    phone: address?.phone ?? "",
    postalCode: address?.postcode ?? "",
    region: address?.state ?? "",
    taxId: address?.taxId ?? "",
  };
}

export function isCheckoutAddressComplete(address: CheckoutAddressInput) {
  return !!(
    address.firstName &&
    address.lastName &&
    address.addressLine1 &&
    address.city &&
    address.postalCode &&
    address.country
  );
}

export function hasRequiredBusinessFields(address: CheckoutAddressInput) {
  return !address.isBusiness || (!!address.company?.trim() && !!address.taxId?.trim());
}

export function applyBusinessDetails(
  address: CheckoutAddressInput,
  businessAddress: Pick<CheckoutAddressInput, "company" | "isBusiness" | "taxId">,
): CheckoutAddressInput {
  const isBusiness = !!businessAddress.isBusiness;

  return {
    ...address,
    company: isBusiness ? businessAddress.company?.trim() ?? "" : "",
    isBusiness,
    taxId: isBusiness ? businessAddress.taxId?.trim() ?? "" : "",
  };
}
