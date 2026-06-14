import type { Block } from "payload";

import { buildLinkFields } from "../../../fields/link";
import { buildSectionHeadingFields } from "../../../fields/section-heading";
import { localizedLabel } from "../../../shared/admin-copy";
import { internalLinkRelationTo } from "../../../shared/internal-link-relation-to";

export const CategoryGridBlock: Block = {
  slug: "category-grid",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Category Grid Blocks", "Blokovi mreže kategorija"),
    singular: localizedLabel("Category Grid", "Mreža kategorija"),
  },
  fields: [
    {
      name: "section",
      type: "group",
      fields: [
        ...buildSectionHeadingFields({
          description: localizedLabel(
            "Intro heading for the category grid.",
            "Uvodni naslov za mrežu kategorija.",
          ),
        }),
        {
          name: "browseLabel",
          type: "text",
          required: true,
          label: localizedLabel("View all label", "Oznaka Prikaži sve"),
        },
        ...buildLinkFields({
          dbNamePrefix: "browse_link",
          namePrefix: "browse",
          relationTo: internalLinkRelationTo,
        }),
      ],
      label: localizedLabel("Heading", "Naslov"),
    },
    {
      name: "items",
      type: "array",
      minRows: 1,
      maxRows: 12,
      labels: {
        plural: localizedLabel("Categories", "Kategorije"),
        singular: localizedLabel("Category", "Kategorija"),
      },
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "./_components/payload-array-row-label.tsx#PayloadArrayRowLabel",
        },
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          label: localizedLabel("Name", "Naziv"),
        },
        {
          type: "row",
          fields: [
            {
              name: "backgroundImage",
              type: "upload",
              relationTo: "media",
              required: true,
              label: localizedLabel("Background image", "Pozadinska slika"),
              admin: {
                width: "50%",
              },
            },
            {
              name: "productImage",
              type: "upload",
              relationTo: "media",
              required: true,
              label: localizedLabel("Product image", "Slika proizvoda"),
              admin: {
                width: "50%",
              },
            },
          ],
        },
        ...buildLinkFields({
          dbNamePrefix: "card_link",
          namePrefix: "card",
          relationTo: internalLinkRelationTo,
        }),
      ],
      label: localizedLabel("Categories", "Kategorije"),
    },
  ],
};
