import type { CollectionConfig } from "payload";

import { isAdmin, publicRead } from "../../access";
import { legalSectionBlocks } from "./_blocks";
import { storefrontPageSlugField } from "../../fields/storefront-page-slug-field";
import { adminGroups, localizedLabel } from "../../shared/admin-copy";

export const LegalPages: CollectionConfig = {
  slug: "legal-pages",
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
    plural: localizedLabel("Legal", "Pravno"),
    singular: localizedLabel("Legal Page", "Pravna stranica"),
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: localizedLabel("Content", "Sadržaj"),
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: localizedLabel("Title", "Naslov"),
            },
            {
              name: "sections",
              type: "blocks",
              blocks: legalSectionBlocks,
              required: true,
              admin: {
                initCollapsed: true,
              },
              label: localizedLabel("Sections", "Sekcije"),
              labels: {
                plural: localizedLabel("Sections", "Sekcije"),
                singular: localizedLabel("Section", "Sekcija"),
              },
            },
          ],
        },
      ],
    },
    storefrontPageSlugField({
      description: localizedLabel(
        "Keep one document for each live legal page.",
        "Zadržite jedan dokument za svaku aktivnu pravnu stranicu.",
      ),
    }),
  ],
};
