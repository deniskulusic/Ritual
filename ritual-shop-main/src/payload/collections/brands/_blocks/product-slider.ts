import type { Block } from "payload";

import { buildLinkFields } from "../../../fields/link";
import { localizedLabel } from "../../../shared/admin-copy";
import { internalLinkRelationTo } from "../../../shared/internal-link-relation-to";

export const ProductSliderBlock: Block = {
  slug: "brand-product-slider",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Product Slider Blocks", "Blokovi klizača proizvoda"),
    singular: localizedLabel("Product Slider", "Klizač proizvoda"),
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
      name: "visual",
      type: "group",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: localizedLabel("Image", "Slika"),
        },
        {
          name: "copy",
          type: "textarea",
          label: localizedLabel("Copy", "Tekst"),
        },
      ],
      label: localizedLabel("Lead visual", "Istaknuti vizual"),
    },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      required: true,
      admin: {
        description: localizedLabel(
          "Select the products shown in this brand slider.",
          "Odaberite proizvode prikazane u ovom klizaču brenda.",
        ),
      },
      label: localizedLabel("Products", "Proizvodi"),
    },
  ],
};
