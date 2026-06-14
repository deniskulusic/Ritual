import type { Block } from "payload";

import { buildSectionHeadingFields } from "../../../fields/section-heading";
import { localizedLabel } from "../../../shared/admin-copy";

export const HowToOrderBlock: Block = {
  slug: "how-to-order",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("How To Order Blocks", "Blokovi kako naručiti"),
    singular: localizedLabel("How To Order", "Kako naručiti"),
  },
  fields: [
    {
      name: "section",
      type: "group",
      fields: buildSectionHeadingFields({
        description: localizedLabel(
          "Heading shown above the order steps.",
          "Naslov prikazan iznad koraka narudžbe.",
        ),
      }),
      label: localizedLabel("Heading", "Naslov"),
    },
    {
      name: "steps",
      type: "array",
      minRows: 1,
      maxRows: 6,
      labels: {
        plural: localizedLabel("Steps", "Koraci"),
        singular: localizedLabel("Step", "Korak"),
      },
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "./_components/payload-array-row-label.tsx#PayloadArrayRowLabel",
        },
      },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: localizedLabel("Title", "Naslov"),
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
          label: localizedLabel("Image", "Slika"),
        },
      ],
      label: localizedLabel("Steps", "Koraci"),
    },
  ],
};
