import type { Block } from "payload";

import { buildLinkFields } from "../../../fields/link";
import { buildSectionHeadingFields } from "../../../fields/section-heading";
import { localizedLabel } from "../../../shared/admin-copy";
import { internalLinkRelationTo } from "../../../shared/internal-link-relation-to";

export const OfficeShopBlock: Block = {
  slug: "office-shop",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Office Shop Blocks", "Blokovi Office Shop"),
    singular: localizedLabel("Office Shop", "Office Shop"),
  },
  fields: [
    {
      name: "section",
      type: "group",
      fields: buildSectionHeadingFields({
        description: localizedLabel(
          "Heading shown above the office feature.",
          "Naslov prikazan iznad office sekcije.",
        ),
      }),
      label: localizedLabel("Heading", "Naslov"),
    },
    {
      name: "featureCard",
      type: "group",
      fields: [
        {
          name: "backgroundImage",
          type: "upload",
          relationTo: "media",
          required: true,
          label: localizedLabel("Background image", "Pozadinska slika"),
        },
        {
          type: "row",
          fields: [
            {
              name: "eyebrow",
              type: "text",
              label: localizedLabel("Eyebrow", "Nadnaslov"),
              admin: {
                width: "35%",
              },
            },
            {
              name: "title",
              type: "text",
              required: true,
              label: localizedLabel("Title", "Naslov"),
              admin: {
                width: "65%",
              },
            },
          ],
        },
        {
          name: "linkLabel",
          type: "text",
          required: true,
          label: localizedLabel("Button label", "Oznaka gumba"),
        },
        ...buildLinkFields({
          dbNamePrefix: "feature_link",
          namePrefix: "feature",
          relationTo: internalLinkRelationTo,
        }),
      ],
      label: localizedLabel("Feature", "Istaknuto"),
    },
    {
      name: "products",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      required: true,
      admin: {
        description: localizedLabel(
          "Select the products shown alongside the office feature.",
          "Odaberite proizvode prikazane uz office sekciju.",
        ),
      },
      label: localizedLabel("Products", "Proizvodi"),
    },
  ],
};
