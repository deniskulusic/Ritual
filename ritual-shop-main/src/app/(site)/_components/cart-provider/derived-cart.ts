import { formatEuro } from "@/payload/collections/carts/shipping-contract";

import { getFallbackItem } from "./fallback-item";
import {
  fallbackMaxQuantity,
  fallbackShippingOptions,
} from "./storage";
import type { CartQuote, LocalCart } from "./types";

export function deriveCartState(cart: LocalCart, quote: CartQuote | null) {
  const isCartDirty =
    quote !== null && JSON.stringify(cart) !== JSON.stringify(quote.localCart);
  const quotedItemsBySlug = new Map(
    (quote?.items ?? []).map((item) => [item.productSlug, item]),
  );
  const cartItems = cart.items.map((item) => {
    const quotedItem = quotedItemsBySlug.get(item.productSlug);
    const fallbackItem = getFallbackItem(item.productSlug);
    const unitPrice = quotedItem?.unitPrice ?? fallbackItem.unitPrice;
    const lineTotal = unitPrice * item.quantity;
    const quotedMatchesQuantity = quotedItem?.quantity === item.quantity;

    return {
      image: quotedItem?.image ?? fallbackItem.image,
      lineTotal,
      maxQuantity: quotedItem?.maxQuantity ?? fallbackMaxQuantity,
      priceLabel: quotedItem?.priceLabel ?? fallbackItem.priceLabel,
      productSlug: item.productSlug,
      quantity: item.quantity,
      title: quotedItem?.title ?? fallbackItem.title,
      totalLabel: quotedMatchesQuantity
        ? (quotedItem?.totalLabel ?? formatEuro(lineTotal))
        : formatEuro(lineTotal),
      unitPrice,
    };
  });
  const shippingOptions = (quote?.shippingOptions ?? fallbackShippingOptions).map((option) => ({
    ...option,
    selected: option.id === cart.shippingOptionId,
  }));
  const selectedShippingOption =
    shippingOptions.find((option) => option.id === cart.shippingOptionId) ??
    null;
  const optimisticSubtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const optimisticShipping =
    cartItems.length === 0 || !selectedShippingOption ? 0 : selectedShippingOption.priceValue;
  const optimisticGrandTotal = optimisticSubtotal + optimisticShipping;
  const totals =
    quote && !isCartDirty
      ? quote.totals
      : {
          discount: 0,
          discountLabel: formatEuro(0),
          grandTotal: optimisticGrandTotal,
          grandTotalLabel: formatEuro(optimisticGrandTotal),
          shipping: optimisticShipping,
          shippingLabel: formatEuro(optimisticShipping),
          subtotal: optimisticSubtotal,
          subtotalLabel: formatEuro(optimisticSubtotal),
        };

  return {
    adjustments: quote && !isCartDirty ? quote.adjustments : [],
    boxNowWidgetConfig: quote?.boxNowWidgetConfig ?? null,
    cartItems,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    promoCodeError: quote?.promoCodeError ?? null,
    promotion: quote?.promotion ?? null,
    selectedShippingOption,
    shippingOptions,
    shippingPickupPoint: cart.shippingPickupPoint,
    totals,
  };
}
