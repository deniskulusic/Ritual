import type { Block } from "payload";

import { buildSectionHeadingFields } from "../../../fields/section-heading";
import { localizedLabel } from "../../../shared/admin-copy";

export const IconCardGridBlock: Block = {
  slug: "icon-card-grid",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Icon Card Grid Blocks", "Blokovi mreže kartica s ikonama"),
    singular: localizedLabel("Icon Card Grid", "Mreža kartica s ikonama"),
  },
  fields: [
    {
      name: "section",
      type: "group",
      fields: buildSectionHeadingFields({
        description: localizedLabel(
          "Heading shown above the value cards.",
          "Naslov prikazan iznad kartica s prednostima.",
        ),
      }),
      label: localizedLabel("Heading", "Naslov"),
    },
    {
      name: "items",
      type: "array",
      minRows: 1,
      maxRows: 8,
      labels: {
        plural: localizedLabel("Items", "Stavke"),
        singular: localizedLabel("Item", "Stavka"),
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
          name: "icon",
          type: "upload",
          relationTo: "media",
          required: true,
          label: localizedLabel("Icon", "Ikona"),
        },
      ],
      label: localizedLabel("Items", "Stavke"),
    },
  ],
};
