import { randomUUID } from "node:crypto";

import type { CollectionConfig } from "payload";

import type { Order } from "../../../../payload-types";
import { isAdmin, isAdminOrOrderOwner } from "../../access";
import { addressFields } from "../../fields/address";
import { shippingPickupPointFields } from "../../fields/shipping-pickup-point";
import { syncMoralisOrder } from "./_moralis/sync-order";
import { syncOrderShipment } from "./_shipping/create-order-shipment";
import { adminGroups, localizedLabel } from "../../shared/admin-copy";

const createOrderNumber = () =>
  `RIT-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;

export const Orders: CollectionConfig = {
  slug: "orders",
  access: {
    create: () => true,
    delete: isAdmin,
    read: isAdminOrOrderOwner,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["orderNumber", "status", "customer", "guestEmail", "updatedAt"],
    group: adminGroups.commerce,
    useAsTitle: "orderNumber",
  },
  labels: {
    plural: localizedLabel("Orders", "Narudžbe"),
    singular: localizedLabel("Order", "Narudžba"),
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        await syncMoralisOrder(req, doc as Order, previousDoc as Order | undefined);
        await syncOrderShipment(req, doc as Order, previousDoc as Order | undefined);
        return doc;
      },
    ],
    beforeValidate: [
      ({ data }) => {
        if (!data) {
          return data;
        }

        if (!data.orderNumber) {
          data.orderNumber = createOrderNumber();
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        {
          label: localizedLabel("Pending", "Na čekanju"),
          value: "pending",
        },
        {
          label: localizedLabel("Awaiting Payment", "Čeka uplatu"),
          value: "awaiting-payment",
        },
        {
          label: localizedLabel("Paid", "Plaćeno"),
          value: "paid",
        },
        {
          label: localizedLabel("Processing", "U obradi"),
          value: "processing",
        },
        {
          label: localizedLabel("Fulfilled", "Ispunjeno"),
          value: "fulfilled",
        },
        {
          label: localizedLabel("Completed", "Dovršeno"),
          value: "completed",
        },
        {
          label: localizedLabel("Cancelled", "Otkazano"),
          value: "cancelled",
        },
        {
          label: localizedLabel("Refunded", "Refundirano"),
          value: "refunded",
        },
      ],
      admin: {
        position: "sidebar",
      },
      label: localizedLabel("Status", "Status"),
    },
    {
      name: "orderNumber",
      type: "text",
      unique: true,
      required: true,
      admin: {
        position: "sidebar",
        readOnly: true,
      },
      label: localizedLabel("Order number", "Broj narudžbe"),
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
              label: localizedLabel("Grand total", "Ukupno za naplatu"),
            },
          ],
        },
      ],
    },
    {
      name: "items",
      type: "array",
      required: true,
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
              label: localizedLabel("Product", "Proizvod"),
            },
            {
              name: "title",
              type: "text",
              required: true,
              label: localizedLabel("Title", "Naziv"),
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "productType",
              type: "text",
              label: localizedLabel("Product type", "Vrsta proizvoda"),
            },
            {
              name: "brandName",
              type: "text",
              label: localizedLabel("Brand", "Brend"),
            },
            {
              name: "sku",
              type: "text",
              label: localizedLabel("SKU", "SKU"),
            },
            {
              name: "itemID",
              type: "text",
              label: localizedLabel("Item ID", "ID artikla"),
            },
          ],
        },
        {
          type: "row",
          fields: [
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
              required: true,
              min: 0,
              label: localizedLabel("Unit price", "Jedinična cijena"),
            },
            {
              name: "lineTotal",
              type: "number",
              required: true,
              min: 0,
              label: localizedLabel("Line total", "Ukupno stavke"),
            },
            {
              name: "discountTotal",
              type: "number",
              min: 0,
              label: localizedLabel("Discount total", "Ukupni popust stavke"),
            },
            {
              name: "discountPercent",
              type: "number",
              min: 0,
              label: localizedLabel("Discount percent", "Postotak popusta"),
            },
            {
              name: "finalLineTotal",
              type: "number",
              min: 0,
              label: localizedLabel("Final line total", "Konačni ukupni iznos stavke"),
            },
          ],
        },
      ],
    },
    {
      name: "promotion",
      type: "group",
      label: localizedLabel("Promotion", "Promocija"),
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "code",
              type: "text",
              label: localizedLabel("Code", "Kod"),
            },
            {
              name: "name",
              type: "text",
              label: localizedLabel("Name", "Naziv"),
            },
            {
              name: "scope",
              type: "text",
              label: localizedLabel("Scope", "Opseg"),
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "discountType",
              type: "text",
              label: localizedLabel("Discount type", "Vrsta popusta"),
            },
            {
              name: "discountValue",
              type: "number",
              min: 0,
              label: localizedLabel("Discount value", "Vrijednost popusta"),
            },
            {
              name: "discount",
              type: "number",
              min: 0,
              label: localizedLabel("Discount total", "Ukupni popust"),
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "eligibleSubtotal",
              type: "number",
              min: 0,
              label: localizedLabel("Eligible subtotal", "Dopušteni međuzbroj"),
            },
            {
              name: "description",
              type: "textarea",
              label: localizedLabel("Description", "Opis"),
            },
          ],
        },
      ],
    },
    {
      type: "tabs",
      tabs: [
        {
          label: localizedLabel("Addresses", "Adrese"),
          fields: [
            {
              name: "billingAddress",
              type: "group",
              fields: addressFields(),
              label: localizedLabel("Billing address", "Adresa za naplatu"),
            },
            {
              name: "shippingAddress",
              type: "group",
              fields: addressFields(),
              label: localizedLabel("Shipping address", "Adresa dostave"),
            },
          ],
        },
        {
          label: localizedLabel("Payment", "Plaćanje"),
          fields: [
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
                      name: "status",
                      type: "text",
                      label: localizedLabel("Status", "Status"),
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "externalID",
                      type: "text",
                      label: localizedLabel("External ID", "Vanjski ID"),
                    },
                    {
                      name: "amount",
                      type: "number",
                      min: 0,
                      label: localizedLabel("Amount", "Iznos"),
                    },
                  ],
                },
                {
                  name: "pickupPoint",
                  type: "group",
                  label: localizedLabel("Pickup point", "Točka preuzimanja"),
                  fields: shippingPickupPointFields(),
                },
                {
                  name: "raw",
                  type: "json",
                  label: localizedLabel("Raw data", "Izvorni podaci"),
                },
              ],
            },
          ],
        },
        {
          label: localizedLabel("Shipping", "Dostava"),
          fields: [
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
                      name: "status",
                      type: "text",
                      label: localizedLabel("Status", "Status"),
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "price",
                      type: "number",
                      min: 0,
                      label: localizedLabel("Price", "Cijena"),
                    },
                    {
                      name: "trackingCode",
                      type: "text",
                      label: localizedLabel("Tracking code", "Kod za praćenje"),
                    },
                  ],
                },
                {
                  name: "pickupPoint",
                  type: "group",
                  label: localizedLabel("Pickup point", "Točka preuzimanja"),
                  fields: shippingPickupPointFields(),
                },
                {
                  name: "raw",
                  type: "json",
                  label: localizedLabel("Raw data", "Izvorni podaci"),
                },
              ],
            },
          ],
        },
        {
          label: localizedLabel("Moralis", "Moralis"),
          fields: [
            {
              name: "moralis",
              type: "group",
              label: localizedLabel("Moralis", "Moralis"),
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      name: "status",
                      type: "text",
                      label: localizedLabel("Status", "Status"),
                    },
                    {
                      name: "customerType",
                      type: "text",
                      label: localizedLabel("Customer type", "Vrsta kupca"),
                    },
                    {
                      name: "customerKey",
                      type: "text",
                      label: localizedLabel("Customer key", "Ključ kupca"),
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "sifPar",
                      type: "number",
                      label: localizedLabel("SIF_PAR", "SIF_PAR"),
                    },
                    {
                      name: "sifPj",
                      type: "number",
                      label: localizedLabel("SIF_PJ", "SIF_PJ"),
                    },
                    {
                      name: "intBr",
                      type: "number",
                      label: localizedLabel("INT_BR", "INT_BR"),
                    },
                    {
                      name: "brDok",
                      type: "text",
                      label: localizedLabel("BR_DOK", "BR_DOK"),
                    },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    {
                      name: "syncedAt",
                      type: "date",
                      label: localizedLabel("Synced at", "Sinkronizirano u"),
                    },
                    {
                      name: "failedAt",
                      type: "date",
                      label: localizedLabel("Failed at", "Neuspjelo u"),
                    },
                  ],
                },
                {
                  name: "lastError",
                  type: "textarea",
                  label: localizedLabel("Last error", "Zadnja greška"),
                },
                {
                  name: "raw",
                  type: "json",
                  label: localizedLabel("Raw data", "Izvorni podaci"),
                },
              ],
            },
          ],
        },
        {
          label: localizedLabel("Timeline", "Tijek"),
          fields: [
            {
              name: "notes",
              type: "textarea",
              label: localizedLabel("Notes", "Bilješke"),
            },
            {
              name: "statusTimeline",
              type: "array",
              label: localizedLabel("Status timeline", "Tijek statusa"),
              labels: {
                plural: localizedLabel("Timeline Entries", "Zapisi tijeka"),
                singular: localizedLabel("Timeline Entry", "Zapis tijeka"),
              },
              fields: [
                {
                  name: "status",
                  type: "text",
                  required: true,
                  label: localizedLabel("Status", "Status"),
                },
                {
                  name: "at",
                  type: "date",
                  required: true,
                  label: localizedLabel("At", "Vrijeme"),
                },
                {
                  name: "note",
                  type: "textarea",
                  label: localizedLabel("Note", "Bilješka"),
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
