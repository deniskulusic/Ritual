import type { Block } from "payload";

import { buildLinkFields } from "../../../fields/link";
import { localizedLabel } from "../../../shared/admin-copy";
import { internalLinkRelationTo } from "../../../shared/internal-link-relation-to";

export const TileGridBlock: Block = {
  slug: "brand-tile-grid",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Tile Grid Blocks", "Blokovi mreže pločica"),
    singular: localizedLabel("Tile Grid", "Mreža pločica"),
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
          admin: {
            description: localizedLabel(
              "Heading shown above the brand tiles.",
              "Naslov prikazan iznad pločica brenda.",
            ),
          },
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
      name: "tiles",
      type: "array",
      minRows: 1,
      maxRows: 12,
      labels: {
        plural: localizedLabel("Tiles", "Pločice"),
        singular: localizedLabel("Tile", "Pločica"),
      },
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: "./_components/payload-array-row-label.tsx#PayloadArrayRowLabel",
        },
      },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          label: localizedLabel("Label", "Oznaka"),
        },
        {
          name: "backgroundImage",
          type: "upload",
          relationTo: "media",
          required: true,
          label: localizedLabel("Background image", "Pozadinska slika"),
        },
        ...buildLinkFields({
          dbNamePrefix: "card_link",
          namePrefix: "card",
          relationTo: internalLinkRelationTo,
        }),
      ],
      label: localizedLabel("Tiles", "Pločice"),
    },
  ],
};
