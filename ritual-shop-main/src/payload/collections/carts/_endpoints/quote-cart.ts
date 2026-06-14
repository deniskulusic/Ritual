import type { Endpoint } from "payload";

import { quoteCart, readCartInput } from "../quote-cart";

export const quoteCartEndpoint: Endpoint = {
  handler: async (req) => {
    const input = await readCartInput(req);
    const cart = await quoteCart(req, input);

    return Response.json({ cart });
  },
  method: "post",
  path: "/quote",
};
