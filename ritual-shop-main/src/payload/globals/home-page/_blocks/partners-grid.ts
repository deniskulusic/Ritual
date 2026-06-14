import type { Block } from "payload";

import { buildLinkFields } from "../../../fields/link";
import { buildSectionHeadingFields } from "../../../fields/section-heading";
import { localizedLabel } from "../../../shared/admin-copy";
import { internalLinkRelationTo } from "../../../shared/internal-link-relation-to";

export const PartnersGridBlock: Block = {
  slug: "partners-grid",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Partners Grid Blocks", "Blokovi mreže partnera"),
    singular: localizedLabel("Partners Grid", "Mreža partnera"),
  },
  fields: [
    {
      name: "section",
      type: "group",
      fields: buildSectionHeadingFields({
        description: localizedLabel(
          "Heading shown above the partner logos.",
          "Naslov prikazan iznad logotipa partnera.",
        ),
      }),
      label: localizedLabel("Heading", "Naslov"),
    },
    {
      name: "items",
      type: "array",
      minRows: 1,
      maxRows: 24,
      labels: {
        plural: localizedLabel("Logos", "Logotipi"),
        singular: localizedLabel("Logo", "Logotip"),
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
          label: localizedLabel("Name / title", "Naziv / naslov"),
        },
        {
          name: "logo",
          type: "upload",
          relationTo: "media",
          required: true,
          label: localizedLabel("Logo", "Logotip"),
        },
        ...buildLinkFields({
          dbNamePrefix: "logo_link",
          namePrefix: "logo",
          relationTo: internalLinkRelationTo,
        }),
      ],
      label: localizedLabel("Logos", "Logotipi"),
    },
  ],
};
