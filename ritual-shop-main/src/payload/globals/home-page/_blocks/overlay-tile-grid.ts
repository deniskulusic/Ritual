import type { Block } from "payload";

import { buildLinkFields } from "../../../fields/link";
import { localizedLabel } from "../../../shared/admin-copy";
import { internalLinkRelationTo } from "../../../shared/internal-link-relation-to";

export const OverlayTileGridBlock: Block = {
  slug: "overlay-tile-grid",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Overlay Tile Grid Blocks", "Blokovi mreže preklopljenih pločica"),
    singular: localizedLabel("Overlay Tile Grid", "Mreža preklopljenih pločica"),
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
              "Heading shown above the category tiles directly below the hero.",
              "Naslov prikazan iznad kategorija neposredno ispod hero dijela.",
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
      label: localizedLabel("Categories", "Kategorije"),
    },
  ],
};
