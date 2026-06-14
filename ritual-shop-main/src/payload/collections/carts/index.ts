import type { Access, CollectionConfig } from "payload";

import { adminGroups, localizedLabel } from "../../shared/admin-copy";
import { shippingPickupPointFields } from "../../fields/shipping-pickup-point";
import { checkoutCartEndpoint } from "./_endpoints/checkout";
import { getActiveCartEndpoint } from "./_endpoints/get-active-cart";
import { quoteCartEndpoint } from "./_endpoints/quote-cart";
import { syncCartEndpoint } from "./_endpoints/sync-cart";

const isAdminOrCartOwner: Access = ({ req }) => {
  if (req.user?.collection === "users") {
    return true;
  }

  if (req.user?.collection === "customers" && req.user.id) {
    return {
      customer: {
        equals: req.user.id,
      },
    };
  }

  return false;
};

export const Carts: CollectionConfig = {
  slug: "carts",
  access: {
    create: () => true,
    delete: isAdminOrCartOwner,
    read: isAdminOrCartOwner,
    update: isAdminOrCartOwner,
  },
  admin: {
    defaultColumns: ["status", "customer", "guestEmail", "updatedAt"],
    group: adminGroups.commerce,
    useAsTitle: "status",
  },
  endpoints: [getActiveCartEndpoint, quoteCartEndpoint, syncCartEndpoint, checkoutCartEndpoint],
  labels: {
    plural: localizedLabel("Carts", "Košarice"),
    singular: localizedLabel("Cart", "Košarica"),
  },
  fields: [
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "active",
      options: [
        {
          label: localizedLabel("Active", "Aktivna"),
          value: "active",
        },
        {
          label: localizedLabel("Converted to Order", "Pretvorena u narudžbu"),
          value: "converted",
        },
        {
          label: localizedLabel("Abandoned", "Napuštena"),
          value: "abandoned",
        },
      ],
      admin: {
        position: "sidebar",
      },
      label: localizedLabel("Status", "Status"),
    },
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      admin: {
        position: "sidebar",
      },
      label: localizedLabel("Customer", "Kupac"),
    },
    {
      name: "guestEmail",
      type: "email",
      admin: {
        position: "sidebar",
      },
      label: localizedLabel("Guest email", "E-mail gosta"),
    },
    {
      type: "tabs",
      tabs: [
        {
          label: localizedLabel("Items", "Stavke"),
          fields: [
            {
              name: "items",
              type: "array",
              label: localizedLabel("Items", "Stavke"),
              labels: {
                plural: localizedLabel("Items", "Stavke"),
                singular: localizedLabel("Item", "Stavka"),
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "product",
                      type: "relationship",
                      relationTo: "products",
                      required: true,
                      label: localizedLabel("Product", "Proizvod"),
                    },
                    {
                      name: "quantity",
                      type: "number",
                      required: true,
                      min: 1,
                      label: localizedLabel("Quantity", "Količina"),
                    },
                    {
                      name: "unitPrice",
                      type: "number",
                      min: 0,
                      label: localizedLabel("Unit price", "Jedinična cijena"),
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: localizedLabel("Checkout", "Naplata"),
          fields: [
            {
              name: "promoCode",
              type: "text",
              label: localizedLabel("Promo code", "Promo kod"),
            },
            {
              name: "shipping",
              type: "group",
              label: localizedLabel("Shipping", "Dostava"),
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "provider",
                      type: "text",
                      label: localizedLabel("Provider", "Pružatelj"),
                    },
                    {
                      name: "method",
                      type: "text",
                      label: localizedLabel("Method", "Način"),
                    },
                    {
                      name: "label",
                      type: "text",
                      label: localizedLabel("Label", "Naziv"),
                    },
                    {
                      name: "kind",
                      type: "text",
                      label: localizedLabel("Kind", "Tip"),
                    },
                    {
                      name: "price",
                      type: "number",
                      min: 0,
                      label: localizedLabel("Price", "Cijena"),
                    },
                  ],
                },
                {
                  name: "pickupPoint",
                  type: "group",
                  label: localizedLabel("Pickup point", "Točka preuzimanja"),
                  fields: shippingPickupPointFields(),
                },
              ],
            },
            {
              name: "payment",
              type: "group",
              label: localizedLabel("Payment", "Plaćanje"),
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "provider",
                      type: "text",
                      label: localizedLabel("Provider", "Pružatelj"),
                    },
                    {
                      name: "method",
                      type: "text",
                      label: localizedLabel("Method", "Način"),
                    },
                    {
                      name: "status",
                      type: "text",
                      label: localizedLabel("Status", "Status"),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "totals",
      type: "group",
      admin: {
        position: "sidebar",
      },
      label: localizedLabel("Totals", "Ukupno"),
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "subtotal",
              type: "number",
              min: 0,
              label: localizedLabel("Subtotal", "Međuzbroj"),
            },
            {
              name: "discount",
              type: "number",
              min: 0,
              label: localizedLabel("Discount", "Popust"),
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "shipping",
              type: "number",
              min: 0,
              label: localizedLabel("Shipping", "Dostava"),
            },
            {
              name: "grandTotal",
              type: "number",
              min: 0,
              label: localizedLabel("Grand total", "Ukupno za plaćanje"),
            },
          ],
        },
      ],
    },
  ],
};
