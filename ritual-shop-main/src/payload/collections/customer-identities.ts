import type { CollectionConfig } from "payload";

import { isAdmin } from "../access";
import { adminGroups, localizedLabel } from "../shared/admin-copy";

export const CustomerIdentities: CollectionConfig = {
  slug: "customer-identities",
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["provider", "providerEmail", "customer", "updatedAt"],
    group: adminGroups.commerce,
    useAsTitle: "providerKey",
  },
  labels: {
    plural: localizedLabel("Accounts", "Računi"),
    singular: localizedLabel("Account", "Račun"),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data?.provider || !data?.providerUserId) {
          return data;
        }

        data.providerKey = `${data.provider}:${data.providerUserId}`;

        return data;
      },
    ],
  },
  fields: [
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      required: true,
      admin: {
        position: "sidebar",
      },
      label: localizedLabel("Customer", "Kupac"),
    },
    {
      name: "provider",
      type: "select",
      required: true,
      label: localizedLabel("Provider", "Pružatelj"),
      options: [
        {
          label: localizedLabel("Facebook", "Facebook"),
          value: "facebook",
        },
        {
          label: localizedLabel("Google", "Google"),
          value: "google",
        },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "providerUserId",
      type: "text",
      required: true,
      label: localizedLabel("Provider user ID", "ID korisnika pružatelja"),
    },
    {
      name: "providerKey",
      type: "text",
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        hidden: true,
      },
      label: localizedLabel("Provider key", "Ključ pružatelja"),
    },
    {
      type: "row",
      fields: [
        {
          name: "providerEmail",
          type: "email",
          label: localizedLabel("Provider email", "E-mail pružatelja"),
        },
        {
          name: "providerEmailVerified",
          type: "checkbox",
          defaultValue: false,
          label: localizedLabel("Provider email verified", "E-mail pružatelja potvrđen"),
        },
      ],
    },
    {
      name: "rawProfile",
      type: "json",
      label: localizedLabel("Raw profile", "Izvorni profil"),
    },
  ],
};
