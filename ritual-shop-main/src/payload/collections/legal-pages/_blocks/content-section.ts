import type { Block } from "payload";

import { localizedLabel } from "../../../shared/admin-copy";

export const ContentSectionBlock: Block = {
  slug: "content-section",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Content Sections", "Sekcije sadržaja"),
    singular: localizedLabel("Content Section", "Sekcija sadržaja"),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: localizedLabel("Title", "Naslov"),
    },
    {
      name: "content",
      type: "textarea",
      required: true,
      label: localizedLabel("Content", "Sadržaj"),
    },
  ],
};
