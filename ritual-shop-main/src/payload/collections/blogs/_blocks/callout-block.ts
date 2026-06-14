import type { Block } from "payload";

import { localizedLabel } from "../../../shared/admin-copy";

export const CalloutBlock: Block = {
  slug: "callout-block",
  admin: {
    disableBlockName: true,
  },
  labels: {
    plural: localizedLabel("Callouts", "Istaknuti tekstovi"),
    singular: localizedLabel("Callout", "Istaknuti tekst"),
  },
  fields: [
    {
      name: "content",
      type: "textarea",
      required: true,
      label: localizedLabel("Content", "Sadržaj"),
    },
  ],
};
