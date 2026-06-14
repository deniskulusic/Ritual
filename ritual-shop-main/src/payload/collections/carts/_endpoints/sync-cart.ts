import type { Endpoint } from "payload";

import type { Cart } from "../../../../../payload-types";
import { quoteCart, readCartInput } from "../quote-cart";

async function getActiveCart(req: Parameters<Endpoint["handler"]>[0]) {
  const result = await req.payload.find({
    collection: "carts",
    depth: 0,
    limit: 1,
    req,
    sort: "-updatedAt",
    where: {
      and: [
        {
          customer: {
            equals: req.user?.id,
          },
        },
        {
          status: {
            equals: "active",
          },
        },
      ],
    },
  });

  return (result.docs[0] as Cart | undefined) ?? null;
}

export const syncCartEndpoint: Endpoint = {
  handler: async (req) => {
    if (req.user?.collection !== "customers") {
      return Response.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    const input = await readCartInput(req);
    const cart = await quoteCart(req, input);
    const selectedShipping =
      cart.shippingOptions.find((option) => option.id === cart.selectedShippingOptionId) ?? null;
    const existingCart = await getActiveCart(req);
    const pickupPoint = cart.localCart.shippingPickupPoint
      ? {
          addressLine1: cart.localCart.shippingPickupPoint.addressLine1,
          city: cart.localCart.shippingPickupPoint.city,
          country: cart.localCart.shippingPickupPoint.country,
          externalId: cart.localCart.shippingPickupPoint.externalId,
          id: cart.localCart.shippingPickupPoint.id,
          latitude: cart.localCart.shippingPickupPoint.latitude,
          longitude: cart.localCart.shippingPickupPoint.longitude,
          name: cart.localCart.shippingPickupPoint.name,
          postalCode: cart.localCart.shippingPickupPoint.postalCode,
          raw: cart.localCart.shippingPickupPoint.raw,
          size: cart.localCart.shippingPickupPoint.size,
          type: cart.localCart.shippingPickupPoint.type,
        }
      : {};
    const data = {
      customer: req.user.id,
      items: cart.items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      promoCode: cart.localCart.promoCode,
      shipping: {
        kind: selectedShipping?.kind ?? null,
        label: selectedShipping?.label ?? null,
        method: selectedShipping?.id ?? null,
        price: cart.totals.shipping,
        pickupPoint,
        provider: selectedShipping?.provider ?? null,
      },
      status: "active" as const,
      totals: {
        discount: cart.totals.discount,
        grandTotal: cart.totals.grandTotal,
        shipping: cart.totals.shipping,
        subtotal: cart.totals.subtotal,
      },
    };

    if (existingCart) {
      await req.payload.update({
        collection: "carts",
        data,
        id: existingCart.id,
        req,
      });
    } else {
      await req.payload.create({
        collection: "carts",
        data,
        req,
      });
    }

    return Response.json({
      cart,
      isAuthenticated: true,
    });
  },
  method: "post",
  path: "/sync",
};
