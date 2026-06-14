import type { ShippingPickupPoint } from "./shipping-contract";

export type CartInputItem = {
  productSlug: string;
  quantity: number;
};

export type CartInput = {
  items?: CartInputItem[];
  promoCode?: null | string;
  shippingOptionId?: string | null;
  shippingPickupPoint?: null | ShippingPickupPoint;
};

export type CheckoutPaymentMethodId = "bank" | "card" | "cash";

export type CheckoutBuyerInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type CheckoutAddressInput = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  company?: string;
  country: string;
  firstName: string;
  isBusiness?: boolean;
  lastName: string;
  phone?: string;
  postalCode: string;
  region?: string;
  taxId?: string;
};

export type CheckoutOrderRequest = {
  billingAddress: CheckoutAddressInput;
  buyer: CheckoutBuyerInput;
  cart: CartInput;
  paymentMethodId: CheckoutPaymentMethodId;
  shippingAddress: CheckoutAddressInput | null;
};

export type CheckoutOrderResponse = {
  orderId: number;
  orderNumber: string;
  status: string;
};

export const checkoutPaymentMethods: Array<{
  icon: string;
  id: CheckoutPaymentMethodId;
  label: string;
}> = [
  { id: "card", label: "Kartično plaćanje", icon: "/ritual/icons/credit-card.svg" },
  { id: "cash", label: "Plaćanje pouzećem", icon: "/ritual/icons/payment.svg" },
  { id: "bank", label: "Virman", icon: "/ritual/icons/bank-transfer.svg" },
];
