import type { CollectionConfig } from "payload";

import { isAdmin, publicRead } from "../access";
import { storefrontPageSlugField } from "../fields/storefront-page-slug-field";
import { adminGroups, localizedLabel } from "../shared/admin-copy";

export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: publicRead,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ["title", "slug", "updatedAt"],
    group: adminGroups.content,
    useAsTitle: "title",
  },
  labels: {
    plural: localizedLabel("Pages", "Stranice"),
    singular: localizedLabel("Page", "Stranica"),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: localizedLabel("Title", "Naslov"),
    },
    storefrontPageSlugField({
      description: localizedLabel(
        "Create one document for each storefront page you want to link to.",
        "Kreirajte jedan dokument za svaku stranicu trgovine na koju se želite interno povezati.",
      ),
    }),
  ],
};
