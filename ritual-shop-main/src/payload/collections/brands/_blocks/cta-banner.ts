import type { Block } from "payload";

import { buildLinkFields } from "../../../fields/link";
import { localizedLabel } from "../../../shared/admin-copy";
import { internalLinkRelationTo } from "../../../shared/internal-link-relation-to";

export const CtaBannerBlock: Block = {
  slug: "brand-cta-banner",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("CTA Banner Blocks", "Blokovi CTA bannera"),
    singular: localizedLabel("CTA Banner", "CTA banner"),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: localizedLabel("Title", "Naslov"),
    },
    {
      name: "subtitle",
      type: "textarea",
      required: true,
      label: localizedLabel("Subtitle", "Podnaslov"),
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: localizedLabel("Background image", "Pozadinska slika"),
    },
    {
      name: "actionLabel",
      type: "text",
      label: localizedLabel("Action label", "Oznaka akcije"),
    },
    ...buildLinkFields({
      allowEmpty: true,
      dbNamePrefix: "action_link",
      namePrefix: "action",
      relationTo: internalLinkRelationTo,
    }),
  ],
};
