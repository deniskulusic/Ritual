import type { CollectionConfig } from "payload";

import { isAdmin, isAdminOrCustomerSelf } from "../access";
import { addressFields } from "../fields/address";
import { adminGroups, localizedLabel } from "../shared/admin-copy";

export const Customers: CollectionConfig = {
  slug: "customers",
  access: {
    create: () => true,
    delete: isAdmin,
    read: isAdminOrCustomerSelf,
    update: isAdminOrCustomerSelf,
  },
  admin: {
    defaultColumns: ["email", "firstName", "lastName", "phone", "updatedAt"],
    group: adminGroups.commerce,
    useAsTitle: "email",
  },
  labels: {
    plural: localizedLabel("Customers", "Kupci"),
    singular: localizedLabel("Customer", "Kupac"),
  },
  auth: true,
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "firstName",
          type: "text",
          required: true,
          label: localizedLabel("First name", "Ime"),
        },
        {
          name: "lastName",
          type: "text",
          required: true,
          label: localizedLabel("Last name", "Prezime"),
        },
      ],
    },
    {
      name: "phone",
      type: "text",
      admin: {
        position: "sidebar",
      },
      label: localizedLabel("Phone", "Telefon"),
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
              fields: addressFields({ required: false }),
              label: localizedLabel("Billing address", "Adresa za naplatu"),
            },
            {
              name: "shippingAddress",
              type: "group",
              fields: addressFields({ required: false }),
              label: localizedLabel("Shipping address", "Adresa dostave"),
            },
            {
              name: "savedAddresses",
              type: "array",
              labels: {
                plural: localizedLabel("Saved Addresses", "Spremljene adrese"),
                singular: localizedLabel("Saved Address", "Spremljena adresa"),
              },
              fields: addressFields({ includeDefaultFlag: true, required: false }),
              label: localizedLabel("Saved addresses", "Spremljene adrese"),
            },
          ],
        },
        {
          label: localizedLabel("Preferences", "Postavke"),
          fields: [
            {
              name: "marketingOptIn",
              type: "checkbox",
              defaultValue: false,
              label: localizedLabel("Marketing opt-in", "Privola za marketing"),
            },
            {
              name: "notes",
              type: "textarea",
              label: localizedLabel("Notes", "Bilješke"),
            },
          ],
        },
      ],
    },
  ],
};
