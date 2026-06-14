import type { Block } from "payload";

import { buildLinkFields } from "../../../fields/link";
import { localizedLabel } from "../../../shared/admin-copy";
import { internalLinkRelationTo } from "../../../shared/internal-link-relation-to";

export const FeaturedProductsBlock: Block = {
  slug: "featured-products",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Featured Products Blocks", "Blokovi istaknutih proizvoda"),
    singular: localizedLabel("Featured Products", "Istaknuti proizvodi"),
  },
  fields: [
    {
      name: "section",
      type: "group",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: localizedLabel("Title", "Naslov"),
        },
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
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      required: true,
      admin: {
        description: localizedLabel(
          "Select the products featured in this section.",
          "Odaberite proizvode istaknute u ovoj sekciji.",
        ),
      },
      label: localizedLabel("Products", "Proizvodi"),
    },
  ],
};
