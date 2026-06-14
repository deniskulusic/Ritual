import type { Endpoint } from "payload";

import { createCheckoutOrder } from "../_checkout/create-order";
import {
  hasRequiredCheckoutInput,
  readCheckoutInput,
} from "../_checkout/input";
import { quoteCart } from "../quote-cart";

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export const checkoutCartEndpoint: Endpoint = {
  handler: async (req) => {
    const input = await readCheckoutInput(req);

    if (!hasRequiredCheckoutInput(input)) {
      return Response.json(
        {
          error: "Nedostaju obvezni podaci za završetak narudžbe.",
        },
        { status: 400 },
      );
    }

    const cart = await quoteCart(req, input.cart);

    if (cart.items.length === 0) {
      return Response.json(
        {
          error: "Košarica je prazna.",
        },
        { status: 400 },
      );
    }

    const selectedShipping =
      cart.shippingOptions.find((option) => option.id === cart.selectedShippingOptionId && option.available) ?? null;

    if (!selectedShipping) {
      return Response.json(
        {
          error: "Potrebno je odabrati način dostave.",
        },
        { status: 400 },
      );
    }

    if (selectedShipping.kind === "home" && !input.shippingAddress) {
      return Response.json(
        {
          error: "Potrebno je unijeti adresu dostave.",
        },
        { status: 400 },
      );
    }

    const pickupPoint = asRecord(cart.localCart.shippingPickupPoint);

    if (selectedShipping.requiresPickupPoint && !getText(pickupPoint.id)) {
      return Response.json(
        {
          error: "Potrebno je odabrati paketomat.",
        },
        { status: 400 },
      );
    }

    const order = await createCheckoutOrder({
      cart,
      input,
      pickupPoint,
      req,
      selectedShipping,
    });

    return Response.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
    });
  },
  method: "post",
  path: "/checkout",
};
