import type { Endpoint } from "payload";

import type { Cart } from "../../../../../payload-types";
import { normalizePickupPoint } from "../shipping-contract";
import { quoteCart } from "../quote-cart";

async function getActiveCart(req: Parameters<Endpoint["handler"]>[0]) {
  if (req.user?.collection !== "customers") {
    return null;
  }

  const result = await req.payload.find({
    collection: "carts",
    depth: 1,
    limit: 1,
    req,
    sort: "-updatedAt",
    where: {
      and: [
        {
          customer: {
            equals: req.user.id,
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

function toCartInput(cart: Cart) {
  return {
    items:
      cart.items
        ?.map((item) => {
          if (!item.product || typeof item.product !== "object") {
            return null;
          }

          return {
            productSlug: item.product.slug,
            quantity: item.quantity,
          };
        })
        .filter((item): item is { productSlug: string; quantity: number } => item !== null) ?? [],
    promoCode: typeof cart.promoCode === "string" ? cart.promoCode : null,
    shippingOptionId: cart.shipping?.method ?? null,
    shippingPickupPoint: normalizePickupPoint(cart.shipping?.pickupPoint),
  };
}

export const getActiveCartEndpoint: Endpoint = {
  handler: async (req) => {
    const activeCart = await getActiveCart(req);

    if (req.user?.collection !== "customers") {
      return Response.json({
        cart: null,
        isAuthenticated: false,
      });
    }

    if (!activeCart) {
      return Response.json({
        cart: null,
        isAuthenticated: true,
      });
    }

    const cart = await quoteCart(req, toCartInput(activeCart));

    return Response.json({
      cart,
      isAuthenticated: true,
    });
  },
  method: "get",
  path: "/active",
};
