import type { PayloadRequest } from "payload";

import type {
  CartInput,
  CheckoutAddressInput,
  CheckoutBuyerInput,
  CheckoutOrderRequest,
  CheckoutPaymentMethodId,
} from "../contracts";

export type CheckoutInput = {
  billingAddress: CheckoutAddressInput | null;
  buyer: CheckoutBuyerInput | null;
  cart: CartInput;
  paymentMethodId: CheckoutPaymentMethodId | null;
  shippingAddress: CheckoutAddressInput | null;
};

export type CompleteCheckoutInput = CheckoutInput & {
  billingAddress: CheckoutAddressInput;
  buyer: CheckoutBuyerInput;
  paymentMethodId: CheckoutPaymentMethodId;
};

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(value: unknown) {
  return value === true;
}

function normalizeBuyer(input: unknown): null | CheckoutBuyerInput {
  if (!input || typeof input !== "object") {
    return null;
  }

  const source = input as Record<string, unknown>;
  const buyer = {
    email: getText(source.email),
    firstName: getText(source.firstName),
    lastName: getText(source.lastName),
    phone: getText(source.phone),
  };

  if (!buyer.firstName || !buyer.lastName || !buyer.email || !buyer.phone) {
    return null;
  }

  return buyer;
}

function normalizeAddress(input: unknown): null | CheckoutAddressInput {
  if (!input || typeof input !== "object") {
    return null;
  }

  const source = input as Record<string, unknown>;
  const isBusiness = getBoolean(source.isBusiness);
  const address = {
    addressLine1: getText(source.addressLine1),
    addressLine2: getText(source.addressLine2),
    city: getText(source.city),
    company: isBusiness ? getText(source.company) : "",
    country: getText(source.country),
    firstName: getText(source.firstName),
    isBusiness,
    lastName: getText(source.lastName),
    phone: getText(source.phone),
    postalCode: getText(source.postalCode),
    region: getText(source.region),
    taxId: isBusiness ? getText(source.taxId) : "",
  };

  if (
    !address.firstName ||
    !address.lastName ||
    !address.addressLine1 ||
    !address.city ||
    !address.postalCode ||
    !address.country
  ) {
    return null;
  }

  if (address.isBusiness && (!address.company || !address.taxId)) {
    return null;
  }

  return address;
}

function normalizePaymentMethodId(value: unknown): null | CheckoutPaymentMethodId {
  return value === "bank" || value === "card" || value === "cash" ? value : null;
}

export function hasRequiredCheckoutInput(
  input: CheckoutInput,
): input is CompleteCheckoutInput {
  return Boolean(input.buyer && input.billingAddress && input.paymentMethodId);
}

export async function readCheckoutInput(req: PayloadRequest): Promise<CheckoutInput> {
  try {
    const body =
      typeof req.json === "function"
        ? ((await req.json()) as CheckoutOrderRequest)
        : ((req.data ?? {}) as CheckoutOrderRequest);

    return {
      billingAddress: normalizeAddress(body.billingAddress),
      buyer: normalizeBuyer(body.buyer),
      cart: body.cart ?? {},
      paymentMethodId: normalizePaymentMethodId(body.paymentMethodId),
      shippingAddress: normalizeAddress(body.shippingAddress),
    };
  } catch {
    return {
      billingAddress: null,
      buyer: null,
      cart: {},
      paymentMethodId: null,
      shippingAddress: null,
    };
  }
}
