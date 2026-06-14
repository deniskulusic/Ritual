import type { Block } from "payload";

import { buildLinkFields } from "../../../fields/link";
import { localizedLabel } from "../../../shared/admin-copy";
import { internalLinkRelationTo } from "../../../shared/internal-link-relation-to";

export const StoryPairBlock: Block = {
  slug: "story-pair",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Story Pair Blocks", "Blokovi para priča"),
    singular: localizedLabel("Story Pair", "Par priča"),
  },
  fields: [
    {
      name: "stories",
      type: "array",
      labels: {
        plural: localizedLabel("Stories", "Priče"),
        singular: localizedLabel("Story", "Priča"),
      },
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "./_components/payload-array-row-label.tsx#PayloadArrayRowLabel",
        },
      },
      fields: [
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
          name: "description",
          type: "textarea",
          required: true,
          label: localizedLabel("Description", "Opis"),
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
          label: localizedLabel("Image", "Slika"),
        },
        {
          name: "ctaMode",
          type: "radio",
          label: localizedLabel("CTA", "CTA"),
          defaultValue: "enabled",
          admin: {
            layout: "horizontal",
          },
          options: [
            {
              label: localizedLabel("Hidden", "Skriveno"),
              value: "hidden",
            },
            {
              label: localizedLabel("Enabled", "Omogućeno"),
              value: "enabled",
            },
          ],
        },
        {
          name: "ctaLabel",
          type: "text",
          admin: {
            condition: (_, siblingData) => siblingData?.ctaMode === "enabled",
          },
          label: localizedLabel("Button label", "Oznaka gumba"),
        },
        ...buildLinkFields({
          allowEmpty: true,
          condition: (_, siblingData) => siblingData?.ctaMode === "enabled",
          dbNamePrefix: "cta_link",
          namePrefix: "cta",
          relationTo: internalLinkRelationTo,
        }),
      ],
      label: localizedLabel("Stories", "Priče"),
    },
  ],
};
