import {
  fallbackShippingMethods,
  formatEuro,
  isLockerShippingMethod,
  normalizePickupPoint,
} from "@/payload/collections/carts/shipping-contract";
import { normalizePromoCodeInput } from "@/payload/collections/carts/promo-contract";

import type { LocalCart } from "./types";

export const cartStorageKey = "ritual-cart";
export const fallbackMaxQuantity = 12;
export const fallbackShippingOptions = fallbackShippingMethods.map((option) => ({
  ...option,
  priceLabel: formatEuro(option.priceValue),
  selected: false,
}));

export function normalizeLocalCart(cart: LocalCart): LocalCart {
  const itemMap = new Map<string, number>();

  for (const item of cart.items) {
    const productSlug = item.productSlug.trim();
    const quantity = Math.floor(item.quantity);

    if (!productSlug || quantity <= 0) {
      continue;
    }

    itemMap.set(productSlug, Math.min(fallbackMaxQuantity, (itemMap.get(productSlug) ?? 0) + quantity));
  }

  return {
    items: Array.from(itemMap.entries()).map(([productSlug, quantity]) => ({
      productSlug,
      quantity,
    })),
    promoCode: normalizePromoCodeInput(cart.promoCode),
    shippingOptionId:
      fallbackShippingOptions.find((option) => option.id === cart.shippingOptionId)?.id ?? null,
    shippingPickupPoint: isLockerShippingMethod(cart.shippingOptionId)
      ? normalizePickupPoint(cart.shippingPickupPoint)
      : null,
  };
}

export function readStoredCart(): LocalCart {
  if (typeof window === "undefined") {
    return {
      items: [],
      promoCode: null,
      shippingOptionId: null,
      shippingPickupPoint: null,
    };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(cartStorageKey) ?? "null") as LocalCart | null;

    if (!parsed) {
      return {
        items: [],
        promoCode: null,
        shippingOptionId: null,
        shippingPickupPoint: null,
      };
    }

    return normalizeLocalCart({
      items: Array.isArray(parsed.items) ? parsed.items : [],
      promoCode: normalizePromoCodeInput(parsed.promoCode),
      shippingOptionId:
        typeof parsed.shippingOptionId === "string" ? parsed.shippingOptionId : null,
      shippingPickupPoint: normalizePickupPoint(parsed.shippingPickupPoint),
    });
  } catch {
    return {
      items: [],
      promoCode: null,
      shippingOptionId: null,
      shippingPickupPoint: null,
    };
  }
}
