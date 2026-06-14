import type { GlobalConfig } from "payload";

import { buildLinkFields } from "../fields/link";
import { adminGroups, localizedLabel } from "../shared/admin-copy";
import { internalLinkRelationTo } from "../shared/internal-link-relation-to";

export const Footer: GlobalConfig = {
  slug: "footer",
  admin: {
    group: adminGroups.content,
  },
  fields: [
    {
      name: "topNavLinks",
      type: "array",
      minRows: 1,
      label: localizedLabel("Primary Links", "Primarne poveznice"),
      labels: {
        plural: localizedLabel("Primary Links", "Primarne poveznice"),
        singular: localizedLabel("Primary Link", "Primarna poveznica"),
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
        ...buildLinkFields({
          dbNamePrefix: "link",
          namePrefix: "link",
          relationTo: internalLinkRelationTo,
        }),
      ],
    },
    {
      name: "linkColumns",
      type: "array",
      minRows: 1,
      maxRows: 6,
      label: localizedLabel("Link Columns", "Stupci poveznica"),
      labels: {
        plural: localizedLabel("Link Columns", "Stupci poveznica"),
        singular: localizedLabel("Link Column", "Stupac poveznica"),
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: "links",
          type: "array",
          minRows: 1,
          labels: {
            plural: localizedLabel("Links", "Poveznice"),
            singular: localizedLabel("Link", "Poveznica"),
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
            ...buildLinkFields({
              dbNamePrefix: "link",
              namePrefix: "link",
              relationTo: internalLinkRelationTo,
            }),
          ],
        },
      ],
    },
    {
      name: "copyright",
      type: "text",
      required: true,
      label: localizedLabel("Copyright", "Autorska prava"),
    },
  ],
  label: localizedLabel("Footer", "Podnožje"),
};
