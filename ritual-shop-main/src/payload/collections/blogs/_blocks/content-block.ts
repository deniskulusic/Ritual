import type { Block } from "payload";

import { localizedLabel } from "../../../shared/admin-copy";

export const ContentBlock: Block = {
  slug: "content-block",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Content Blocks", "Blokovi sadržaja"),
    singular: localizedLabel("Content Block", "Blok sadržaja"),
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
      label: localizedLabel("Image", "Slika"),
    },
    {
      name: "caption",
      type: "text",
      label: localizedLabel("Caption", "Natpis"),
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.image),
      },
    },
    {
      name: "content",
      type: "textarea",
      required: true,
      label: localizedLabel("Content", "Sadržaj"),
    },
  ],
};
